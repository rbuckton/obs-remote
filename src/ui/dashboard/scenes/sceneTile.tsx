import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Card, CardActionArea, CardActions, CardHeader, CardMedia, Grid, makeStyles } from "@material-ui/core";
import { Image as ImageIcon } from "@material-ui/icons";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useAsyncCallback } from "../../hooks/useAsyncCallback";
import { CancelToken } from "@esfx/async-canceltoken";
import { Scene, SceneItemAddedEventArgs, SceneItemRemovedEventArgs, SceneItemTransformChangedEventArgs, SceneItemVisibilityChangedEventArgs, SourceFilterAddedEventArgs, SourceFilterRemovedEventArgs, SourceFiltersReorderedEventArgs, SourceFilterVisibilityChangedEventArgs, SourceOrderChangedEventArgs, SourceRenamedEventArgs } from "../../../obs/common/protocol";
import { AppContext } from "../../utils/context";
import { EditModeBadge } from "../../components/editModeBadge";
import { EditModeContainer } from "../../components/editModeContainer";
import { EditModeContent } from "../../components/editModeContent";
import { getSourceHiddenInEditMode, setSourceHiddenInEditMode } from "../../../obs/renderer/extensions";

const useStyles = makeStyles(theme => ({
    root: {
        minWidth: "128px",
        maxWidth: "512px"
    },
    card: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },
    cardCurrent: {
        backgroundColor: theme.palette.info.main,
    },
    avatar: {
        backgroundColor: theme.palette.action.selected
    },
    avatarCurrent: {
        backgroundColor: theme.palette.info.light
    },
    header: {
        [theme.breakpoints.down("sm")]: {
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
    const classes = useStyles();
    const { obs, editMode } = useContext(AppContext);
    const [sceneName, setSceneName] = useState(() => scene.name);
    const [thumbnail, setThumbnail] = useState<string>();
    const [hidden, setHidden] = useState<boolean>();
    const [pending, setPending] = useState(false);
    const updatingThumbnailRef = useRef(false);
    const sources = useMemo(() => scene.sources.reduce((m, s) => {
        let set = m.get(s.name);
        if (!set) m.set(s.name, set = new Map());
        set.set(s.id, s.render);
        return m;
    }, new Map<string, Map<number, boolean>>()), [scene]);

    // behavior
    const onClick = useAsyncCallback(async () => {
        if (editMode) {
            setHidden(!hidden);
            setPending(true);
            try {
                const { sourceSettings } = await obs.send("GetSourceSettings", { sourceName: scene.name });
                setSourceHiddenInEditMode(sourceSettings, !hidden);
                await obs.send("SetSourceSettings", { sourceName: scene.name, sourceSettings });
            }
            finally {
                setPending(false);
            }
        }
        else {
            await obs.send("SetCurrentScene", { "scene-name": scene.name });
        }
    });

    const onSceneItemAdded = async ({ "scene-name": scene, "item-id": id, "item-name": name }: SceneItemAddedEventArgs) => {
        if (scene !== sceneName) return;
        trackSceneItem(id, name);
        if (isSceneItemVisible(id, name)) {
            await updateThumbnail();
        }
    };

    const onSceneItemRemoved = async ({ "scene-name": scene, "item-id": id, "item-name": name }: SceneItemRemovedEventArgs) => {
        if (scene !== sceneName) return;
        untrackSceneItem(id, name);
        await updateThumbnail();
    };

    const onSceneItemVisibilityChanged = async ({ "scene-name": scene, "item-id": id, "item-name": name, "item-visible": visible }: SceneItemVisibilityChangedEventArgs) => {
        if (scene !== sceneName) return;
        trackSceneItem(id, name, visible);
        await updateThumbnail();
    };

    const onSceneItemTransformChanged = async ({ "scene-name": scene, "item-id": id, "item-name": name, transform }: SceneItemTransformChangedEventArgs) => {
        if (scene !== sceneName) return;
        trackSceneItem(id, name, transform.visible);
        await updateThumbnail();
    };

    const onSourceOrderChanged = async ({ "scene-name": scene, "scene-items": items }: SourceOrderChangedEventArgs) => {
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
        await updateThumbnail();
    };

    const onSourceChanged = async ({ sourceName }: SourceFilterAddedEventArgs | SourceFilterRemovedEventArgs | SourceFilterVisibilityChangedEventArgs | SourceFiltersReorderedEventArgs) => {
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
            await updateThumbnail();
        }
    };

    const onSourceRenamed = ({ previousName, newName, sourceType }: SourceRenamedEventArgs) => {
        if (sourceType === "scene" && previousName === sceneName) {
            setSceneName(newName);
            return;
        }

        const items = sources.get(previousName);
        if (items) {
            sources.delete(previousName);
            sources.set(newName, items);
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

    const updateThumbnail = async (token?: CancelToken) => {
        if (updatingThumbnailRef.current) return;
        try {
            updatingThumbnailRef.current = true;
            const { img } = await obs.send("TakeSourceScreenshot", {
                sourceName: scene.name,
                embedPictureFormat: "jpg",
                width: 320
            });
            if (token?.signaled) return;
            setThumbnail(img);
        }
        finally {
            updatingThumbnailRef.current = false;
        }
    };

    // effects
    useEffect(() => {
        // listen for changes that would effect re-rendering the thumbnail
        obs.on("SceneItemAdded", onSceneItemAdded);
        obs.on("SceneItemRemoved", onSceneItemRemoved);
        obs.on("SceneItemTransformChanged", onSceneItemTransformChanged);
        obs.on("SceneItemVisibilityChanged", onSceneItemVisibilityChanged);
        obs.on("SourceOrderChanged", onSourceOrderChanged);
        obs.on("SourceFilterAdded", onSourceChanged);
        obs.on("SourceFilterRemoved", onSourceChanged);
        obs.on("SourceFilterVisibilityChanged", onSourceChanged);
        obs.on("SourceFiltersReordered", onSourceChanged);
        obs.on("SourceRenamed", onSourceRenamed);
        return () => {
            obs.off("SceneItemAdded", onSceneItemAdded);
            obs.off("SceneItemRemoved", onSceneItemRemoved);
            obs.off("SceneItemTransformChanged", onSceneItemTransformChanged);
            obs.off("SceneItemVisibilityChanged", onSceneItemVisibilityChanged);
            obs.off("SourceOrderChanged", onSourceOrderChanged);
            obs.off("SourceFilterAdded", onSourceChanged);
            obs.off("SourceFilterRemoved", onSourceChanged);
            obs.off("SourceFilterVisibilityChanged", onSourceChanged);
            obs.off("SourceFiltersReordered", onSourceChanged);
            obs.off("SourceRenamed", onSourceRenamed);
        };
    }, [obs, scene]);

    useAsyncEffect(async (token) => {
        // update whether the source is hidden
        const { sourceSettings } = await obs.send("GetSourceSettings", { sourceName: scene.name });
        if (token.signaled) return;

        if (getSourceHiddenInEditMode(sourceSettings)) {
            setHidden(true);
        }
        else {
            setHidden(false);
        }
    }, [obs, scene]);

    useAsyncEffect(async (token) => {
        // update the thumbnail if the scene becomes visible.
        if (hidden === false || editMode) {
            await updateThumbnail(token);
        }
    }, [obs, scene, hidden === false, editMode]);

    useEffect(() => {
        // while the scene is current, refresh the thumbnail every 1/10th of a second
        if (current) {
            const source = CancelToken.source();
            const timer = setInterval(useAsyncCallback(updateThumbnail), 100, source.token) as unknown as NodeJS.Timeout;
            return () => {
                clearInterval(timer);
                source.cancel();
            };
        }
    }, [obs, current]);

    // ui
    return <>{
        (hidden !== undefined) &&
            <EditModeContainer hidden={hidden}>
                <EditModeContent component={Grid} item xs={3} className={classes.root}>
                    <Card
                        className={current ? classes.cardCurrent : classes.card}
                        elevation={current ? 3 : 1}>
                        <CardActionArea onClick={onClick}>
                            <CardHeader
                                className={classes.header}
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
                        <CardActions></CardActions>
                    </Card>
                </EditModeContent>
            </EditModeContainer>
    }</>;
};