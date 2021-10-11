/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Brightness4 as DarkThemeIcon, Brightness7 as LightThemeIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import { Grid, IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { useCallback } from "react";
import { Redirect } from "react-router-dom";
import { AppBar } from "./components/appBar";
import { AudioSourceTiles } from "./dashboard/audioSources/audioSourceTiles";
import { RecordingTiles } from "./dashboard/recording/recordingTiles";
import { ReplayTiles } from "./dashboard/replay/replayTiles";
import { SceneTiles } from "./dashboard/scenes/sceneTiles";
import { StreamTile } from "./dashboard/stream/streamTile";
import { DarkTheme, LightTheme } from "./themes";
import { useAppContext } from "./utils/appContext";
import { generateUtilityClasses } from "./utils/mui";

const classes = generateUtilityClasses("Dashboard", [
    "root",
    "outerGrid",
    "leftGrid",
    "rightGrid",
    "buttonTilesGrid",
    "sceneTilesGrid",
    "audioSourceTilesGrid",
]);

const Root = styled("div")(({ theme }) => ({
    [`&.${classes.root}`]: {
        // backgroundColor: "red",
        padding: theme.spacing(0),
        flexGrow: 1,
        height: "calc(100vh - 64px)",
        overflow: "hidden",
    },
    [`& .${classes.outerGrid}`]: {
        // backgroundColor: "green"
        height: "100%",
    },
    [`& .${classes.leftGrid}`]: {
        // backgroundColor: "blue",
        flexGrow: 1,
    },
    [`& .${classes.rightGrid}`]: {
        // backgroundColor: "slateblue",
        width: "unset",
    },
    [`& .${classes.buttonTilesGrid}`]: {
        // backgroundColor: "yellow",
        padding: theme.spacing(1)
    },
    [`& .${classes.sceneTilesGrid}`]: {
        // backgroundColor: "orange",
        overflowX: "hidden",
        overflowY: "scroll",
        borderTop: `1px solid ${theme.palette.divider}`,
        flexGrow: 1,
        padding: theme.spacing(1),
    },
    [`& .${classes.audioSourceTilesGrid}`]: {
        // backgroundColor: "purple",
        backgroundColor: theme.palette.mode === "dark" ?
            "rgba(255, 255, 255, 0.05)" :
            "rgba(0, 0, 0, 0.10)",
        overflowX: "hidden",
        overflowY: "scroll",
        padding: theme.spacing(1)
    },
}));

export const Dashboard = ({ }) => {
    // state
    const {
        theme, setTheme,
        fullscreen, setFullscreen,
        editMode, setEditMode,
        connected,
    } = useAppContext();

    // behavior
    const toggleTheme = useCallback(() => {
        setTheme(theme === LightTheme ? DarkTheme : LightTheme);
    }, [theme]);

    const toggleFullscreen = useCallback(() => {
        setFullscreen(!fullscreen);
    }, [fullscreen]);

    const toggleEditMode = useCallback(() => {
        setEditMode(!editMode);
    }, [editMode]);

    // ui
    return !connected ?
        <Redirect to="/connect" /> :
        <>
            <AppBar primary="Dashboard">
                <IconButton onClick={toggleEditMode} title="Toggle Edit Mode">
                    {editMode ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
                <IconButton onClick={toggleTheme} title="Toggle light/dark theme">
                    {theme === LightTheme ? <DarkThemeIcon /> : <LightThemeIcon />}
                </IconButton>
                <IconButton edge="end" onClick={toggleFullscreen} title="Toggle Fullscreen">
                    {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
            </AppBar>
            <Root className={classes.root}>
                <Grid container className={classes.outerGrid} wrap="nowrap" direction="row" justifyContent="flex-start" alignItems="stretch">
                    <Grid item container className={classes.leftGrid} wrap="nowrap" direction="column" justifyContent="flex-start" alignItems="stretch">
                        <Grid item className={classes.buttonTilesGrid} justifyContent="stretch">
                            <Grid container wrap="wrap" direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={1}>
                                <StreamTile />
                                <RecordingTiles />
                                <ReplayTiles />
                            </Grid>
                        </Grid>
                        <Grid item className={classes.sceneTilesGrid} justifyContent="stretch">
                            <Grid container wrap="wrap" direction="row" justifyContent="flex-start" alignItems="flex-start" alignContent="flex-start" spacing={1}>
                                <SceneTiles />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container className={classes.rightGrid} justifyContent="stretch">
                        <Grid item className={classes.audioSourceTilesGrid} justifyContent="stretch">
                            <Grid container direction="column" justifyContent="flex-start" alignItems="flex-start" alignContent="flex-start" spacing={1}>
                                <AudioSourceTiles />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Root>
        </>;
};
