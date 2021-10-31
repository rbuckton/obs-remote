/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { createTheme, Theme } from "@mui/material";
import "@mui/styles";

declare module "@mui/material/styles" {
    interface Palette {
        twitch: Palette['primary']
    }
    interface PaletteOptions {
        twitch?: PaletteOptions['primary'];
    }
}

declare module "@mui/material" {
    interface ButtonPropsColorOverrides {
        twitch: true;
    }
}

declare module '@mui/styles' {
    interface DefaultTheme extends Theme { }
}

export const LightTheme = createTheme({
    palette: {
        mode: "light",
        twitch: {
            main: "#9146ff",
            contrastText: "#fff"
        },
        background: {
            default: "#fff",
            paper: "#eee"
        }
    },
});
