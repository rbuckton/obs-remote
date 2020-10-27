import _ObsWebSocket from "obs-websocket-js";
import { EventEmitter } from "events";
import { ObsWebSocketEventArgsList, ObsWebSocketEvents, ObsWebSocketRequestArgs, ObsWebSocketRequests, ObsWebSocketResponse } from "./protocol";

export interface IObsWebSocket extends NodeJS.EventEmitter {
    readonly connected: boolean;

    connect(options?: { address?: string; password?: string; secure?: boolean}): Promise<void>;
    disconnect(): void;
    send<K extends keyof ObsWebSocketRequests>(key: K, ...args: ObsWebSocketRequestArgs<K>): Promise<ObsWebSocketResponse<K>>;

    addListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    addListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    on<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    on<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    once<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    once<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    removeListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    removeListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    off<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    off<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependOnceListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependOnceListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    emit<K extends keyof ObsWebSocketEvents>(type: K, ...args: ObsWebSocketEventArgsList<K>): boolean;
    emit<K extends string | symbol>(type: K, ...args: ObsWebSocketEventArgsList<K>): boolean;
}

export class ObsWebSocket extends EventEmitter implements IObsWebSocket {
    private _socket = new _ObsWebSocket();
    private _connected = false;

    constructor() {
        super({ captureRejections: true });
        const originalEmit = this._socket.emit;
        const self = this;
        this._socket.emit = function (...args) {
            self.emit(...args);
            return originalEmit.apply(this, args);
        };
        this._socket.on("ConnectionOpened", () => {
            this._connected = true;
        });
        this._socket.on("ConnectionClosed", () => {
            this._connected = false;
        });
        this.setMaxListeners(100);
    }

    get connected() {
        return this._connected;
    }

    async connect(options?: { address?: string; password?: string; secure?: boolean}): Promise<void> {
        await this._socket.connect(options);
    }

    disconnect(): void {
        this._socket.disconnect();
    }

    async send<K extends keyof ObsWebSocketRequests>(key: K, ...args: ObsWebSocketRequestArgs<K>): Promise<ObsWebSocketResponse<K>> {
        return await this._socket.send(key as any, ...args) as any;
    }
}

export interface ObsWebSocket {
    addListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    addListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    on<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    on<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    once<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    once<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    removeListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    removeListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    off<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    off<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependOnceListener<K extends keyof ObsWebSocketEvents>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    prependOnceListener<K extends string | symbol>(type: K, listener: (...args: ObsWebSocketEventArgsList<K>) => void): this;
    emit<K extends keyof ObsWebSocketEvents>(type: K, ...args: ObsWebSocketEventArgsList<K>): boolean;
    emit<K extends string | symbol>(type: K, ...args: ObsWebSocketEventArgsList<K>): boolean;
}
