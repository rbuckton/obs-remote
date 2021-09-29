import React, { useEffect, useState } from "react";
import { useService } from "./useService";
import { IPreferencesService, PreferenceKeys } from "../../preferences/common/preferencesService";

/**
 * A hook to read a preference value and observe changes
 */
export function usePreference<K extends PreferenceKeys>(key: K) {
    const preferences = useService(IPreferencesService);
    const [value, setValue] = useState(() => preferences[key]);
    useEffect(() => {
        const onDidPreferenceChange = (_key: PreferenceKeys) => {
            if (_key === key) setValue(preferences[key]);
        };
        preferences.onDidChange.on(onDidPreferenceChange);
        return () => { preferences.onDidChange.off(onDidPreferenceChange); };
    }, [preferences, setValue]);
    return value;
}

export type PreferenceEditor<K extends PreferenceKeys> = [
    value: IPreferencesService[K],
    setValue: React.Dispatch<React.SetStateAction<IPreferencesService[K]>>,
    commit: (...args: [value: IPreferencesService[K]] | []) => void,
    revert: () => void
] & {
    value: IPreferencesService[K],
    setValue: React.Dispatch<React.SetStateAction<IPreferencesService[K]>>,
    commit: (...args: [value: IPreferencesService[K]] | []) => void;
    revert: () => void
};

/**
 * A hook to edit a preference value and observe changes
 */
export function usePreferenceEditor<K extends PreferenceKeys>(key: K) {
    const preferences = useService(IPreferencesService);
    const [value, setValue] = useState(() => preferences[key]);
    const commit = (...args: [value: IPreferencesService[K]] | []) => {
        const commitValue = args.length === 0 ? value : args[0];
        setValue(commitValue);
        preferences[key] = commitValue;
    };
    const revert = () => { setValue(preferences[key]); };
    useEffect(() => {
        const onDidPreferenceChange = (k: PreferenceKeys) => { if (k === key) setValue(preferences[key]); };
        preferences.onDidChange.on(onDidPreferenceChange);
        return () => { preferences.onDidChange.off(onDidPreferenceChange); };
    }, [preferences, key, setValue]);
    return Object.assign([value, setValue, commit, revert], { value, setValue, commit, revert }) as PreferenceEditor<K>;
}