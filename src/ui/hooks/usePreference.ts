/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { IPreferencesService, PreferenceKeys } from "../../preferences/common/preferencesService";
import { useEvent } from "./useEvent";
import { useEventCallback } from "./useEventCallback";
import { useService } from "./useService";

/**
 * A hook to read a preference value and observe changes.
 */
export function usePreference<K extends PreferenceKeys>(key: K): [value: IPreferencesService[K], setValue: Dispatch<SetStateAction<IPreferencesService[K]>>] {
    // state
    const preferences = useService(IPreferencesService);
    const [state, setState] = useState(() => preferences[key]);

    // behavior
    const setValue: typeof setState = useCallback(value => {
        const prev = preferences[key];
        if (typeof value === "function") {
            value = value(prev);
        }
        if (!Object.is(prev, value)) {
            preferences[key] = value;
        }
    }, [preferences, key]);

    // effects
    useEvent(preferences.onDidChange, k => {
        if (k === key) {
            setState(preferences[key]);
        }
    });

    return [state, setValue];
}

export type PreferenceEditor<K extends PreferenceKeys> = [
    value: IPreferencesService[K],
    setValue: Dispatch<SetStateAction<IPreferencesService[K]>>,
    commit: (...args: [value: IPreferencesService[K]] | []) => void,
    revert: () => void
];

/**
 * A hook to transactionally edit a preference value and observe changes
 */
export function usePreferenceEditor<K extends PreferenceKeys>(key: K): PreferenceEditor<K> {
    // state
    const [prefValue, setPrefValue] = usePreference(key);
    const [tempValue, setTempValue] = useState(prefValue);

    // behavior
    const commit = useEventCallback((...args: [value: IPreferencesService[K]] | []) => {
        const commitValue = args.length === 0 ? tempValue : args[0];
        setPrefValue(commitValue);
    }, [key]);

    const revert = useEventCallback(() => {
        setTempValue(prefValue);
    }, [key]);

    // effects
    // <none>

    return [tempValue, setTempValue, commit, revert];
}