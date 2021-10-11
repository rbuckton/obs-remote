/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import {
    generateUtilityClass as _generateUtilityClass,
    generateUtilityClasses as _generateUtilityClasses
} from "@mui/material";

interface GlobalStateClassesMapping {
    active: 'Mui-active';
    checked: 'Mui-checked';
    completed: 'Mui-completed';
    disabled: 'Mui-disabled';
    error: 'Mui-error';
    expanded: 'Mui-expanded';
    focused: 'Mui-focused';
    focusVisible: 'Mui-focusVisible';
    required: 'Mui-required';
    selected: 'Mui-selected';
}

export type UtilityClassName<C extends string, S extends string> = S extends keyof GlobalStateClassesMapping ? GlobalStateClassesMapping[S] : `${C}-${S}`;

export type UtilityClasses<C extends string, S extends readonly string[]> = {
    readonly [P in S[number]]: UtilityClassName<C, P>
};

export function generateUtilityClass<C extends string, S extends string>(componentName: C, slot: S): UtilityClassName<C, S>;
export function generateUtilityClass<C extends string, S extends string>(componentName: C, slot: S) {
    return _generateUtilityClass(componentName, slot);
}

export function generateUtilityClasses<C extends string, S extends readonly string[]>(componentName: C, slots: [...S]): UtilityClasses<C, S>;
export function generateUtilityClasses<C extends string, S extends string[]>(componentName: C, slots: S) {
    return _generateUtilityClasses(componentName, slots);
}

export function makeGetUtilityClass<C extends string>(componentName: C): <S extends string>(slot: S) => UtilityClassName<C, S> {
    return slot => generateUtilityClass(componentName, slot);
}

type UtilityClassesJoin<S extends readonly string[]> = 
    S extends readonly [infer Head] ? Extract<Head, string> : 
    S extends readonly [infer Head, ...infer Tail] ? 
        `${Extract<Head, string>} ${UtilityClassesJoin<Extract<Tail, readonly string[]>>}` :
        "";

type UtilityClassesReduce<
    C extends string,
    S extends readonly (string | false | undefined | null)[],
    E extends Partial<Record<string, string>>
> =
    S extends readonly [infer Head, ...infer Tail] ? [
        ...(Head extends string ? Head extends "" ? [] : [Head extends keyof E ? E[Head] : UtilityClassName<C, Head>] : []),
        ...UtilityClassesReduce<C, Extract<Tail, readonly (string | false | undefined | null)[]>, E>
    ] : [];

type UtilityClassesComposition<
    C extends string,
    S extends Record<string, readonly (string | false | undefined | null)[]>,
    E extends Partial<Record<string, string>>
> = {
    [P in keyof S]: UtilityClassesJoin<UtilityClassesReduce<C, S[P], E>>;
};

export function composeClasses<
    C extends string,
    S extends Record<string, readonly (string | false | undefined | null)[]>,
    E extends Partial<Record<string, string>>
>(
    slots: S,
    getUtilityClass: <S extends string>(slot: S) => UtilityClassName<C, S>,
    classes: E | undefined
): UtilityClassesComposition<C, S, E>;
export function composeClasses<
    C extends string,
    S extends Record<string, readonly (string | false | undefined | null)[]>,
    E extends Partial<Record<string, string>>
>(
    slots: S,
    getUtilityClass: <S extends string>(slot: S) => UtilityClassName<C, S>,
    classes: E | undefined
) {
    const output: Record<string, string> = {};
    for (const slot of Object.keys(slots)) {
        output[slot] = slots[slot].reduce((acc, key) => {
            if (key) {
                const override = classes?.[key];
                if (override) acc.push(override);
                acc.push(getUtilityClass(key));
            }
            return acc;
        }, [] as string[]).join(" ");
    }
    return output;
}