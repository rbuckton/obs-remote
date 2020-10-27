import * as path from "path";
import * as os from "os";
import { PreferencesStore } from "../preferencesStore";

export class SharedPreferencesService {
    private _map = new Map<string, PreferencesStore>();
    private _preferencesDir = path.join(os.userInfo().homedir, ".obs-remote/preferences");

    constructor() {
    }

    getPreferences(name: string, defaults: Record<string, any> = {}): PreferencesStore {
        let store = this._map.get(name);
        if (store === undefined) {
            store = new PreferencesStore(path.join(this._preferencesDir, name + ".ini"), defaults);
            this._map.set(name, store);
        }
        return store;
    }
}