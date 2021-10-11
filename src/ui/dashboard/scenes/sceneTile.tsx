/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { CancelToken } from "@esfx/async-canceltoken";
import { Image as ImageIcon } from "@mui/icons-material";
import { Avatar, Card, CardActionArea, CardActions, CardHeader, CardMedia, Grid, useTheme } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useMemo, useRef, useState } from "react";
import { Scene, SourceFilterAddedEventArgs, SourceFilterRemovedEventArgs, SourceFiltersReorderedEventArgs, SourceFilterVisibilityChangedEventArgs, SourceType, SourceTypeId } from "../../../obs/common/protocol";
import { getSourceHiddenCustomProperty, setSourceHiddenCustomProperty } from "../../../obs/renderer/extensions";
import { EditModeBadge } from "../../components/editModeBadge";
import { EditModeContainer } from "../../components/editModeContainer";
import { EditModeContent } from "../../components/editModeContent";
import { useAsyncCallback } from "../../hooks/useAsyncCallback";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useAsyncEventCallback } from "../../hooks/useAsyncEventCallback";
import { useEvent } from "../../hooks/useEvent";
import { useAppContext } from "../../utils/appContext";
import { generateUtilityClasses } from "../../utils/mui";

const classes = generateUtilityClasses("SceneTile", [
    "root",
    "card",
    "cardCurrent",
    "avatar",
    "avatarCurrent",
    "header",
]);

const Root = styled(Grid)(({ theme }) => ({
    [`&.${classes.root}`]: {
        minWidth: "128px",
        maxWidth: "512px"
    },
    [`& .${classes.card}`]: theme.palette.mode === "light" ? {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.getContrastText(theme.palette.background.paper),
    } : {},
    [`& .${classes.cardCurrent}`]: {
        backgroundColor: theme.palette.info.main,
        color: theme.palette.getContrastText(theme.palette.info.main),
    },
    [`& .${classes.avatar}`]: {
        backgroundColor: theme.palette.action.selected
    },
    [`& .${classes.avatarCurrent}`]: {
        backgroundColor: theme.palette.info.light
    },
    [`& .${classes.header}`]: {
        [theme.breakpoints.down('md')]: {
            "& .MuiCardHeader-avatar": {
                display: "none"
            }
        }
    }
}));

export interface SceneTileProps {
    scene: Scene;
    current?: boolean;
}

