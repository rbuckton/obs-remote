/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import type { IPreferencesService, PreferenceKeys } from "./preferencesService";

export type IPreferencesSnapshot = {
    readonly [K in PreferenceKeys]: IPreferencesService[K];
};

export interface IPreferencesIpcContract {
    getPreferencesSync(): IPreferencesSnapshot;
    setPreferenceSync<K extends keyof IPreferencesSnapshot>(key: K, value: IPreferencesSnapshot[K]): void;
    clear(): void;
}

export interface IPreferencesIpcEventContract {
    didChange: (key: PreferenceKeys) => void;
}
