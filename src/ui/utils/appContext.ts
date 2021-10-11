/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { CancelToken } from "@esfx/async-canceltoken";
import { Theme } from "@mui/material";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { sameFilter, sameMap } from "../../core/common/fn";
import { Version } from "../../core/common/version";
import { MediaSource, Output, Scene, SceneItem, Source, SourceType, SourceTypeId, Transition } from "../../obs/common/protocol";
import { IObsWebSocket, NullObsWebSocket } from "../../obs/renderer";
import { executeBatch } from "../../obs/renderer/obsBatchRecorder";
import { IPreferencesService } from "../../preferences/common/preferencesService";
import { ThemeKind } from "../../themes/themeKind";
import { useAsyncCallback } from "../hooks/useAsyncCallback";
import { useAsyncEffect } from "../hooks/useAsyncEffect";
import { useEvent } from "../hooks/useEvent";
import { useEventCallback } from "../hooks/useEventCallback";
import { usePreference } from "../hooks/usePreference";
import { useService } from "../hooks/useService";
import { DarkTheme, getTheme } from "../themes";

export interface AppContext {
    readonly appDrawerOpen: boolean;
    readonly theme: Theme;
    readonly preferences: IPreferencesService;
    readonly obs: IObsWebSocket;
    readonly connected: boolean;
    readonly version: Version | undefined;
    readonly editMode: boolean;
    readonly fullscreen: boolean;

    // obs state
    readonly availableRequests: ReadonlySet<string>;
    readonly sourceTypes: ReadonlyMap<string, SourceType>;
    readonly outputs: ReadonlyMap<string, Output>;
    readonly transitions: ReadonlyMap<string, Transition>;
    readonly currentTransition: string | undefined;
    readonly profiles: readonly string[];
    readonly currentProfile: string | undefined;
    readonly sceneCollections: readonly string[];
    readonly currentSceneCollection: string | undefined;
    readonly scenes: ReadonlyMap<string, Scene>;
    readonly currentScene: string | undefined;
    readonly currentSceneItems: ReadonlyMap<string, SceneItem>;
    readonly currentSceneItemsById: ReadonlyMap<number, SceneItem>;
    readonly sources: ReadonlyMap<string, Source>;
    readonly mediaSources: ReadonlyMap<string, MediaSource>;

    setTheme(theme: Theme | ThemeKind | "light" | "dark"): void;
    setConnection(obs: IObsWebSocket | undefined): void;
    setEditMode(editMode: boolean): void;
    setFullscreen(fullscreen: boolean): void;
    openAppDrawer(): void;
    closeAppDrawer(): void;
}

export const AppContext = createContext<AppContext>(new Proxy({} as AppContext, {
    get() { throw new Error("Not implemented"); }
}));

/**
 * The application context provides access to application-scoped variables and behaviors.
 */