export const SceneTile = ({
    scene,
    current
}: SceneTileProps) => {

    // state
    const { obs, editMode, scenes, sourceTypes } = useAppContext();
    const [sceneName, setSceneName] = useState(() => scene.name);
    const [thumbnail, setThumbnail] = useState<string>();
    const [hidden, setHidden] = useState<boolean>();
    const [pending, setPending] = useState(false);
    const theme = useTheme();
    const updatingThumbnailRef = useRef(false);
    const sources = useMemo(() => scene.sources.reduce((m, s) => {
        let set = m.get(s.name);
        if (!set) m.set(s.name, set = new Map());
        set.set(s.id, s.render);
        return m;
    }, new Map<string, Map<number, boolean>>()), [scene]);

    // behavior
    const onClick = useAsyncEventCallback(async token => {
        if (editMode) {
            setHidden(!hidden);
            setPending(true);
            try {
                const { sourceSettings } = await obs.send("GetSourceSettings", { sourceName: scene.name });
                if (token.signaled) return;

                setSourceHiddenCustomProperty(sourceSettings, !hidden);
                await obs.send("SetSourceSettings", { sourceName: scene.name, sourceSettings });
            }
            finally {
                if (!token.signaled) {
                    setPending(false);
                }
            }
        }
        else {
            await obs.send("SetCurrentScene", { "scene-name": scene.name });
        }
    });

    const onSourceChanged = ({ sourceName }: SourceFilterAddedEventArgs | SourceFilterRemovedEventArgs | SourceFilterVisibilityChangedEventArgs | SourceFiltersReorderedEventArgs) => {
        const items = sources.get(sourceName);
        let isVisible = false;
        if (items) {
            for (const visible of items.values()) {
                if (visible) {
                    isVisible = true;
                    break;
                }
            }
        }
        if (isVisible) {
            void updateThumbnail();
        }
    };

    const trackSceneItem = (id: number, name: string, visible?: boolean) => {
        let items = sources.get(name);
        if (!items) sources.set(name, items = new Map<number, boolean>());
        const isVisible = items.get(id);
        if (visible === undefined || visible !== isVisible) {
            items.set(id, visible ?? isVisible ?? true);
        }
    };

    const untrackSceneItem = (id: number, name: string) => {
        const items = sources.get(name);
        if (items?.delete(id)) {
            sources.delete(name);
        }
    };

    const isSceneItemVisible = (id: number, name: string) => {
        return sources.get(name)?.get(id) ?? false;
    };

    const updateThumbnail = useAsyncCallback(async token => {
        if (updatingThumbnailRef.current) return;
        try {
            updatingThumbnailRef.current = true;
            const { img } = await obs.send("TakeSourceScreenshot", {
                sourceName: scene.name,
                embedPictureFormat: "jpg",
                width: 320
            });
            if (token.signaled) return;
            setThumbnail(img);
        }
        finally {
            updatingThumbnailRef.current = false;
        }
    }, [obs]);

    // listen for changes that would effect re-rendering the thumbnail
    useEvent(obs, "SceneItemAdded", ({ "scene-name": scene, "item-id": id, "item-name": name }) => {
        if (scene !== sceneName) return;
        trackSceneItem(id, name);
        if (isSceneItemVisible(id, name)) {
            void updateThumbnail();
        }
    });

    useEvent(obs, "SceneItemRemoved", ({ "scene-name": scene, "item-id": id, "item-name": name }) => {
        if (scene !== sceneName) return;
        untrackSceneItem(id, name);
        void updateThumbnail();
    });

    useEvent(obs, "SceneItemTransformChanged", ({ "scene-name": scene, "item-id": id, "item-name": name, transform }) => {
        if (scene !== sceneName) return;
        trackSceneItem(id, name, transform.visible);
        void updateThumbnail();
    });

    useEvent(obs, "SceneItemVisibilityChanged", ({ "scene-name": scene, "item-id": id, "item-name": name, "item-visible": visible }) => {
        if (scene !== sceneName) return;
        trackSceneItem(id, name, visible);
        void updateThumbnail();
    });

    useEvent(obs, "SourceOrderChanged", ({ "scene-name": scene, "scene-items": items }) => {
        if (scene !== sceneName) return;
        const existingSourceItems = new Map([...sources].map(([name, items]) => [name, new Set(items.keys())]));
        for (const { "item-id": id, "source-name": name } of items) {
            trackSceneItem(id, name);
            const items = existingSourceItems.get(name);
            if (items?.delete(id) && items.size === 0) {
                existingSourceItems.delete(name);
            }
        }
        for (const [name, items] of existingSourceItems) {
            for (const id of items) {
                untrackSceneItem(id, name);
            }
        }
        void updateThumbnail();
    });

    useEvent(obs, "SourceRenamed", ({ previousName, newName, sourceType }) => {
        if (sourceType === "scene" && previousName === sceneName) {
            setSceneName(newName);
            return;
        }

        const items = sources.get(previousName);
        if (items) {
            sources.delete(previousName);
            sources.set(newName, items);
        }
    });

    useEvent(obs, "SourceFilterAdded", onSourceChanged);
    useEvent(obs, "SourceFilterRemoved", onSourceChanged);
    useEvent(obs, "SourceFilterVisibilityChanged", onSourceChanged);
    useEvent(obs, "SourceFiltersReordered", onSourceChanged);

    useAsyncEffect(async (token) => {
        // update whether the source is hidden
        const { sourceSettings } = await obs.send("GetSourceSettings", { sourceName: scene.name });
        if (token.signaled) return;

        if (getSourceHiddenCustomProperty(sourceSettings)) {
            setHidden(true);
        }
        else {
            setHidden(false);
        }
    }, [obs, scene]);

    useAsyncEffect(async token => {
        // update the thumbnail if the scene becomes visible.
        if (hidden === false || editMode) {
            await updateThumbnail.cancelable(token);
        }
    }, [obs, scene, hidden === false, editMode]);

    useEffect(() => {
        // while the scene is current, refresh the thumbnail every 1/10th of a second
        // if the scene is potentially animated, refresh once per second
        // otherwise, refresh once every 10 seconds
        const timeout =
            current ? 100 :
            isPotentiallyAnimatedScene(scene, scenes, sourceTypes) ? 1000 :
            10000;
        const source = CancelToken.source();
        const timer = setInterval(updateThumbnail, timeout, source.token) as unknown as NodeJS.Timeout;
        return () => {
            clearInterval(timer);
            source.cancel();
        };
    }, [obs, current, scene, scenes, sourceTypes, isPotentiallyAnimatedScene]);

    // ui
    return <>{
        (hidden !== undefined) &&
            <EditModeContainer hidden={hidden}>
                <EditModeContent component={Root} item xs={3} className={classes.root}>
                    <Card
                        className={current ? classes.cardCurrent : classes.card}
                        variant={"outlined"}
                        elevation={3}>
                        <CardActionArea onClick={onClick} disabled={pending}>
                            <CardHeader
                                className={classes.header}
                                titleTypographyProps={{
                                    noWrap: true,
                                    title: scene.name,
                                }}
                                avatar={
                                    <EditModeBadge>
                                        <Avatar className={current ? classes.avatarCurrent : classes.avatar}>
                                            <ImageIcon/>
                                        </Avatar>
                                    </EditModeBadge>
                                }
                                title={scene.name}
                            />
                            {thumbnail && <CardMedia image={thumbnail} style={{ height: 0, paddingTop: "56.25%" }} />}
                        </CardActionArea>
                    </Card>
                </EditModeContent>
            </EditModeContainer>
    }</>;
};

function isPotentiallyAnimatedScene(scene: Scene, scenes: ReadonlyMap<string, Scene>, sourceTypes: ReadonlyMap<SourceTypeId, SourceType>): boolean {
    return scene.sources.some(source => {
        if (!source.render) return false;
        if (source.type === "scene") {
            const scene = scenes.get(source.name);
            return scene !== undefined && isPotentiallyAnimatedScene(scene, scenes, sourceTypes);
        }
        const sourceType = sourceTypes.get(source.type);
        if (sourceType?.caps.hasVideo) {
            return true;
        }
        return false;
    });
}