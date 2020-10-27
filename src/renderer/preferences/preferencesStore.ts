import * as path from "path";
import * as fs from "fs";
import * as ini from "ini";
import { fn } from "iterable-query";
import { Event, EventSource } from "@esfx/events";

function collectKeys(source: Record<string, any>, keysOut: string[], keyPath: string[] = []) {
    for (const [key, value] of Object.entries(source)) {
        keyPath.push(key);
        if (isSection(value)) {
            collectKeys(value, keysOut, keyPath);
        }
        keysOut.push(toKey(keyPath));
        keyPath.pop();
    }
}

function deepAssign(target: Record<string, any>, source: Record<string, any>, changedKeysOut?: string[], keyPath?: string[]) {
    if (changedKeysOut && !keyPath) keyPath = [];
    for (const [key, value] of Object.entries(source)) {
        keyPath?.push(key);
        if (isSection(value)) {
            if (!isSection(target[key])) {
                target[key] = {};
                changedKeysOut?.push(toKey(keyPath!));
            }
            deepAssign(target[key], value, changedKeysOut, keyPath);
        }
        else if (isChanged(target[key], value)) {
            if (isSection(target[key]) && changedKeysOut) {
                collectKeys(target[key], changedKeysOut, keyPath);
            }
            if (value === undefined) {
                delete target[key];
            }
            else {
                target[key] = value;
            }
            changedKeysOut?.push(toKey(keyPath!));
        }
        keyPath?.pop();
    }
}

function isSection(value: unknown): value is Record<string, any> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toSafeKey(keySegment: string) {
    return /^[a-zA-Z0-9_$]+$/.test(keySegment) ? keySegment : JSON.stringify(keySegment);
}

function toKey(keyPath: string[]) {
    return keyPath.map(toSafeKey).join(".");
}

function parseKey(key: string) {
    const keyPath: string[] = [];
    let start = 0;
    let pos = 0;
    while (pos < key.length) {
        const ch = key.charAt(pos);
        pos++;
        if (ch === ".") {
            keyPath.push(key.slice(start, pos - 1));
            start = pos;
            continue;
        }
        if (ch === '"') {
            while (pos < key.length) {
                if (key.charAt(pos) === "\\" && key.charAt(pos + 1) === '"') {
                    pos += 2;
                    continue;
                }
                if (key.charAt(pos) === '"') {
                    pos++;
                    break;
                }
                pos++;
            }
        }
    }
    if (start < pos) {
        keyPath.push(key.slice(start, pos));
    }
    return keyPath;
}

function isChanged(source: unknown, target: unknown) {
    if (source === target) return false;
    if (Array.isArray(source)) {
        if (!Array.isArray(target)) return true;
        if (source.length !== target.length) return true;
        for (let i = 0; i < source.length; i++) {
            if (isChanged(source[i], target[i])) return true;
        }
        return false;
    }
    return true;
}

export class PreferencesStore {
    private _file: string;
    private _config: Record<string, any>;
    private _didKeyChange = Event.create<(this: PreferencesStore, key: string) => void>(this);
    private _didPreferenceChangeMap = new Map<string, Map<Adapter<unknown>, EventSource<(this: PreferencesStore, value: unknown) => void>>>();

    readonly onKeyChanged = this._didKeyChange.event;

    constructor(file: string, defaults: Record<string, any> = {}) {
        const config: Record<string, any> = {};
        deepAssign(config, defaults);
        if (file !== ":memory:") {
            try {
                const content = fs.readFileSync(file, "utf8");
                const data = ini.parse(content);
                deepAssign(config, data);
            } catch {}
        }
        this._file = file;
        this._config = config;
    }

    has(key: string) {
        return this._getValue(key, fn.identity) !== undefined;
    }

    getBoolean(key: string, defaultValue: boolean): boolean;
    getBoolean(key: string, defaultValue?: boolean): boolean | undefined;
    getBoolean(key: string, defaultValue: boolean) {
        return this._getValue(key, Boolean) ?? defaultValue;
    }

    getNumber(key: string, defaultValue: number): number;
    getNumber(key: string, defaultValue?: number): number | undefined;
    getNumber(key: string, defaultValue: number) {
        return this._getValue(key, Number) ?? defaultValue;
    }

    getString(key: string, defaultValue: string): string;
    getString(key: string, defaultValue?: string): string | undefined;
    getString(key: string, defaultValue: string) {
        return this._getValue(key, String) ?? defaultValue;
    }

    getStringSet(key: string, defaultValue: readonly string[]): readonly string[];
    getStringSet(key: string, defaultValue?: readonly string[]): readonly string[] | undefined;
    getStringSet(key: string, defaultValue: readonly string[]) {
        const value = this._getValue(key, fn.identity);
        return Array.isArray(value) ? value as readonly string[] : defaultValue;
    }

    edit() {
        return new PreferencesEditor(this, this._config, this._file, this._didKeyChange, this._didPreferenceChangeMap);
    }

    * entries(key?: string): IterableIterator<[string, any]> {
        const keyPath = key === undefined ? [] : parseKey(key);
        const section = key === undefined ? this._config : this._getSection(keyPath);
        if (section !== undefined) {
            yield* this._entriesOfSection(keyPath, section);
        }
    }

    private * _entriesOfSection(keyPath: readonly string[], section: Record<string, any>): IterableIterator<[string, any]> {
        for (const [key, value] of Object.entries(section)) {
            const entryKeyPath = [...keyPath, key];
            if (isSection(value)) {
                yield* this._entriesOfSection(entryKeyPath, value);
            }
            else {
                yield [toKey(entryKeyPath), value];
            }
        }
    }