export function createAppContext(): AppContext {

    // state
    const preferences = useService(IPreferencesService);
    const history = useHistory();
    const [appDrawerOpen, setAppDrawerOpen] = useState(false);
    const [obs, setObs] = useState(() => NullObsWebSocket.instance);
    const [version, setVersion] = useState<Version>();
    const [connected, setConnected] = useState(() => obs.connected);
    const [editMode, setEditMode] = useState(false);
    const [themePreference, setThemePreference] = usePreference("theme");
    const [fullscreen, setFullscreen] = usePreference("fullscreen");
    const theme = useMemo(() => getTheme(themePreference), [themePreference]);

    // obs settings
    const [availableRequestsArray, setAvailableRequests] = useState<readonly string[]>();
    const [sourceTypesArray, setSourceTypes] = useState<readonly SourceType[]>();
    const [outputsArray, setOutputs] = useState<readonly Output[]>();
    const [transitionsArray, setTransitions] = useState<readonly Transition[]>();
    const [currentTransition, setCurrentTransition] = useState<string>();
    const [profiles, setProfiles] = useState<readonly string[]>([]);
    const [currentProfile, setCurrentProfile] = useState<string>();
    const [sceneCollections, setSceneCollections] = useState<readonly string[]>([]);
    const [currentSceneCollection, setCurrentSceneCollection] = useState<string>();
    const [scenesArray, setScenes] = useState<readonly Scene[]>();
    const [currentScene, setCurrentScene] = useState<string>();
    const [currentSceneItemsArray, setCurrentSceneItems] = useState<readonly SceneItem[]>();
    const [sourcesArray, setSources] = useState<readonly Source[]>();
    const [mediaSourcesArray, setMediaSources] = useState<readonly MediaSource[]>();

    const availableRequests = useMemo(() => new Set(availableRequestsArray), [availableRequestsArray]);
    const sourceTypes = useMemo(() => toSourceTypeMap(sourceTypesArray), [sourceTypesArray]);
    const outputs = useMemo(() => toOutputMap(outputsArray), [outputsArray]);
    const transitions = useMemo(() => toTransitionMap(transitionsArray), [transitionsArray]);
    const scenes = useMemo(() => toSceneMap(scenesArray), [scenesArray]);
    const currentSceneItems = useMemo(() => toSceneItemMap(currentSceneItemsArray), [currentSceneItemsArray]);
    const currentSceneItemsById = useMemo(() => toSceneItemByIdMap(currentSceneItemsArray), [currentSceneItemsArray]);
    const sources = useMemo(() => toSourceMap(sourcesArray), [sourcesArray]);
    const mediaSources = useMemo(() => toMediaSourceMap(mediaSourcesArray), [mediaSourcesArray]);

    // behavior
    const setConnection = useEventCallback((obs: IObsWebSocket = NullObsWebSocket.instance) => {
        setObs(prevObs => {
            if (prevObs !== obs) {
                prevObs.disconnect();
                setVersion(undefined);
                setAvailableRequests(undefined);
                setSourceTypes(undefined);
                setOutputs(undefined);
                setTransitions(undefined);
                setCurrentTransition(undefined);
                setProfiles([]);
                setCurrentProfile(undefined);
                setSceneCollections([]);
                setCurrentSceneCollection(undefined);
                setScenes(undefined);
                setCurrentScene(undefined);
                setCurrentSceneItems(undefined);
                setSources(undefined);
                setMediaSources(undefined);
            }
            return obs;
        });
        setConnected(obs.connected);
    });

    const openAppDrawer = useEventCallback(() => {
        setAppDrawerOpen(true);
    });

    const closeAppDrawer = useEventCallback(() => {
        setAppDrawerOpen(false);
    });

    const setTheme = useEventCallback((theme: Theme | ThemeKind | "light" | "dark") => {
        const themeKind =
            theme === "light" ? ThemeKind.Light :
            theme === "dark" ? ThemeKind.Dark :
            typeof theme === "object" ?
                theme.palette.mode === "light" ?
                    ThemeKind.Light :
                    ThemeKind.Dark :
                theme;
        setThemePreference(themeKind);
    });

    const refreshState = useAsyncCallback(async (token, requested: ObsStateValues = ObsStateValues.All) => {
        const recorder = async (obs: IObsWebSocket) => {
            const promises: Promise<void>[] = [];
            if (requested & ObsStateValues.SourceTypes) {
                promises.push(refreshSourceTypes(token, obs, availableRequests, setSourceTypes));
            }
            if (requested & ObsStateValues.Outputs) {
                promises.push(refreshOutputs(token, obs, availableRequests, setOutputs));
            }
            if (requested & ObsStateValues.Transitions) {
                requested &= ~ObsStateValues.CurrentTransition;
                promises.push(refreshTransitions(token, obs, availableRequests, setTransitions, setCurrentTransition));
            }
            if (requested & ObsStateValues.CurrentTransition) {
                promises.push(refreshCurrentTransition(token, obs, availableRequests, setCurrentTransition));
            }
            if (requested & ObsStateValues.Profiles) {
                promises.push(refreshProfiles(token, obs, availableRequests, setProfiles));
            }
            if (requested & ObsStateValues.CurrentProfile) {
                promises.push(refreshCurrentProfile(token, obs, availableRequests, setCurrentProfile));
            }
            if (requested & ObsStateValues.SceneCollections) {
                promises.push(refreshSceneCollections(token, obs, availableRequests, setSceneCollections));
            }
            if (requested & ObsStateValues.CurrentSceneCollection) {
                promises.push(refreshCurrentSceneCollection(token, obs, availableRequests, setCurrentSceneCollection));
            }
            if (requested & ObsStateValues.Scenes) {
                requested &= ~ObsStateValues.CurrentScene;
                promises.push(refreshScenes(token, obs, availableRequests, setScenes, setCurrentScene));
            }
            if (requested & (ObsStateValues.CurrentScene | ObsStateValues.CurrentSceneItems)) {
                promises.push(refreshCurrentScene(token, obs, availableRequests, setCurrentScene, setCurrentSceneItems));
            }
            if (requested & ObsStateValues.Sources) {
                promises.push(refreshSources(token, obs, availableRequests, setSources));
            }
            if (requested & ObsStateValues.MediaSources) {
                promises.push(refreshMediaSources(token, obs, availableRequests, setMediaSources));
            }
            await Promise.all(promises);
        };

        if (availableRequests.has("ExecuteBatch")) {
            await executeBatch(obs, recorder);
        }
        else {
            await recorder(obs);
        }
    }, [obs, version, availableRequests]);

    // effects
    useEvent(preferences.onDidChange, key => {
        if (key === "theme") {
            setTheme(getTheme(preferences.theme));
        }
    });

    useEvent(obs, "error", e => {
        console.error(e);
    });

    useEvent(obs, "ConnectionOpened", () => {
        setConnected(true);
    });

    useEvent(obs, "ConnectionClosed", () => {
        setConnection(NullObsWebSocket.instance);
        setConnected(false);
        history.push("/connect");
    });

    useEvent(obs, "SwitchScenes", ({ "scene-name": sceneName, sources: sceneItems }) => {
        setCurrentScene(sceneName);
        setCurrentSceneItems(sceneItems);
    }, []);

    useEvent(obs, "ScenesChanged", () => {
        void refreshState(ObsStateValues.ScenesChangedIncludes);
    }, [refreshState]);

    useEvent(obs, "SceneCollectionChanged", () => {
        void refreshState(ObsStateValues.SceneCollectionChangedIncludes);
    }, [refreshState]);

    useEvent(obs, "SceneCollectionListChanged", () => {
        void refreshState(ObsStateValues.SceneCollectionListChangedIncludes);
    }, [refreshState]);

    useEvent(obs, "TransitionListChanged", () => {
        void refreshState(ObsStateValues.TransitionListChangedIncludes);
    }, [refreshState]);

    useEvent(obs, "ProfileChanged", () => {
        void refreshState(ObsStateValues.ProfileChangedIncludes);
    }, [refreshState]);

    useEvent(obs, "ProfileListChanged", () => {
        void refreshState(ObsStateValues.ProfileListChangedIncludes);
    }, [refreshState]);

    useEvent(obs, "SourceCreated", () => {
        void refreshState(ObsStateValues.SourceCreatedIncludes);
    }, [refreshState]);

    useEvent(obs, "SourceDestroyed", ({ sourceName, sourceType, sourceKind }) => {
        try {
            const existingScene = sourceType === "scene" ? scenes?.get(sourceName) : undefined;

            let existingSource = sources?.get(sourceName);
            if (existingSource && (existingSource.type !== sourceType || existingSource.typeId !== sourceKind)) {
                existingSource = undefined;
            }

            let existingSceneItem = currentSceneItems?.get(sourceName);
            if (existingSceneItem && (existingSceneItem.type !== sourceType || existingSceneItem.type !== sourceKind)) {
                existingSceneItem = undefined;
            }

            let existingMediaSource = mediaSources?.get(sourceName);
            if (existingMediaSource && existingMediaSource.sourceKind !== sourceKind) {
                existingMediaSource = undefined;
            }

            if (!existingScene &&
                !existingSource &&
                !existingSceneItem &&
                !existingMediaSource) {
                throw new Error();
            }

            let newScenes = scenesArray;
            let newCurrentScene = currentScene;
            let newCurrentSceneItems = currentSceneItemsArray;
            let newSources = sourcesArray;
            let newMediaSources = mediaSourcesArray;
    
            if (existingScene) {
                newScenes = sameFilter(newScenes, scene => scene !== existingScene);
                if (newCurrentScene === existingScene.name) {
                    newCurrentScene = undefined;
                    newCurrentSceneItems = undefined;
                }
            }

            if (existingSource) {
                newSources = sameFilter(newSources, source => source !== existingSource);
            }

            if (existingSceneItem) {
                newCurrentSceneItems = sameFilter(newCurrentSceneItems, sceneItem => sceneItem !== existingSceneItem);
            }

            if (existingMediaSource) {
                newMediaSources = sameFilter(newMediaSources, mediaSource => mediaSource !== existingMediaSource);
            }

            setScenes(newScenes);
            setCurrentScene(newCurrentScene);
            setCurrentSceneItems(newCurrentSceneItems);
            setSources(newSources);
            setMediaSources(newMediaSources);
        }
        catch {
            void refreshState(ObsStateValues.SourceDestroyedIncludes);
        }
    }, [refreshState, scenesArray, currentScene, currentSceneItemsArray, sourcesArray, mediaSourcesArray, scenes, sources, currentSceneItems, mediaSources]);

    useEvent(obs, "SwitchTransition", ({ "transition-name": name }) => {
        setCurrentTransition(name);
    }, []);

    useEvent(obs, "SourceRenamed", ({ sourceType, previousName, newName }) => {
        try {
            const existingScene = sourceType === "scene" ? scenes?.get(previousName) : undefined;

            let existingSource = sources?.get(previousName);
            if (existingSource && existingSource.type !== sourceType) existingSource = undefined;

            let existingSceneItem = currentSceneItems?.get(previousName);
            if (existingSceneItem && existingSceneItem.type !== sourceType) existingSceneItem = undefined;

            let existingMediaSource = mediaSources?.get(previousName);
            if (existingMediaSource && existingMediaSource.sourceKind !== existingSource?.typeId) existingMediaSource = undefined;

            if (!existingScene &&
                !existingSource &&
                !existingSceneItem &&
                !existingMediaSource) {
                throw new Error();
            }

            let newScenes = scenesArray;
            let newCurrentScene = currentScene;
            let newCurrentSceneItems = currentSceneItemsArray;
            let newSources = sourcesArray;
            let newMediaSources = mediaSourcesArray;
    
            if (existingScene) {
                newScenes = sameMap(newScenes, scene => scene === existingScene ? { ...scene, name: newName } : scene);
                if (newCurrentScene === previousName) {
                    newCurrentScene = newName;
                }
            }

            if (existingSource) {
                newSources = sameMap(newSources, source => source === existingSource ? { ...source, name: newName } : source);
            }

            if (existingSceneItem) {
                newCurrentSceneItems = sameMap(newCurrentSceneItems, item => item === existingSceneItem ? { ...item, name: newName } : item);
            }

            if (existingMediaSource) {
                newMediaSources = sameMap(newMediaSources, mediaSource => mediaSource === existingMediaSource ? { ...mediaSource, sourceName: newName } : mediaSource);
            }

            setScenes(newScenes);
            setCurrentScene(newCurrentScene);
            setCurrentSceneItems(newCurrentSceneItems);
            setSources(newSources);
            setMediaSources(newMediaSources);
        }
        catch {
            void refreshState(ObsStateValues.SourceRenamedIncludes);
            return;
        }
    }, [refreshState, scenesArray, currentScene, currentSceneItemsArray, sourcesArray, mediaSourcesArray, scenes, sources, currentSceneItems, mediaSources]);

    useEvent(obs, "SourceOrderChanged", ({ "scene-name": sceneName, "scene-items": sceneItems }) => {
        try {
            if (currentScene === sceneName &&
                currentSceneItemsArray &&
                currentSceneItems &&
                currentSceneItemsById
            ) {
                const newCurrentSceneItems = sceneItems.map(newItem => {
                    const sceneItem = 
                        currentSceneItemsById.get(newItem["item-id"]) ||
                        currentSceneItems.get(newItem["source-name"]);
                    if (!sceneItem) {
                        throw new Error();
                    }
                    return sceneItem;
                });
                setCurrentSceneItems(newCurrentSceneItems);
            }            
        }
        catch {
            void refreshState(ObsStateValues.SourceOrderChangedIncludes);
        }
    }, [refreshState, currentSceneItemsArray, currentScene, currentSceneItems, currentSceneItemsById]);

    useEvent(obs, "SceneItemAdded", () => {
        void refreshState(ObsStateValues.SceneItemAddedIncludes);
    }, [refreshState]);

    useEvent(obs, "SceneItemRemoved", ({ "scene-name": sceneName, "item-id": itemId, "item-name": itemName }) => {
        try {
            if (currentScene === sceneName &&
                currentSceneItemsArray &&
                currentSceneItems &&
                currentSceneItemsById
            ) {
                const existingSceneItem = 
                    currentSceneItemsById.get(itemId) ||
                    currentSceneItems.get(itemName);
                if (!existingSceneItem) {
                    throw new Error();
                }
                setCurrentSceneItems(sameFilter(currentSceneItemsArray, sceneItem => sceneItem !== existingSceneItem));
            }
        }
        catch {
            void refreshState(ObsStateValues.SceneItemRemovedIncludes);
        }
    }, [refreshState, currentScene, currentSceneItemsArray, currentSceneItems, currentSceneItemsById]);

    // When OBS is connected, retrieve information about the version
    useAsyncEffect(async token => {
        if (connected && (!version || !availableRequestsArray)) {
            const {
                "obs-websocket-version": versionString,
                "available-requests": availableRequests
            } = await obs.send("GetVersion");
            if (token.signaled) return;

            setVersion(Version.parse(versionString));
            setAvailableRequests(availableRequests.split(/,/g).map(s => s.trim()));
        }
    }, [obs, connected, version, availableRequestsArray]);

    // when OBS is connected, retrieve information about the current state
    useEffect(() => {
        if (connected && version && availableRequestsArray) {
            void refreshState(ObsStateValues.All);
        }
    }, [refreshState, connected, version, availableRequestsArray]);

    return {
        appDrawerOpen,
        theme,
        preferences,
        obs,
        version,
        availableRequests,
        connected,
        editMode,
        fullscreen,

        sourceTypes,
        outputs,
        transitions,
        currentTransition,
        profiles,
        currentProfile,
        sceneCollections,
        currentSceneCollection,
        scenes,
        currentScene,
        currentSceneItems,
        currentSceneItemsById,
        sources,
        mediaSources,

        openAppDrawer,
        closeAppDrawer,
        setTheme,
        setConnection,
        setEditMode,
        setFullscreen
    };
}

