/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import { IpcMainInvokeEvent, WebContents } from "electron";
import { IpcMainEvent } from "electron/main";
import { MainOnly } from "../../core/main/decorators";
import { getIpcMain } from "../../core/main/main";
import { IpcContractBase, IpcEventContractBase, IpcEventNames, IpcEventParameters, IpcMessageNames } from "../common/ipc";

/**
 * A main-thread IPC Server that can be accessed by an IPC client on a renderer thread. Messages are received asynchronously.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcServerDecorators` instead.
 */
@MainOnly
export class IpcServer<TContract extends IpcContractBase<TContract>> {
    #disposed = false;
    #ipcMain = getIpcMain(/*throwIfMissing*/ true);
    #handler = async (_event: IpcMainInvokeEvent, message: IpcMessageNames<TContract>, ...args: any[]) => this.contract[message](...args);

    constructor(
        readonly channel: string,
        readonly contract: TContract
    ) {
        this.#ipcMain.handle(`message:${this.channel}`, this.#handler);
    }

    [Disposable.dispose]() {
        if (!this.#disposed) {
            this.#disposed = true;
            this.#ipcMain.removeHandler(`message:${this.channel}`);
        }
    }
}

/**
 * A main-thread IPC Server that can be accessed by an IPC client on a renderer thread. Messages are received synchronously.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcServerDecorators` instead.
 */
@MainOnly
export class IpcServerSync<TContract extends IpcContractBase<TContract>> {
    #disposed = false;
    #ipcMain = getIpcMain(/*throwIfMissing*/ true);
    #handler = (event: IpcMainEvent, message: IpcMessageNames<TContract>, ...args: any[]) => {
        event.returnValue = this.contract[message](...args);
    };
    
    constructor(
        readonly channel: string,
        readonly contract: TContract
    ) {
        this.#ipcMain.on(`sync.message:${this.channel}`, this.#handler);
    }

    [Disposable.dispose]() {
        if (!this.#disposed) {
            this.#disposed = true;
            this.#ipcMain.off(`sync.message:${this.channel}`, this.#handler);
        }
    }
}

class EventSubscribers {
    readonly #subscribers = new Map<number, WeakRef<WebContents>>();
    readonly #finalizer = new FinalizationRegistry((id: number) => {
        this.#subscribers.delete(id);
    });

    get size() {
        return this.#subscribers.size;
    }

    add(webContents: WebContents) {
        if (!this.#subscribers.has(webContents.id)) {
            this.#subscribers.set(webContents.id, new WeakRef(webContents));
            this.#finalizer.register(webContents, webContents.id);
            return true;
        }
        return false;
    }

    remove(webContents: WebContents) {
        if (this.#subscribers.delete(webContents.id)) {
            this.#finalizer.unregister(webContents);
            return true;
        }
        return false;
    }

    * [Symbol.iterator]() {
        for (const [id, weakSubscriber] of this.#subscribers) {
            const subscriber = weakSubscriber.deref();
            if (subscriber === undefined) {
                this.#subscribers.delete(id);
                continue;
            }
            yield subscriber;
        }
    }
}

/**
 * A main-thread IPC Server that that can be used to raise events on an IPC client on a renderer thread.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcServerDecorators` instead.
 */
@MainOnly
export class IpcServerEventEmitter<TEvents extends IpcEventContractBase<TEvents>> {
    #disposed = false;
    #ipcMain = getIpcMain(/*throwIfMissing*/ true);
    #subscribers = new Map<IpcEventNames<TEvents>, EventSubscribers>();
    #subscribe = (event: IpcMainEvent, eventName: IpcEventNames<TEvents>) => {
        let subscribers = this.#subscribers.get(eventName);
        if (!subscribers) this.#subscribers.set(eventName, subscribers = new EventSubscribers());
        event.returnValue = subscribers.add(event.sender);
    };
    #unsubscribe = (event: IpcMainEvent, eventName: IpcEventNames<TEvents>) => {
        const subscribers = this.#subscribers.get(eventName);
        if (subscribers?.remove(event.sender)) {
            if (subscribers.size === 0) {
                this.#subscribers.delete(eventName);
            }
            event.returnValue = true;
        }
        else {
            event.returnValue = false;
        }
    };

    constructor(
        readonly channel: string
    ) {
        this.#ipcMain.on(`event.subscribe:${this.channel}`, this.#subscribe);
        this.#ipcMain.on(`event.unsubscribe:${this.channel}`, this.#unsubscribe);
    }

    emit<K extends IpcEventNames<TEvents>>(eventName: K, ...args: IpcEventParameters<TEvents, K>) {
        if (this.#disposed) throw new ReferenceError("Object is disposed");

        const subscribers = this.#subscribers.get(eventName);
        const channel = `event:${this.channel}`;
        if (subscribers?.size) {
            for (const subscriber of subscribers) {
                subscriber.send(channel, eventName, ...args);
            }
            return true;
        }
        return false;
    }

    [Disposable.dispose]() {
        if (!this.#disposed) {
            this.#disposed = true;
            this.#ipcMain.off(`event.subscribe:${this.channel}`, this.#subscribe);
            this.#ipcMain.off(`event.unsubscribe:${this.channel}`, this.#unsubscribe);
            this.#subscribers.clear();
        }
    }
}