/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Event } from "@esfx/events";
import { session, Session } from "electron";
import { ServiceIdentifier } from "service-composition";
import { MainOnly } from "../../core/main/decorators";

export const IMainSessionService = ServiceIdentifier.create<IMainSessionService>("IMainSessionService");

export interface IMainSessionService {
    readonly onDidChangeSession: Event<() => void>;
    readonly session: Session;
    readonly sessionId: string;
    startSession(sessionId: string): Session;
    endSession(): void;
    destroySession(): Promise<void>;
}

@MainOnly
export class MainSessionService implements IMainSessionService {
    private _session = session.defaultSession;
    private _sessionId: string | undefined;
    private _didChangeSession = Event.create<() => void>(this);

    readonly onDidChangeSession = this._didChangeSession.event;

    get session() {
        return this._session;
    }

    get sessionId() {
        return this._sessionId ?? "default";
    }

    startSession(sessionId: string): Session {
        if (sessionId === this.sessionId) {
            return this.session;
        }

        if (sessionId === "default") {
            this.endSession();
            return session.defaultSession;
        }

        const partition = session.fromPartition(`persist:${sessionId}`, { cache: true });
        partition.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36");
        this._session = partition;
        this._sessionId = sessionId;
        this._didChangeSession.emit();
        return this._session;
    }

    endSession(): void {
        if (this._sessionId !== undefined) {
            this._session = session.defaultSession;
            this._sessionId = undefined;
            this._didChangeSession.emit();
        }
    }

    async destroySession(): Promise<void> {
        const session = this._session;
        await session.clearStorageData();
        await session.clearCache();
        if (session === this._session) {
            this.endSession();
        }
    }
}