export function useAppContext() {
    return useContext(AppContext);
}

const enum ObsStateValues {
    SourceTypes = 1 << 0,
    Outputs = 1 << 1,
    Transitions = 1 << 2,
    CurrentTransition = 1 << 3,
    Profiles = 1 << 4,
    CurrentProfile = 1 << 5,
    SceneCollections = 1 << 6,
    CurrentSceneCollection = 1 << 7,
    Scenes = 1 << 8,
    CurrentScene = 1 << 9,
    CurrentSceneItems = 1 << 10,
    Sources = 1 << 11,
    MediaSources = 1 << 12,

    All = (MediaSources << 1) - 1,

    SwitchScenesIncludes = CurrentScene | CurrentSceneItems,
    ScenesChangedIncludes = Scenes | CurrentScene | CurrentSceneItems | Sources,
    SceneCollectionChangedIncludes = CurrentSceneCollection | Scenes | CurrentScene | CurrentSceneItems | Sources | MediaSources,
    SceneCollectionListChangedIncludes = SceneCollections | CurrentSceneCollection | Scenes | CurrentScene | CurrentSceneItems | Sources | MediaSources,

    SwitchTransitionIncludes = CurrentTransition,
    TransitionListChangedIncludes = Transitions,

    // TODO: does changing profile change anything else?
    ProfileChangedIncludes = CurrentProfile,
    ProfileListChangedIncludes = Profiles | ProfileChangedIncludes,

    SourceCreatedIncludes = Sources | MediaSources | CurrentSceneItems,
    SourceDestroyedIncludes = Sources | MediaSources | CurrentSceneItems,
    SourceRenamedIncludes = Sources | MediaSources | Scenes | CurrentScene | CurrentSceneItems,

    SourceOrderChangedIncludes = CurrentSceneItems,
    SceneItemAddedIncludes = CurrentSceneItems,
    SceneItemRemovedIncludes = CurrentSceneItems,
}

