import { remote } from "electron";
import { Theme } from "@material-ui/core";
import { createContext, useEffect, useRef, useState } from "react";
import { PreferencesService } from "../../preferences";
import { getTheme, ThemeKind } from "../themes";
import { useHistory } from "react-router-dom";
import { IObsWebSocket } from "../../obs/obsWebSocket";
import { NullObsWebSocket } from "../../obs";

export const editModeHiddenKey = "__obs-remote-hidden__";

export interface AppContext {
    readonly appDrawerOpen: boolean;
    readonly theme: Theme;
    readonly preferences: PreferencesService;
    readonly obs: IObsWebSocket;
    readonly editMode: boolean;
    setTheme(theme: Theme): void;
    setConnection(obs: IObsWebSocket | undefined): void;
    setEditMode(editMode: boolean): void;
    openAppDrawer(): void;
    closeAppDrawer(): void;
}

export const AppContext = createContext<AppContext>({
    get appDrawerOpen(): boolean { throw new Error("Not implemented"); },
    get theme(): Theme { throw new Error("Not implemented"); },
    get preferences(): PreferencesService { throw new Error("Not implemented"); },
    get obs(): IObsWebSocket { throw new Error("Not implemented"); },
    get editMode(): boolean { throw new Error("Not implemented"); },
    openAppDrawer(): void { throw new Error("Not implemented"); },
    closeAppDrawer(): void { throw new Error("Not implemented"); },
    setTheme(theme: Theme): void { throw new Error("Not implemented"); },
    setConnection(obs: IObsWebSocket | undefined): void { throw new Error("Not implemented"); },
    setEditMode(editMode: boolean): void { throw new Error("Not implemented"); },
});

export interface AppContextOptions {
    preferences: PreferencesService;
}

export function createAppContext({ preferences }: AppContextOptions): AppContext {
    // state
    const history = useHistory();
    const [appDrawerOpen, setAppDrawerOpen] = useState(false);
    const [theme, setTheme] = useState(getTheme(preferences.theme.value));
    const [obs, setObs] = useState<IObsWebSocket>(NullObsWebSocket.instance);
    const [editMode, setEditMode] = useState(false);
    const obsRef = useRef<IObsWebSocket>(NullObsWebSocket.instance);
    const blockerRef = useRef<number>();

    // behavior
    const onDidValueChange = (kind: ThemeKind) => {
        setTheme(getTheme(kind));
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

    const onOpened = () => {
        blockSleep();
    };

    const onClosed = () => {
        unblockSleep();
        if (obs === obsRef.current) {
            setConnection(NullObsWebSocket.instance);
            history.push("/connect");
        }
    };

    const onError = (e: unknown) => {
        console.error(e);
    };

    const setConnection = (newObs: IObsWebSocket = NullObsWebSocket.instance) => {
        if (newObs !== obs) {
            obs?.disconnect();
            obsRef.current = newObs;
            if (newObs.connected) {
                blockSleep();
            }
            else {
                unblockSleep();
            }
            setObs(newObs);
        }
    };

    // effects
    useEffect(() => {
        // listen for changes to the theme preference
        const currentTheme = preferences.theme;
        currentTheme.onDidValueChange.on(onDidValueChange);
        return () => { currentTheme.onDidValueChange.off(onDidValueChange); }
    }, [preferences]);

    useEffect(() => {
        // listen for changes to the connection state
        obs.on("ConnectionOpened", onOpened);
        obs.on("ConnectionClosed", onClosed);
        obs.on("Exited", onClosed);
        obs.on("error", onError);
        return () => {
            obs.off("ConnectionOpened", onOpened);
            obs.off("ConnectionClosed", onClosed);
            obs.off("Exited", onClosed);
            obs.off("error", onError);
        }
    }, [obs]);

    // ui
    return {
        appDrawerOpen,
        theme,
        preferences,
        obs,
        editMode,
        openAppDrawer() { setAppDrawerOpen(true); },
        closeAppDrawer() { setAppDrawerOpen(false); },
        setTheme,
        setConnection,
        setEditMode
    };
}