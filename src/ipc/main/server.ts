import { Disposable } from "@esfx/disposable";
import { ipcMain, IpcMainInvokeEvent, WebContents } from "electron";
import { IpcMainEvent } from "electron/main";
import { MainOnly } from "../../core/main/decorators";
import { IpcContractBase, IpcEventContractBase, IpcEventNames, IpcEventParameters, IpcMessageNames } from "../common/ipc";

/**
 * A main-thread IPC Server that can be accessed by an IPC client on a renderer thread. Messages are received asynchronously.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcServerDecorators` instead.
 */
@MainOnly
export class IpcServer<TContract extends IpcContractBase<TContract>> {
    #handler = async (event: IpcMainInvokeEvent, message: IpcMessageNames<TContract>, ...args: any[]) => this.contract[message](...args);

    constructor(
        readonly channel: string,
        readonly contract: TContract
    ) {
        ipcMain.handle(`message:${this.channel}`, this.#handler);
    }

    dispose() {
        ipcMain.removeHandler(`message:${this.channel}`);
    }
    
    [Disposable.dispose]() {
        this.dispose();
    }
}

/**
 * A main-thread IPC Server that can be accessed by an IPC client on a renderer thread. Messages are received synchronously.
 * 
 * **NOTE:** This class is not intended for regular use. You should use `IpcServerDecorators` instead.
 */
@MainOnly
export class IpcServerSync<TContract extends IpcContractBase<TContract>> {
    #handler = (event: IpcMainEvent, message: IpcMessageNames<TContract>, ...args: any[]) => {
        event.returnValue = this.contract[message](...args);
    }
    
    constructor(
        readonly channel: string,
        readonly contract: TContract
    ) {
        ipcMain.on(`sync.message:${this.channel}`, this.#handler);
    }

    dispose() {
        ipcMain.off(`sync.message:${this.channel}`, this.#handler);
    }

    [Disposable.dispose]() {
        this.dispose();
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
        ipcMain.on(`event.subscribe:${this.channel}`, this.#subscribe);
        ipcMain.on(`event.unsubscribe:${this.channel}`, this.#unsubscribe);
    }

    emit<K extends IpcEventNames<TEvents>>(eventName: K, ...args: IpcEventParameters<TEvents, K>) {
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

    dispose(): void {
        ipcMain.off(`event.subscribe:${this.channel}`, this.#subscribe);
        ipcMain.off(`event.unsubscribe:${this.channel}`, this.#unsubscribe);
        this.#subscribers.clear();
    }
    
    [Disposable.dispose]() {
        this.dispose();
    }
}