import { Disposable } from "@esfx/disposable";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { RendererOnly } from "../../core/renderer/decorators";
import { IpcContractBase, IpcEventContractBase, IpcEventHandler, IpcEventNames, IpcEventParameters, IpcMessageNames, IpcMessageParameters, IpcMessageReturnType, IpcMessageSyncReturnType } from "../common/ipc";

/**
 * A renderer-thread IPC Client that connects to an IPC server on the main thread. Messages are sent asynchronously.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcClientDecorators` instead.
 */
@RendererOnly
export class IpcClient<TContract extends IpcContractBase<TContract>> {
    constructor(
        readonly channel: string
    ) {
    }

    send<K extends IpcMessageNames<TContract>>(message: K, ...args: IpcMessageParameters<TContract, K>): Promise<IpcMessageReturnType<TContract, K>> {
        return ipcRenderer.invoke(`message:${this.channel}`, message, ...args);
    }
}

/**
 * A renderer-thread IPC Client that connects to an IPC server on the main thread. Messages are sent synchronously.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcClientDecorators` instead.
 */
@RendererOnly
export class IpcClientSync<TContract extends IpcContractBase<TContract>, TEvents extends IpcEventContractBase<TEvents> = never> {
    constructor(
        readonly channel: string
    ) {
    }
   
    sendSync<K extends IpcMessageNames<TContract>>(message: K, ...args: IpcMessageParameters<TContract, K>): IpcMessageSyncReturnType<TContract, K> {
        return ipcRenderer.sendSync(`sync.message:${this.channel}`, message, ...args);
    }
}

/**
 * A renderer-thread IPC Client that connects to an IPC server on the main thread to listen for IPC server events.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcClientDecorators` instead.
 */
@RendererOnly
export class IpcClientEventObserver<TEvents extends IpcEventContractBase<TEvents>> {
    #handlers = new Map<IpcEventNames<TEvents>, Set<IpcEventHandler<TEvents, any>>>();
    #handler = <K extends IpcEventNames<TEvents>>(event: IpcRendererEvent, eventName: K, ...args: any[]) => {
        // NOTE: only handle events from the main process
        if (event.senderId !== 0) return;
        this.emit(eventName, ...(args as IpcEventParameters<TEvents, K>));
    };

    constructor(
        readonly channel: string
    ) {
        ipcRenderer.on(`event:${this.channel}`, this.#handler);
    }

    emit<K extends IpcEventNames<TEvents>>(eventName: K, ...args: IpcEventParameters<TEvents, K>) {
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
        let handlers = this.#handlers.get(eventName);
        if (!handlers) this.#handlers.set(eventName, handlers = new Set());
        const firstHandler = handlers.size === 0;
        handlers.add(handler);
        if (firstHandler) {
            ipcRenderer.sendSync(`event.subscribe:${this.channel}`, eventName);
        }
        return this;
    }

    off<K extends IpcEventNames<TEvents>>(eventName: K, handler: IpcEventHandler<TEvents, K>) {
        const handlers = this.#handlers.get(eventName);
        if (handlers?.delete(handler) && handlers.size === 0) {
            ipcRenderer.sendSync(`event.unsubscribe:${this.channel}`, eventName);
        }
        return this;
    }

    dispose() {
        ipcRenderer.off(`event:${this.channel}`, this.#handler);
        for (const eventName of this.#handlers.keys()) {
            ipcRenderer.sendSync(`event.unsubscribe:${this.channel}`, eventName);
        }
        this.#handlers.clear();
    }

    [Disposable.dispose]() {
        this.dispose();
    }
}
