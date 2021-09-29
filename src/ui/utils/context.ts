import { remote } from "electron";
import { Theme } from "@material-ui/core";
import { IServiceProvider } from "service-composition";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { DarkTheme, LightTheme, getTheme } from "../themes";
import { useHistory } from "react-router-dom";
import { IObsWebSocket, NullObsWebSocket } from "../../obs/renderer";
import { useAsyncEffect } from "../hooks/useAsyncEffect";
import { ThemeKind } from "../../themes/themeKind";
import { IPreferencesService, PreferenceKeys } from "../../preferences/common/preferencesService";

export interface AppContext {
    readonly appDrawerOpen: boolean;
    readonly theme: Theme;
    readonly preferences: IPreferencesService;
    readonly serviceProvider: IServiceProvider;
    readonly obs: IObsWebSocket;
    readonly connected: boolean;
    readonly editMode: boolean;
    readonly fullscreen: boolean;
    setTheme(theme: Theme | ThemeKind | "light" | "dark"): void;
    setConnection(obs: IObsWebSocket | undefined): void;
    setEditMode(editMode: boolean): void;
    setFullscreen(fullscreen: boolean): void;
    openAppDrawer(): void;
    closeAppDrawer(): void;
}

export const AppContext = createContext<AppContext>({
    get appDrawerOpen(): boolean { throw new Error("Not implemented"); },
    get theme(): Theme { throw new Error("Not implemented"); },
    get preferences(): IPreferencesService { throw new Error("Not implemented"); },
    get serviceProvider(): IServiceProvider { throw new Error("Not implemented"); },
    get obs(): IObsWebSocket { throw new Error("Not implemented"); },
    get connected(): boolean { throw new Error("Not implemented"); },
    get editMode(): boolean { throw new Error("Not implemented"); },
    get fullscreen(): boolean { throw new Error("Not implemented"); },
    openAppDrawer(): void { throw new Error("Not implemented"); },
    closeAppDrawer(): void { throw new Error("Not implemented"); },
    setTheme(theme: Theme | ThemeKind | "light" | "dark"): void { throw new Error("Not implemented"); },
    setConnection(obs: IObsWebSocket | undefined): void { throw new Error("Not implemented"); },
    setEditMode(editMode: boolean): void { throw new Error("Not implemented"); },
    setFullscreen(fullscreen: boolean): void { throw new Error("Not implemented"); },
});

export interface AppContextOptions {
    serviceProvider: IServiceProvider;
}

export function createAppContext({
    serviceProvider,
}: AppContextOptions): AppContext {
    // state
    const preferences = serviceProvider.getService(IPreferencesService);
    const history = useHistory();
    const [appDrawerOpen, setAppDrawerOpen] = useState(false);
    const [theme, setTheme] = useState(() => getTheme(preferences.theme));
    const [obs, setObs] = useState<IObsWebSocket>(() => NullObsWebSocket.instance);
    const [connected, setConnected] = useState(() => obs.connected);
    const [editMode, setEditMode] = useState(false);
    const [fullscreen, setFullscreen] = useState(() => !!document.fullscreenElement);
    const blockerRef = useRef<number>();

    // behavior
    const onDidPreferenceChange = (key: PreferenceKeys) => {
        if (key === "theme") {
            setTheme(getTheme(preferences.theme));
        }
    };

    const onConnectionOpened = () => {
        setConnected(true);
    };

    const onConnectionClosed = () => {
        setConnection(NullObsWebSocket.instance);
        setConnected(false);
        history.push("/connect");
    };

    const onError = (e: unknown) => {
        console.error(e);
    };

    const onFullscreenChange = () => {
        setFullscreen(!!document.fullscreenElement);
    };

    const blockSleep = () => {
        if (blockerRef.current === undefined) {
            blockerRef.current = remote.powerSaveBlocker.start("prevent-display-sleep");
        }
    };

    const unblockSleep = () => {
        if (blockerRef.current !== undefined) {
            remote.powerSaveBlocker.stop(blockerRef.current);
            blockerRef.current = undefined;
        }
    };

    const setConnection = (obs: IObsWebSocket = NullObsWebSocket.instance) => {
        setObs(prevObs => {
            if (prevObs !== obs) {
                prevObs.disconnect();
            }
            return obs;
        });
        setConnected(obs.connected);
    };

    // effects
    useEffect(() => {
        // listen for changes to the theme preference
        preferences.onDidChange.on(onDidPreferenceChange);
        return () => { preferences.onDidChange.off(onDidPreferenceChange); }
    }, [preferences]);

    useEffect(() => {
        // listen for changes to the connection state
        obs.on("ConnectionOpened", onConnectionOpened);
        obs.on("ConnectionClosed", onConnectionClosed);
        obs.on("error", onError);
        return () => {
            obs.off("ConnectionOpened", onConnectionOpened);
            obs.off("ConnectionClosed", onConnectionClosed);
            obs.off("error", onError);
        }
    }, [obs]);

    useEffect(() => {
        // listen for changes to the document fullscreenElement
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", onFullscreenChange);
        }
    }, [document]);

    useAsyncEffect(async () => {
        // handle UI updates when the 'fullscreen' state changes
        if (fullscreen) {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen({ navigationUI: "hide" });
            }
        }
        else {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        }
    }, [fullscreen]);

    useEffect(() => {
        // block sleep only when connected and full screen
        if (fullscreen && connected) {
            blockSleep();
        }
        else {
            unblockSleep();
        }
    }, [fullscreen, connected]);

    // ui
    return {
        appDrawerOpen,
        theme,
        preferences,
        serviceProvider,
        obs,
        connected,
        editMode,
        fullscreen,
        openAppDrawer() { setAppDrawerOpen(true); },
        closeAppDrawer() { setAppDrawerOpen(false); },
        setTheme(theme) {
            const themeKind =
                theme === "light" ? ThemeKind.Light :
                theme === "dark" ? ThemeKind.Dark :
                typeof theme === "object" ?
                    theme === DarkTheme ? ThemeKind.Dark :
                    ThemeKind.Light :
                theme;
            preferences.theme = themeKind;
        },
        setConnection,
        setEditMode,
        setFullscreen
    };
}

export function useAppContext() {
    return useContext(AppContext);
}