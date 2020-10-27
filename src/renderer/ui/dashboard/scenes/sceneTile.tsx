import React, { useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Scene } from "obs-websocket-js";
import { Avatar, Badge, Card, CardActionArea, CardActions, CardContent, CardHeader, CardMedia, createStyles, Grid, makeStyles, useTheme } from "@material-ui/core";
import { Image as ImageIcon } from "@material-ui/icons";
import { IObsWebSocket } from "../../../obs";
import { useAsyncCallback, useAsyncEffect } from "../../utils/useAsync";
import { CancelToken } from "@esfx/async-canceltoken";
import { SceneItemAddedEventArgs, SceneItemRemovedEventArgs, SceneItemTransformChangedEventArgs, SceneItemVisibilityChangedEventArgs, SourceFilterAddedEventArgs, SourceFilterRemovedEventArgs, SourceFiltersReorderedEventArgs, SourceFilterVisibilityChangedEventArgs, SourceOrderChangedEventArgs } from "../../../obs/protocol";
import { AppContext, editModeHiddenKey } from "../../utils/context";

const useStyles = makeStyles(theme => createStyles({
    root: {
        // minWidth: "300px"
        minWidth: "128px",
        maxWidth: "512px"
    },
    hidden: {
        opacity: "50%"
    },
    card: {
        backgroundColor: "#e0e0e0"
    },
    cardCurrent: {
        backgroundColor: theme.palette.info.main
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
    const [thumbnail, setThumbnail] = useState<string>();
    const [hidden, setHidden] = useState<boolean>();
    const [pending, setPending] = useState(false);
    const updatingThumbnailRef = useRef(false);

    // behavior
    const onClick = useAsyncCallback(async () => {
        if (editMode) {
            setHidden(!hidden);
            setPending(true);
            try {
                const { sourceSettings } = await obs.send("GetSourceSettings", { sourceName: scene.name });
                sourceSettings[editModeHiddenKey] = !hidden;
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

    const onSceneChanged = async (args: SceneItemAddedEventArgs | SceneItemRemovedEventArgs | SceneItemTransformChangedEventArgs | SceneItemVisibilityChangedEventArgs | SourceOrderChangedEventArgs) => {
        if (args["scene-name"] !== scene.name) return;
        await updateThumbnail();
    };

    const onSourceChanged = async (args: SourceFilterAddedEventArgs | SourceFilterRemovedEventArgs | SourceFilterVisibilityChangedEventArgs | SourceFiltersReorderedEventArgs) => {
        if (!scene.sources.some(source => source.name === args.sourceName)) return;
        await updateThumbnail();
    };

    const updateThumbnail = async (token?: CancelToken) => {
        if (updatingThumbnailRef.current) return;
        try {
            updatingThumbnailRef.current = true;
            const { img } = await obs.send("TakeSourceScreenshot", {
                sourceName: scene.name,
                embedPictureFormat: "jpeg",
                // compressionQuality: 100,
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
        if (current) {
            const source = CancelToken.source();
            const timer = setInterval(useAsyncCallback(updateThumbnail), 100, source.token) as unknown as NodeJS.Timeout;
            return () => {
                clearInterval(timer);
                source.cancel();
            };
        }
    }, [obs, scene, current]);

    useEffect(() => {
        obs.on("SceneItemAdded", onSceneChanged);
        obs.on("SceneItemRemoved", onSceneChanged);
        obs.on("SceneItemTransformChanged", onSceneChanged);
        obs.on("SceneItemVisibilityChanged", onSceneChanged);
        obs.on("SourceOrderChanged", onSceneChanged);
        obs.on("SourceFilterAdded", onSourceChanged);
        obs.on("SourceFilterRemoved", onSourceChanged);
        obs.on("SourceFilterVisibilityChanged", onSourceChanged);
        obs.on("SourceFiltersReordered", onSourceChanged);
        return () => {
            obs.off("SceneItemAdded", onSceneChanged);
            obs.off("SceneItemRemoved", onSceneChanged);
            obs.off("SceneItemTransformChanged", onSceneChanged);
            obs.off("SceneItemVisibilityChanged", onSceneChanged);
            obs.off("SourceOrderChanged", onSceneChanged);
            obs.off("SourceFilterAdded", onSourceChanged);
            obs.off("SourceFilterRemoved", onSourceChanged);
            obs.off("SourceFilterVisibilityChanged", onSourceChanged);
            obs.off("SourceFiltersReordered", onSourceChanged);
        };
    }, [obs, scene]);

    useAsyncEffect(async (token) => {
        await updateThumbnail(token);

        const settings = await obs.send("GetSourceSettings", { sourceName: scene.name });
        if (settings.sourceSettings[editModeHiddenKey]) {
            setHidden(true);
        }
        else {
            setHidden(false);
        }
    }, [obs, scene]);

    // ui
    return <>
        {(hidden === false || editMode) &&
            <Grid
                item
                xs={3}
                className={clsx([
                    classes.root,
                    hidden ? classes.hidden : undefined
                ])}>
                <Card
                    className={current ? classes.cardCurrent : classes.card}
                    elevation={current ? 3 : 1}>
                    <CardActionArea onClick={onClick}>
                        <CardHeader
                            className={classes.header}
                            avatar={
                                <Badge badgeContent={editMode ? hidden ? "hidden" : "visible" : undefined} color="secondary">
                                    <Avatar className={current ? classes.avatarCurrent : classes.avatar}>
                                        <ImageIcon/>
                                    </Avatar>
                                </Badge>
                            }
                            title={scene.name}
                        />
                        {thumbnail && <CardMedia image={thumbnail} style={{ height: 0, paddingTop: "56.25%" }} />}
                    </CardActionArea>
                    <CardActions></CardActions>
                </Card>
            </Grid>}
    </>;
};