async function refreshSourceTypes(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setSourceTypes: Dispatch<SetStateAction<readonly SourceType[] | undefined>>) {
    if (!availableRequests.has("GetSourceTypesList")) return;
    const { types } = await obs.send("GetSourceTypesList");
    if (token.signaled) return;
    setSourceTypes(types);
}

async function refreshOutputs(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setState: Dispatch<SetStateAction<readonly Output[] | undefined>>) {
    if (!availableRequests.has("ListOutputs")) return;
    const { outputs } = await obs.send("ListOutputs");
    if (token.signaled) return;
    setState(outputs);
}

async function refreshTransitions(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setTransitions: Dispatch<SetStateAction<readonly Transition[] | undefined>>, setCurrentTransition: Dispatch<SetStateAction<string | undefined>>) {
    if (!availableRequests.has("GetTransitionList")) return;
    const { transitions, "current-transition": current } = await obs.send("GetTransitionList");
    if (token.signaled) return;
    setTransitions(transitions);
    setCurrentTransition(current);
}

async function refreshCurrentTransition(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setCurrentTransition: Dispatch<SetStateAction<string | undefined>>) {
    if (!availableRequests.has("GetCurrentTransition")) return;
    const { name } = await obs.send("GetCurrentTransition");
    if (token.signaled) return;
    setCurrentTransition(name);
}

