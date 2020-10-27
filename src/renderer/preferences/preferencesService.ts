import { ThemeKind } from "../ui/themes";
import { PreferenceKeys as Keys } from "./preferenceKeys";
import { Preferences, PreferencesStore, Preference } from "./preferencesStore";
import { SharedPreferencesService } from "./shared";

export class PreferencesService {
    private _store: PreferencesStore;
    private _prefs: Preferences;

    constructor(sharedPrefs: SharedPreferencesService) {
        this._store = sharedPrefs.getPreferences("config");
        this._prefs = new Preferences(this._store);
    }

    clear() {
        this._store
            .edit()
            .clear()
            .apply();
    }

    get theme() { return this._prefs.getNumber(Keys.theme, ThemeKind.Light) as Preference<ThemeKind>; }
    get hostname() { return this._prefs.getString(Keys.hostname, ""); }
    get port() { return this._prefs.getNumber(Keys.port, 4444); }
    get authKey() { return this._prefs.getString(Keys.authKey, ""); }
    get autoConnect() { return this._prefs.getBoolean(Keys.autoConnect, false); }
}