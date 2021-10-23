/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import { Event } from "@esfx/events";
import { IpcClientDecorators } from "../../../ipc/renderer/decorators";
import { IPreferencesIpcEventContract, IPreferencesSnapshot, IPreferencesIpcContract } from "../common/preferencesIpcContract";
import { IPreferencesService, PreferenceKeys } from "../common/preferencesService";

const { IpcClientClass, IpcClientSyncMethod, IpcClientEvent } = IpcClientDecorators.create<IPreferencesIpcContract, IPreferencesIpcEventContract>("preferences");

@IpcClientClass
export class RendererPreferencesService implements IPreferencesService {
    #preferences: IPreferencesSnapshot | undefined;

    @IpcClientEvent("didChange")
    private _didChange = Event.create<(this: this, key: PreferenceKeys) => void>(this);

    readonly onDidChange = this._didChange.event;
    
    constructor() {
        this.onDidChange(() => { this.#preferences = undefined; });
    }

    get theme() {
        return this.#getPreferences().theme;
    }

    set theme(value) {
        this._setPreferenceSync("theme", value);
    }

    get fullscreen() {
        return this.#getPreferences().fullscreen;
    }

    set fullscreen(value) {
        this._setPreferenceSync("fullscreen", value);
    }

    get hostname() {
        return this.#getPreferences().hostname;
    }

    set hostname(value) {
        this._setPreferenceSync("hostname", value);
    }

    get port() {
        return this.#getPreferences().port;
    }

    set port(value) {
        this._setPreferenceSync("port", value);
    }

    get rememberAuthKey() {
        return this.#getPreferences().rememberAuthKey;
    }

    set rememberAuthKey(value) {
        this._setPreferenceSync("rememberAuthKey", value);
    }

    get authKey() {
        return this.#getPreferences().authKey;
    }

    set authKey(value) {
        debugger;
        this._setPreferenceSync("authKey", value);
    }

    get autoConnect() {
        return this.#getPreferences().autoConnect;
    }

    set autoConnect(value) {
        this._setPreferenceSync("autoConnect", value);
    }

    @IpcClientSyncMethod()
    clear(): void {
        throw new Error("Method not implemented.");
    }

    @IpcClientSyncMethod("getPreferencesSync")
    private _getPreferencesSync(): IPreferencesSnapshot {
        throw new Error("Method not implemented.");
    }

    @IpcClientSyncMethod("setPreferenceSync")
    private _setPreferenceSync<K extends keyof IPreferencesSnapshot>(key: K, value: IPreferencesSnapshot[K]) {
        throw new Error("Method not implemented.");
    }

    #getPreferences() {
        return this.#preferences ||= this._getPreferencesSync();
    }

    [Disposable.dispose]() {
    }
}