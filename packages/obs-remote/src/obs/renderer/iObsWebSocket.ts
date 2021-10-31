/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { EVENTS, TypedEventEmitter } from "../../core/common/events";
import {
    ObsWebSocketEvents,
    ObsWebSocketRequestArgs,
    ObsWebSocketRequests,
    ObsWebSocketResponse
} from "../common/protocol";

/**
 * Describes an OBS WebSocket connection.
 */
export interface IObsWebSocket extends TypedEventEmitter {
    [EVENTS]: ObsWebSocketEvents;

    get connected(): boolean;
    get address(): string;
    get secure(): boolean;

    connect(options?: { address?: string; password?: string; secure?: boolean; }): Promise<void>;
    disconnect(): void;
    send<K extends keyof ObsWebSocketRequests>(key: K, ...args: ObsWebSocketRequestArgs<K>): Promise<ObsWebSocketResponse<K>>;
}
