import { DarkTheme } from "./dark";
import { LightTheme } from "./light";

export * from "./light";
export * from "./dark";

export const enum ThemeKind {
    Light = 0,
    Dark = 1
}

export function getTheme(kind: ThemeKind) {
    return [LightTheme, DarkTheme][kind];
}