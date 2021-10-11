/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import type { IpcRendererEvent } from "electron";
import { RendererOnly } from "../../core/renderer/decorators";
import { getIpcRenderer } from "../../core/renderer/renderer";
import { IpcContractBase, IpcEventContractBase, IpcEventHandler, IpcEventNames, IpcEventParameters, IpcMessageNames, IpcMessageParameters, IpcMessageReturnType, IpcMessageSyncReturnType } from "../common/ipc";

/**
 * A renderer-thread IPC Client that connects to an IPC server on the main thread. Messages are sent asynchronously.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcClientDecorators` instead.
 */
@RendererOnly
export class IpcClient<TContract extends IpcContractBase<TContract>> {
    #ipcRenderer = getIpcRenderer(/*throwIfMissing*/ true);
    #disposed = false;

    constructor(
        readonly channel: string
    ) {
    }

    send<K extends IpcMessageNames<TContract>>(message: K, ...args: IpcMessageParameters<TContract, K>): Promise<IpcMessageReturnType<TContract, K>> {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return this.#ipcRenderer.invoke(`message:${this.channel}`, message, ...args);
    }

    [Disposable.dispose]() {
        this.#disposed = true;
    }
}

/**
 * A renderer-thread IPC Client that connects to an IPC server on the main thread. Messages are sent synchronously.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcClientDecorators` instead.
 */
@RendererOnly
export class IpcClientSync<TContract extends IpcContractBase<TContract>, TEvents extends IpcEventContractBase<TEvents> = never> {
    #ipcRenderer = getIpcRenderer(/*throwIfMissing*/ true);
    #disposed = false;

    constructor(
        readonly channel: string
    ) {
    }
   
    sendSync<K extends IpcMessageNames<TContract>>(message: K, ...args: IpcMessageParameters<TContract, K>): IpcMessageSyncReturnType<TContract, K> {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return this.#ipcRenderer.sendSync(`sync.message:${this.channel}`, message, ...args);
    }

    [Disposable.dispose]() {
        this.#disposed = true;
    }
}

/**
 * A renderer-thread IPC Client that connects to an IPC server on the main thread to listen for IPC server events.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcClientDecorators` instead.
 */
@RendererOnly
export class IpcClientEventObserver<TEvents extends IpcEventContractBase<TEvents>> {
    #ipcRenderer = getIpcRenderer(/*throwIfMissing*/ true);
    #handlers = new Map<IpcEventNames<TEvents>, Set<IpcEventHandler<TEvents, any>>>();
    #handler = <K extends IpcEventNames<TEvents>>(event: IpcRendererEvent, eventName: K, ...args: any[]) => {
        // NOTE: only handle events from the main process
        if (event.senderId !== 0) return;
        this.emit(eventName, ...(args as IpcEventParameters<TEvents, K>));
    };
    #subscription: { unsubscribe(): void } | undefined;

    constructor(
        readonly channel: string
    ) {
        this.#subscription = this.#ipcRenderer.on(`event:${this.channel}`, this.#handler);
    }

    emit<K extends IpcEventNames<TEvents>>(eventName: K, ...args: IpcEventParameters<TEvents, K>) {
        if (!this.#subscription) throw new ReferenceError("Object is disposed");
        const handlers = this.#handlers.get(eventName);
        if (handlers?.size) {
            for (const handler of handlers) {
                handler(...args);
            }
            return true;
        }
        return false;
    }

    on<K extends IpcEventNames<TEvents>>(eventName: K, handler: IpcEventHandler<TEvents, K>) {
        if (!this.#subscription) throw new ReferenceError("Object is disposed");
        let handlers = this.#handlers.get(eventName);
        if (!handlers) this.#handlers.set(eventName, handlers = new Set());
        const firstHandler = handlers.size === 0;
        handlers.add(handler);
        if (firstHandler) {
            this.#ipcRenderer.sendSync(`event.subscribe:${this.channel}`, eventName);
        }
        return this;
    }

    off<K extends IpcEventNames<TEvents>>(eventName: K, handler: IpcEventHandler<TEvents, K>) {
        if (!this.#subscription) throw new ReferenceError("Object is disposed");
        const handlers = this.#handlers.get(eventName);
        if (handlers?.delete(handler) && handlers.size === 0) {
            this.#ipcRenderer.sendSync(`event.unsubscribe:${this.channel}`, eventName);
        }
        return this;
    }

    [Disposable.dispose]() {
        this.#subscription?.unsubscribe();
        this.#subscription = undefined;
        for (const eventName of this.#handlers.keys()) {
            this.#ipcRenderer.sendSync(`event.unsubscribe:${this.channel}`, eventName);
        }
        this.#handlers.clear();
    }
}