    private _getSection(keyPath: readonly string[]) {
        let section: unknown = this._config;
        for (const segment of keyPath) {
            if (!isSection(section)) break;
            section = section[segment];
        }
        return isSection(section) ? section : undefined;
    }

    private _getValue<T>(key: string, coerce: (value: any) => T | undefined) {
        const keyPath = parseKey(key);
        const lastSegment = keyPath.pop()!;
        const section = this._getSection(keyPath);
        const value = section?.[lastSegment];
        return value !== undefined ? coerce(value) : undefined;
    }
}

class PreferencesEditor {
    private changes: Record<string, any>;

    constructor(
        private _store: PreferencesStore,
        private _config: Record<string, any>,
        private _file: string,
        private _didKeyChange: EventSource<(this: PreferencesStore, key: string) => void>,
        private _didPreferenceChangeMap: Map<string, Map<Adapter<unknown>, EventSource<(this: PreferencesStore, value: unknown) => void>>>
    ) {
        const changes: Record<string, any> = {};
        deepAssign(changes, _config);
        this.changes = changes;
    }

    setBoolean(key: string, value: boolean) {
        return this.setValue(key, value);
    }

    setNumber(key: string, value: number) {
        return this.setValue(key, value);
    }

    setString(key: string, value: string) {
        return this.setValue(key, value);
    }

    setStringSet(key: string, value: readonly string[]) {
        return this.setValue(key, value);
    }

    delete(key: string) {
        return this.setValue(key, undefined);
    }

    clear() {
        for (const key of Object.keys(this.changes)) {
            this.changes[key] = undefined;
        }
        return this;
    }

    apply() {
        const changedKeys: string[] = [];
        deepAssign(this._config, this.changes, changedKeys);
        if (changedKeys.length > 0) {
            if (this._file !== ":memory:") {
                try { fs.mkdirSync(path.dirname(this._file), { recursive: true }) } catch { }
                fs.writeFileSync(this._file, ini.stringify(this._config), "utf8");
                for (const key of changedKeys) {
                    this._didKeyChange.emit(key);
                    const adapters = this._didPreferenceChangeMap.get(key);
                    if (adapters) {
                        for (const [adapter, source] of adapters) {
                            source.emit(adapter.get(key, this._store));
                        }
                    }
                }
            }
        }
    }

    private setValue(key: string, value: unknown) {
        const keyPath = parseKey(key);
        const lastSegment = keyPath.pop()!;
        let section: unknown = this.changes;
        for (const segment of keyPath) {
            if (!isSection(section)) break;
            section = (section[segment] ??= {});
        }
        if (isSection(section) && isChanged(section[lastSegment], value)) {
            section[lastSegment] = value;
        }
        return this;
    }
}

interface Adapter<T> {
    get(key: string, store: PreferencesStore): T;
    set(key: string, value: T, editor: PreferencesEditor): void;
}

const booleanAdapter: Adapter<boolean> = {
    get(key, store) { return store.getBoolean(key, false); },
    set(key, value, editor) { editor.setBoolean(key, value); }
};

const numberAdapter: Adapter<number> = {
    get(key, store) { return store.getNumber(key, 0); },
    set(key, value, editor) { editor.setNumber(key, value); }
};

const stringAdapter: Adapter<string> = {
    get(key, store) { return store.getString(key, ""); },
    set(key, value, editor) { editor.setString(key, value); }
};

const stringSetAdapter: Adapter<readonly string[]> = {
    get(key, store) { return store.getStringSet(key, []); },
    set(key, value, editor) { editor.setStringSet(key, value); }
};

export class Preferences {
    private _store: PreferencesStore;

    constructor(store: PreferencesStore) {
        this._store = store;
    }

    getBoolean(key: string, defaultValue: boolean = false) {
        return new Preference(this._store, key, defaultValue, booleanAdapter);
    }

    getNumber(key: string, defaultValue: number = 0) {
        return new Preference(this._store, key, defaultValue, numberAdapter);
    }

    getString(key: string, defaultValue: string = "") {
        return new Preference(this._store, key, defaultValue, stringAdapter);
    }

    getStringSet(key: string, defaultValue: readonly string[] = []) {
        return new Preference(this._store, key, defaultValue, stringSetAdapter);
    }

    clear() {
        this._store.edit()
            .clear()
            .apply();
    }
}

export class Preference<T> {
    private _onDidValueChange?: Event<(this: PreferencesStore, value: T) => void>;

    constructor(
        private _store: PreferencesStore,
        private _key: string,
        private _defaultValue: T,
        private _adapter: Adapter<T>
    ) {
    }

    get onDidValueChange() {
        if (!this._onDidValueChange) {
            const preferenceChanged = this._store["_didPreferenceChangeMap"];
            let adapters = preferenceChanged.get(this.key);
            if (!adapters) preferenceChanged.set(this.key, adapters = new Map());
            let source = adapters.get(this._adapter) as EventSource<(this: PreferencesStore, value: T) => void> | undefined;
            if (!source) adapters.set(this._adapter, source = Event.create<(this: PreferencesStore, value: T) => void>(this._store));
            this._onDidValueChange = source.event;
        }
        return this._onDidValueChange;
    }

    get key() {
        return this._key;
    }

    get defaultValue() {
        return this._defaultValue;
    }

    get isSet() {
        return this._store.has(this.key);
    }

    get value() {
        return this.isSet ? this._adapter.get(this.key, this._store) : this.defaultValue;
    }

    set value(value: T) {
        const editor = this._store.edit();
        this._adapter.set(this.key, value, editor);
        editor.apply();
    }

    delete() {
        this._store
            .edit()
            .delete(this.key)
            .apply();
    }
}
