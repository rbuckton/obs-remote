/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import { Event } from "@esfx/events";
import Store from "electron-store";
import { IpcServerDecorators } from "../../ipc/main";
import { ThemeKind } from "../../themes/themeKind";
import { IPreferencesIpcEventContract, IPreferencesSnapshot, IPreferencesIpcContract } from "../common/ipc";
import { IPreferencesService, PreferenceKeys } from "../common/preferencesService";

const { IpcServerClass, IpcServerSyncMethod, IpcServerEvent } = IpcServerDecorators.create<IPreferencesIpcContract, IPreferencesIpcEventContract>("preferences");

@IpcServerClass
export class MainPreferencesService implements IPreferencesService {
    #disposed = false;
    #store = new Store({
        defaults: {
            theme: ThemeKind.Light,
            hostname: "",
            port: 4444,
            authKey: "",
            autoConnect: false,
            fullscreen: false,
        },
        watch: true
    });
    #disposables: Disposable | undefined;

    @IpcServerEvent("didChange")
    private _didChange = Event.create<(key: PreferenceKeys) => void>(this);
    readonly onDidChange = this._didChange.event;

    constructor() {
        const disposables: Disposable[] = [];
        try {
            for (const key of ["theme", "hostname", "port", "authKey", "autoConnect", "fullscreen"] as const) {
                const unsubscribe = this.#store.onDidChange(key, () => {
                    this._didChange.emit(key);
                });
                disposables.push(Disposable.create(() => unsubscribe()));
            }
        }
        catch (e) {
            const disposable = Disposable.from(disposables);
            Disposable.use(disposable, () => { throw e; });
        }
        this.#disposables = Disposable.from(disposables);
    }

    get theme() {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return this.#store.get("theme");
    }

    set theme(value) {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        this.#store.set("theme", value);
    }

    get fullscreen() {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return this.#store.get("fullscreen");
    }

    set fullscreen(value) {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        this.#store.set("fullscreen", value);
    }

    get hostname() {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return this.#store.get("hostname");
    }

    set hostname(value) {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        this.#store.set("hostname", value);
    }

    get port() {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return this.#store.get("port");
    }

    set port(value) {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        this.#store.set("port", value);
    }

    get authKey() {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return this.#store.get("authKey");
    }

    set authKey(value) {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        this.#store.set("authKey", value);
    }

    get autoConnect() {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return this.#store.get("autoConnect");
    }

    set autoConnect(value) {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        this.#store.set("autoConnect", value);
    }

    @IpcServerSyncMethod
    clear(): void {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        this.#store.clear();
    }

    @IpcServerSyncMethod("getPreferencesSync")
    private _getPreferencesSync() {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return {
            theme: this.theme,
            hostname: this.hostname,
            port: this.port,
            authKey: this.authKey,
            autoConnect: this.autoConnect,
            fullscreen: this.fullscreen,
        };
    }

    @IpcServerSyncMethod("setPreferenceSync")
    private _setPreferenceSync<K extends keyof IPreferencesSnapshot>(key: K, value: IPreferencesSnapshot[K]): void {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        switch (key) {
            case "theme":
            case "hostname":
            case "port":
            case "authKey":
            case "autoConnect":
            case "fullscreen":
                this.#store.set(key, value);
                break;
        }
    }

    [Disposable.dispose]() {
        this.#disposed = true;
        this.#store = undefined!;
        const disposables = this.#disposables;
        if (disposables) {
            this.#disposables = undefined;
            disposables[Disposable.dispose]();
        }
    }
}
