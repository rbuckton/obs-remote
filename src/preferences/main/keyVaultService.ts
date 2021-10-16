/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Event } from "@esfx/events";
import { app } from "electron";
import { deletePassword, getPassword, setPassword } from "keytar";
import { ServiceIdentifier } from "service-composition";
import { MainOnly } from "../../core/main/decorators";

export const IMainKeyVaultService = ServiceIdentifier.create<IMainKeyVaultService>("IMainKeyVaultService");

export interface IMainKeyVaultService {
    readonly onDidChange: Event<() => void>;
    get ready(): boolean;
    get authKey(): string | undefined;
    set authKey(value: string | undefined);
    waitForReady(): Promise<void>;
}

@MainOnly
export class MainKeyVaultService implements IMainKeyVaultService {
    #service = app.getName();
    #account = "obs-websocket";
    #authKey: string | null | undefined;
    #onDidChange = Event.create<() => void>(this);
    #waitForReadyPromise?: Promise<void>;
    readonly onDidChange = this.#onDidChange.event;

    get ready() {
        return this.#authKey !== undefined;
    }

    get authKey() {
        return this.#authKey ?? undefined;
    }

    set authKey(value: string | undefined) {
        if (this.#authKey === undefined) {
            throw new TypeError("Key vault not ready. Call 'waitForReady()' first.");
        }
        const newAuthKey = value === undefined ? null : value;
        if (this.#authKey !== newAuthKey) {
            this.#authKey = newAuthKey;
            const promise = this.#authKey === null ?
                deletePassword(this.#service, this.#account) :
                setPassword(this.#service, this.#account, this.#authKey);
            promise.then(() => {
                if (this.#authKey === newAuthKey) {
                    this.#onDidChange.emit();
                }
            });
        }
    }

    async waitForReady() {
        return this.#waitForReadyPromise ??= this.#waitForReady();
    }
    
    async #waitForReady() {
        this.#authKey = await getPassword(this.#service, this.#account);
        this.#onDidChange.emit();
    }
}