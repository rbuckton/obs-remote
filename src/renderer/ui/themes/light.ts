import { ButtonClassKey, createMuiTheme, fade } from "@material-ui/core";

declare module "@material-ui/core/styles/createPalette" {
    interface Palette {
        twitch: Palette['primary']
    }
    interface PaletteOptions {
        twitch?: PaletteOptions['primary'];
    }
}

export const LightTheme = createMuiTheme({
    palette: {
        type: "light",
        twitch: {
            main: "#9146ff",
            contrastText: "#fff"
        }
    },
    overrides: {
        MuiButton: {
            ["textTwitch" as ButtonClassKey]: { },
            ["outlinedTwitch" as ButtonClassKey]: { },
            ["containedTwitch" as ButtonClassKey]: { }
        }
    }
});