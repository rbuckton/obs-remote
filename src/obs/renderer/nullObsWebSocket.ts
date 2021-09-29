import _ObsWebSocket from "obs-websocket-js";
import { EventEmitter } from "events";
import { ObsWebSocketEventArgsList, ObsWebSocketEvents, ObsWebSocketRequestArgs, ObsWebSocketRequests, ObsWebSocketResponse } from "../common/protocol";
import { IObsWebSocket } from "./obsWebSocket";

export class NullObsWebSocket extends EventEmitter implements IObsWebSocket {
    static readonly instance = new NullObsWebSocket();

    constructor() {
        super({ captureRejections: true });
    }

    get connected() {
        return false;
    }

    async connect(options?: { address?: string; password?: string; secure?: boolean}): Promise<void> {
        throw new Error("Not implemented");
    }

    disconnect(): void {
    }

    async send<K extends keyof ObsWebSocketRequests>(key: K, ...args: ObsWebSocketRequestArgs<K>): Promise<ObsWebSocketResponse<K>> {
        throw new Error("Not connected");
    }
}

export interface NullObsWebSocket {
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
