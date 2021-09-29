import Store from "electron-store";
import { ThemeKind } from "../../themes/themeKind";
import { IPreferencesEventContract, IPreferencesService, IPreferencesSnapshot, IPreferencesSyncContract, PreferenceKeys } from "../common/preferencesService";
import { IpcServerDecorators } from "../../ipc/main";
import { Event } from "@esfx/events";
import { Disposable } from "@esfx/disposable";

const { IpcServerClass, IpcServerSyncMethod, IpcServerEvent } = IpcServerDecorators.create<IPreferencesSyncContract, IPreferencesEventContract>("preferences");

@IpcServerClass
export class MainPreferencesService implements IPreferencesService {
    private _store = new Store({
        defaults: {
            theme: ThemeKind.Light,
            hostname: "",
            port: 4444,
            authKey: "",
            autoConnect: false
        }
    });

    @IpcServerEvent("didChange")
    private _didChange = Event.create<(key: PreferenceKeys) => void>(this);
    readonly onDidChange = this._didChange.event;

    constructor() {
        for (const key of ["theme", "hostname", "port", "authKey", "autoConnect"] as const) {
            this._store.onDidChange(key, () => {
                this._didChange.emit(key);
            });
        }
    }

    get theme() {
        return this._store.get("theme");
    }

    set theme(value) {
        this._store.set("theme", value);
    }

    get hostname() {
        return this._store.get("hostname");
    }

    set hostname(value) {
        this._store.set("hostname", value);
    }

    get port() {
        return this._store.get("port");
    }

    set port(value) {
        this._store.set("port", value);
    }

    get authKey() {
        return this._store.get("authKey");
    }

    set authKey(value) {
        this._store.set("authKey", value);
    }

    get autoConnect() {
        return this._store.get("autoConnect");
    }

    set autoConnect(value) {
        this._store.set("autoConnect", value);
    }

    @IpcServerSyncMethod
    clear(): void {
        this._store.clear();
    }

    @IpcServerSyncMethod("getPreferencesSync")
    private _getPreferencesSync() {
        return {
            theme: this.theme,
            hostname: this.hostname,
            port: this.port,
            authKey: this.authKey,
            autoConnect: this.autoConnect
        };
    }

    @IpcServerSyncMethod("setPreferenceSync")
    private _setPreferenceSync<K extends keyof IPreferencesSnapshot>(key: K, value: IPreferencesSnapshot[K]): void {
        switch (key) {
            case "theme":
            case "hostname":
            case "port":
            case "authKey":
            case "autoConnect":
                this._store.set(key, value);
                break;
        }
    }

    [Disposable.dispose]() {
    }
}
