import { Disposable } from "@esfx/disposable";
import { Event } from "@esfx/events";
import { IpcClientDecorators } from "../../ipc/renderer";
import { IPreferencesEventContract, IPreferencesService, IPreferencesSnapshot, IPreferencesSyncContract, PreferenceKeys } from "../common/preferencesService";

const { IpcClientClass, IpcClientSyncMethod, IpcClientEvent } = IpcClientDecorators.create<IPreferencesSyncContract, IPreferencesEventContract>("preferences");

@IpcClientClass
export class RendererPreferencesService implements IPreferencesService {
    private _preferences: IPreferencesSnapshot | undefined;

    @IpcClientEvent("didChange")
    private _didChange = Event.create<(this: this, key: PreferenceKeys) => void>(this);

    readonly onDidChange = this._didChange.event;
    
    constructor() {
        this.onDidChange(() => { this._preferences = undefined; });
    }

    get theme() {
        return this._getPreferences().theme;
    }

    set theme(value) {
        this._setPreferenceSync("theme", value);
    }

    get hostname() {
        return this._getPreferences().hostname;
    }

    set hostname(value) {
        this._setPreferenceSync("hostname", value);
    }

    get port() {
        return this._getPreferences().port;
    }

    set port(value) {
        this._setPreferenceSync("port", value);
    }

    get authKey() {
        return this._getPreferences().authKey;
    }

    set authKey(value) {
        this._setPreferenceSync("authKey", value);
    }

    get autoConnect() {
        return this._getPreferences().autoConnect;
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

    private _getPreferences() {
        return this._preferences ||= this._getPreferencesSync();
    }

    [Disposable.dispose]() {
    }
}