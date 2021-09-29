import React from "react";
import { Redirect } from "react-router-dom";
import { createStyles, Grid, IconButton, makeStyles, Theme, WithStyles, withStyles } from "@material-ui/core";
import { Brightness4 as DarkThemeIcon, Brightness7 as LightThemeIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@material-ui/icons";
import { AppBar } from "./components/appBar";
import { AudioSourceTiles } from "./dashboard/audioSources/audioSourceTiles";
import { RecordingTiles } from "./dashboard/recording/recordingTiles";
import { ReplayTiles } from "./dashboard/replay/replayTiles";
import { SceneTiles } from "./dashboard/scenes/sceneTiles";
import { StreamTile } from "./dashboard/stream/streamTile";
import { useAppContext } from "./utils/context";
import { DarkTheme, LightTheme } from "./themes";

const styles = (theme: Theme) => createStyles({
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
    buttonTilesGrid: {},
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
});

export const Dashboard = 
    (withStyles(styles, { name: "Dashboard" })
    (({ classes }: WithStyles<typeof styles>) => {
        // state
        const {
            theme,
            fullscreen,
            editMode,
            connected,
            setTheme,
            setFullscreen,
            setEditMode,
        } = useAppContext();

        // behavior
        const toggleTheme = () => { setTheme(theme === LightTheme ? DarkTheme : LightTheme); };
        const toggleFullscreen = () => { setFullscreen(!fullscreen); };
        const toggleEditMode = () => { setEditMode(!editMode); };

        // ui
        return !connected ? <Redirect to="/connect" /> : <>
            <AppBar primary="Dashboard">
                <IconButton edge="end" onClick={toggleTheme} title="Toggle light/dark theme">
                    {theme === LightTheme ? <DarkThemeIcon /> : <LightThemeIcon />}
                </IconButton>
                <IconButton edge="end" onClick={toggleEditMode} title="Toggle Edit Mode">
                    {editMode ? <VisibilityIcon /> : <VisibilityOffIcon />}
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
            </div>
        </>;
    }));