async function refreshProfiles(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setProfiles: Dispatch<SetStateAction<readonly string[]>>) {
    if (!availableRequests.has("ListProfiles")) return;
    const { profiles } = await obs.send("ListProfiles");
    if (token.signaled) return;
    setProfiles(profiles.map(profile => profile["profile-name"]));
}

async function refreshCurrentProfile(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setCurrentProfile: Dispatch<SetStateAction<string | undefined>>) {
    if (!availableRequests.has("GetCurrentProfile")) return;
    const { "profile-name": name } = await obs.send("GetCurrentProfile");
    if (token.signaled) return;
    setCurrentProfile(name);
}

async function refreshSceneCollections(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setSceneCollections: Dispatch<SetStateAction<readonly string[]>>) {
    if (!availableRequests.has("ListSceneCollections")) return;
    const { "scene-collections": collections } = await obs.send("ListSceneCollections");
    if (token.signaled) return;
    setSceneCollections(collections.map(collection => collection["sc-name"]));
}

async function refreshCurrentSceneCollection(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setCurrentSceneCollection: Dispatch<SetStateAction<string | undefined>>) {
    if (!availableRequests.has("GetCurrentSceneCollection")) return;
    const { "sc-name": name } = await obs.send("GetCurrentSceneCollection");
    if (token.signaled) return;
    setCurrentSceneCollection(name);
}

