import { Theme } from "@material-ui/core";
import { DarkTheme } from "./dark";
import { LightTheme } from "./light";

export * from "./light";
export * from "./dark";

export const enum ThemeKind {
    Light = 0,
    Dark = 1
}

const themes = [LightTheme, DarkTheme] as [Theme, Theme] & { light: Theme, dark: Theme };
themes.light = LightTheme;
themes.dark = DarkTheme;

export function getTheme(kind: ThemeKind | "light" | "dark") {
    return themes[kind];
}