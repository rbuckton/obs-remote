/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { EVENTS, TypedEventEmitter } from "../../core/common/events";
import { ObsWebSocketEvents, ObsWebSocketRequestArgs, ObsWebSocketRequests, ObsWebSocketResponse } from "../common/protocol";
import { IObsWebSocket } from "./iObsWebSocket";

/**
 * Provides a "null" {@link IObsWebSocket} for use when not connected to OBS.
 */
export class NullObsWebSocket extends TypedEventEmitter implements IObsWebSocket {
    declare [EVENTS]: ObsWebSocketEvents;

    static readonly instance: IObsWebSocket = new NullObsWebSocket();

    constructor() {
        super({ captureRejections: true });
    }

    get connected() {
        return false;
    }

    get address() {
        return "localhost:4444";
    }

    get secure() {
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