async function refreshScenes(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setScenes: Dispatch<SetStateAction<readonly Scene[] | undefined>>, setCurrentScene: Dispatch<SetStateAction<string | undefined>>) {
    if (!availableRequests.has("GetSceneList")) return;
    const { scenes, "current-scene": currentSceneName } = await obs.send("GetSceneList");
    if (token.signaled) return;
    setScenes(scenes);
    setCurrentScene(currentSceneName);
}

async function refreshCurrentScene(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setCurrentScene: Dispatch<SetStateAction<string | undefined>>, setCurrentSceneItems: Dispatch<SetStateAction<readonly SceneItem[] | undefined>>) {
    if (!availableRequests.has("GetCurrentScene")) return;
    const { name, sources } = await obs.send("GetCurrentScene");
    if (token.signaled) return;
    setCurrentScene(name);
    setCurrentSceneItems(sources);
}

async function refreshSources(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setSources: Dispatch<SetStateAction<readonly Source[] | undefined>>) {
    if (!availableRequests.has("GetSourcesList")) return;
    const { sources } = await obs.send("GetSourcesList");
    if (token.signaled) return;
    setSources(sources);
}

// since 4.9.0
async function refreshMediaSources(token: CancelToken, obs: IObsWebSocket, availableRequests: ReadonlySet<string>, setMediaSources: Dispatch<SetStateAction<readonly MediaSource[] | undefined>>) {
    if (!availableRequests.has("GetMediaSourcesList")) return;
    const { mediaSources } = await obs.send("GetMediaSourcesList");
    if (token.signaled) return;
    setMediaSources(mediaSources);
}

function toSourceTypeMap(sourceTypes: readonly SourceType[] | undefined): ReadonlyMap<SourceTypeId, SourceType> {
    return new Map(sourceTypes?.map(sourceType => [sourceType.typeId, sourceType]));
}

function toOutputMap(outputs: readonly Output[] | undefined): ReadonlyMap<string, Output> {
    return new Map(outputs?.map(output => [output.name, output]));
}

function toTransitionMap(transitions: readonly Transition[] | undefined): ReadonlyMap<string, Transition> {
    return new Map(transitions?.map(transition => [transition.name, transition]));
}

function toSceneMap(scenes: readonly Scene[] | undefined): ReadonlyMap<string, Scene> {
    return new Map(scenes?.map(scene => [scene.name, scene]));
}

function toSceneItemMap(sceneItems: readonly SceneItem[] | undefined): ReadonlyMap<string, SceneItem> {
    return new Map(sceneItems?.map(item => [item.name, item]))
}

function toSceneItemByIdMap(sceneItems: readonly SceneItem[] | undefined): ReadonlyMap<number, SceneItem> {
    return new Map(sceneItems?.map(item => [item.id, item]))
}

function toSourceMap(sources: readonly Source[] | undefined): ReadonlyMap<string, Source> {
    return new Map(sources?.map(source => [source.name, source]));
}

function toMediaSourceMap(mediaSources: readonly MediaSource[] | undefined): ReadonlyMap<string, MediaSource> {
    return new Map(mediaSources?.map(source => [source.sourceName, source]));
}