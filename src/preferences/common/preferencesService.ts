import { Event } from "@esfx/events";
import { ServiceIdentifier } from "service-composition";
import { ThemeKind } from "../../themes/themeKind";

export const IPreferencesService = ServiceIdentifier.create<IPreferencesService>("IPreferencesService");

export interface IPreferencesService {
    readonly onDidChange: Event<(key: PreferenceKeys) => void>;
    theme: ThemeKind;
    hostname: string;
    port: number;
    authKey: string;
    autoConnect: boolean;
    clear(): void;
}

export type PreferenceKeys =
    | "theme"
    | "hostname"
    | "port"
    | "authKey"
    | "autoConnect"
    ;

export type IPreferencesSnapshot = {
    [K in PreferenceKeys]: IPreferencesService[K];
}

export interface IPreferencesSyncContract {
    getPreferencesSync(): IPreferencesSnapshot;
    setPreferenceSync<K extends keyof IPreferencesSnapshot>(key: K, value: IPreferencesSnapshot[K]): void;
    clear(): void;
}

export interface IPreferencesEventContract {
    didChange: (key: PreferenceKeys) => void;
}
