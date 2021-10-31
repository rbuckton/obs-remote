/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import ObsWebSocketImpl from "obs-websocket-js";
import { EVENTS, TypedEventEmitter } from "../../core/common/events";
import {
    ObsWebSocketEvents,
    ObsWebSocketRequestArgs,
    ObsWebSocketRequests,
    ObsWebSocketResponse
} from "../common/protocol";
import { IObsWebSocket } from "./iObsWebSocket";

/**
 * Wrapper for `obs-websocket-js` with improved typed events and a more descriptive
 * API.
 */
export class ObsWebSocket extends TypedEventEmitter implements IObsWebSocket {
    declare [EVENTS]: ObsWebSocketEvents;

    private _address: string | undefined;
    private _secure: boolean = false;
    private _socket = new ObsWebSocketImpl();
    private _connected = false;

    constructor() {
        super({ captureRejections: true });
        const originalEmit = this._socket.emit;
        const self = this;
        this._socket.emit = function (type, ...args: any) {
            self.emit(type, ...args);
            return originalEmit.call(this, type, ...args);
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

    get address() {
        return this._address ?? "localhost:4444";
    }

    get secure() {
        return this._secure;
    }

    async connect(options?: { address?: string; password?: string; secure?: boolean}): Promise<void> {
        await this._socket.connect(options);
        this._address = options?.address ?? "localhost:4444";
        this._secure = options?.secure ?? false;
    }

    disconnect(): void {
        this._socket.disconnect();
        this._address = undefined;
        this._secure = false;
    }

    async send<K extends keyof ObsWebSocketRequests>(key: K, ...args: ObsWebSocketRequestArgs<K>): Promise<ObsWebSocketResponse<K>> {
        return await this._socket.send(key as any, ...args) as any;
    }
}
