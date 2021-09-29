import React, { useContext, useEffect, useState } from "react";
import { CancelToken } from "@esfx/async-canceltoken";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { AppContext } from "../../utils/context";
import { SceneTile } from "./sceneTile";
import { Scene } from "../../../obs/renderer";

export interface SceneTilesProps {
}

export const SceneTiles = ({ }: SceneTilesProps) => {
    // state
    const { obs } = useContext(AppContext);
    const [scenes, setScenes] = useState<Scene[]>();
    const [currentScene, setCurrentScene] = useState<string>();

    // behavior
    const onScenesChanged = async () => {
        await updateScenes();
    };

    const updateScenes = async (token?: CancelToken) => {
        const { "current-scene": currentScene, scenes } = await obs.send("GetSceneList");
        if (token?.signaled) return;
        setScenes(scenes);
        setCurrentScene(currentScene);
    };

    // effects
    useEffect(() => {
        obs.on("ScenesChanged", onScenesChanged);
        obs.on("SceneCollectionChanged", onScenesChanged);
        obs.on("SceneCollectionListChanged", onScenesChanged);
        obs.on("SwitchScenes", onScenesChanged);
        return () => {
            obs.off("ScenesChanged", onScenesChanged);
            obs.off("SceneCollectionChanged", onScenesChanged);
            obs.off("SceneCollectionListChanged", onScenesChanged);
            obs.off("SwitchScenes", onScenesChanged);
        };
    }, [obs]);

    useAsyncEffect(async (token) => {
        await updateScenes(token);
    }, [obs]);

    // ui
    return <>{scenes?.map(scene =>
        <SceneTile
            scene={scene}
            key={scene.name}
            current={scene.name === currentScene}
        />)
    }</>;
};