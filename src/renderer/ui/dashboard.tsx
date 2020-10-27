import React, { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { createStyles, Divider, Grid, IconButton, makeStyles } from "@material-ui/core";
import { AppBar } from "./components/appBar";
import { AudioSourceTiles } from "./dashboard/audioSources/audioSourceTiles";
import { RecordingTiles } from "./dashboard/recording/recordingTiles";
import { ReplayTiles } from "./dashboard/replay/replayTiles";
import { SceneTiles } from "./dashboard/scenes/sceneTiles";
import { StreamTile } from "./dashboard/stream/streamTile";
import { AppContext } from "./utils/context";
import { Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@material-ui/icons";
import { remote } from "electron";
import { useAsyncCallback } from "./utils/useAsync";

const useStyles = makeStyles(theme => createStyles({
    root: {
        // flexGrow: 1,
        padding: theme.spacing(0),
        flexGrow: 1,
        height: "calc(100vh - 64px)",
        overflow: "hidden"
    },
    outerGrid: {
        height: "100%"
    },
    leftGrid: {
        flexGrow: 1,
    },
    buttonTilesGrid: {
    },
    sceneTilesGrid: {
        margin: "0px",
        overflowX: "hidden", 
        overflowY: "scroll", 
        borderTop: `1px solid ${theme.palette.divider}`
    },
    audioSourceTilesGrid: {
        width: "calc(150px + 24px + var(--scrollbar-width, 16px))",
        overflowY: "scroll",
        backgroundColor: "rgba(0, 0, 0, 0.10)"
    }
}));

export const Dashboard = () => {
    // state
    const classes = useStyles();
    const context = useContext(AppContext);
    const [fullscreen, setFullscreen] = useState(() => !!document.fullscreenElement);
    if (!context.obs.connected) return <Redirect to="/connect" />;

    // behavior
    const onFullscreenChange = () => {
        setFullscreen(!!document.fullscreenElement);
    };

    const toggleFullscreen = useAsyncCallback(async () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        else {
            await document.body.requestFullscreen();
        }
    });

    const toggleVisibilityMode = () => {
        context.setEditMode(!context.editMode);
    };

    // effects
    useEffect(() => {
        document.addEventListener("fullscreenchange", onFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", onFullscreenChange);
        };
    }, []);

    // ui
    return <>
        <AppBar primary="Dashboard">
            <IconButton edge="end" onClick={toggleVisibilityMode} title="Toggle Edit Mode">
                {context.editMode ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
            <IconButton edge="end" onClick={toggleFullscreen} title="Toggle Fullscreen">
                {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
        </AppBar>
        <div className={classes.root}>
            <Grid container wrap="nowrap" direction="row" justify="flex-start" className={classes.outerGrid}>
                <Grid item container wrap="nowrap" direction="column" justify="flex-start" alignItems="flex-start" className={classes.leftGrid}>
                    <Grid item container wrap="wrap" direction="row" justify="flex-start" alignItems="flex-start" className={classes.buttonTilesGrid}>
                        <StreamTile />
                        <RecordingTiles />
                        <ReplayTiles />
                    </Grid>
                    <Grid item container spacing={3} alignItems="stretch" xs className={classes.sceneTilesGrid}>
                        <SceneTiles />
                    </Grid>
                </Grid>
                <Grid item container className={classes.audioSourceTilesGrid} justify="flex-start" alignItems="flex-start" alignContent="flex-start">
                    <AudioSourceTiles />
                </Grid>
            </Grid>
            {/* <Divider />
            <MediaStatus obs={obs} /> */}
        </div>
    </>;
}

// Dashboard should be something like (in landscape mode):

// [menu] Dashboard
//
// [start/stop stream icon] [start/stop recording icon] [pause recording icon] [mute icon] | [Scene preview image]
// ----------------------------------------------------------------------------------------|
// [scene1] [scene2] [scene3] [scene4] ...                                                 |-----------------------
// [sceneN] ...                                                                            |
// ----------------------------------------------------------------------------------------| [Studio preview image]
// [media controls]                                                                        |