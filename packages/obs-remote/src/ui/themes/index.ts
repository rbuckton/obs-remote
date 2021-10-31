/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Theme } from "@mui/material";
import { ThemeKind } from "../../themes/themeKind";
import { DarkTheme } from "./dark";
import { LightTheme } from "./light";

export * from "./light";
export * from "./dark";

const themes = [LightTheme, DarkTheme] as [Theme, Theme] & { light: Theme, dark: Theme };
themes.light = LightTheme;
themes.dark = DarkTheme;

export function getTheme(kind: ThemeKind | "light" | "dark") {
    return themes[kind];
}