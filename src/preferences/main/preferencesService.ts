/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import { Event } from "@esfx/events";
import Store from "electron-store";
import { IpcServerDecorators } from "../../ipc/main";
import { ThemeKind } from "../../themes/themeKind";
import { IPreferencesIpcContract, IPreferencesIpcEventContract, IPreferencesSnapshot } from "../common/ipc";
import { IPreferencesService, PreferenceKeys } from "../common/preferencesService";
import { IMainKeyVaultService } from "./keyVaultService";

const { IpcServerClass, IpcServerSyncMethod, IpcServerEvent } = IpcServerDecorators.create<IPreferencesIpcContract, IPreferencesIpcEventContract>("preferences");

interface PreferencesStore {
    theme: ThemeKind,
    hostname: string,
    port: number,
    /** @deprecated */ authKey?: string,
    rememberAuthKey: boolean,
    autoConnect: boolean,
    fullscreen: boolean
}

const DEFAULT_PREFERENCES: Omit<IPreferencesSnapshot, "authKey"> = {
    theme: ThemeKind.Light,
    hostname: "",
    port: 4444,
    rememberAuthKey: true,
    autoConnect: false,
    fullscreen: false,
};

const PREFERENCE_KEYS = Object.getOwnPropertyNames(DEFAULT_PREFERENCES) as (keyof typeof DEFAULT_PREFERENCES)[];

@IpcServerClass
export class MainPreferencesService implements IPreferencesService {
    #disposed = false;
    #store = new Store<PreferencesStore>({
        defaults: { ...DEFAULT_PREFERENCES },
        migrations: {
            ">=0.0.0-0": (store) => {
                const authKey = store.get("authKey");
                if (authKey !== undefined) {
                    if (authKey) {
                        this._keyVaultService.authKey = authKey;
                    }
                    store.delete("authKey");
                }
            }
        },
        watch: true,
    });
    #disposables: Disposable | undefined;

    @IpcServerEvent("didChange")
    private _didChange = Event.create<(key: PreferenceKeys) => void>(this);
    readonly onDidChange = this._didChange.event;

    constructor(
        @IMainKeyVaultService private _keyVaultService: IMainKeyVaultService
    ) {
        const disposables: Disposable[] = [];
        try {
            const onAuthKeyChanged = () => { this._didChange.emit("authKey"); };
            this._keyVaultService.onDidChange.addListener(onAuthKeyChanged);
            disposables.push(Disposable.create(() => {
                this._keyVaultService.onDidChange.removeListener(onAuthKeyChanged);
            }));

            for (const key of PREFERENCE_KEYS) {
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

    get rememberAuthKey() {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return this.#store.get("rememberAuthKey");
    }

    set rememberAuthKey(value) {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        this.#store.set("rememberAuthKey", value);
        if (!value) {
            this._keyVaultService.authKey = undefined;
        }
    }

    get authKey() {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        return this._keyVaultService.authKey ?? "";
    }

    set authKey(value) {
        if (this.#disposed) throw new ReferenceError("Object is disposed");
        if (!value) {
            this._keyVaultService.authKey = undefined;
        }
        else if (this.rememberAuthKey) {
            this._keyVaultService.authKey = value;
        }
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
            rememberAuthKey: this.rememberAuthKey,
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
            case "autoConnect":
            case "fullscreen":
                this.#store.set(key, value);
                break;
            case "rememberAuthKey":
                this.rememberAuthKey = !!value;
                break;
            case "authKey":
                this.authKey = `${value}`;
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
