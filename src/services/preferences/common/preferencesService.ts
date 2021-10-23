/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Event } from "@esfx/events";
import { ServiceIdentifier } from "service-composition";
import { ThemeKind } from "../../../themes/themeKind";

/**
 * Provides the ability to read and write application-scoped user preferences.
 */
export const IPreferencesService = ServiceIdentifier.create<IPreferencesService>("IPreferencesService");

/**
 * Application-scoped user preferences
 */
export interface IPreferences {
    get theme(): ThemeKind;
    set theme(value: ThemeKind);

    get fullscreen(): boolean;
    set fullscreen(value: boolean);

    get hostname(): string;
    set hostname(value: string);

    get port(): number;
    set port(value: number);

    get rememberAuthKey(): boolean;
    set rememberAuthKey(value: boolean);

    get authKey(): string;
    set authKey(value: string);

    get autoConnect(): boolean;
    set autoConnect(value: boolean);
}

/**
 * Provides the ability to read and write application-scoped user preferences.
 */
export interface IPreferencesService extends IPreferences {
    /**
     * An event raised when a preference changes.
     */
    readonly onDidChange: Event<(key: PreferenceKeys) => void>;
    /**
     * Clears all user preferences
     */
    clear(): void;
}

export type PreferenceKeys = keyof IPreferences;
