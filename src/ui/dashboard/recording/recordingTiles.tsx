/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import {
    FiberManualRecord as RecordIcon,
    Pause as PauseIcon,
    Stop as StopRecordIcon
} from "@mui/icons-material";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from "@mui/material";
import { useContext, useState } from "react";
import { TileButton } from "../../components/tileButton";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useAsyncEventCallback } from "../../hooks/useAsyncEventCallback";
import { useEvent } from "../../hooks/useEvent";
import { useEventCallback } from "../../hooks/useEventCallback";
import { AppContext } from "../../utils/appContext";

const enum RecordingState {
    Unknown,
    Stopped,
    StartRequested,
    StartPending,
    Starting,
    Started,
    Paused,
    StopRequested,
    StopPending,
    Stopping,
}

export interface RecordingTilesProps {
}

export const RecordingTiles = ({ }: RecordingTilesProps) => {
    // state
    const { obs } = useContext(AppContext);
    const [state, setState] = useState(RecordingState.Unknown);
    const stopped = state === RecordingState.Stopped || state === RecordingState.StartRequested;
    const started = state === RecordingState.Started || state === RecordingState.Paused || state === RecordingState.StopRequested;
    const stopping = state === RecordingState.Stopping || state === RecordingState.StopPending;
    const paused = state === RecordingState.Paused;

    // behavior
    const onRequestStartRecording = useEventCallback(() => {
        setState(RecordingState.StartRequested);
    });

    const onCancelStartRecording = useEventCallback(() => {
        setState(RecordingState.Stopped);
    });

    const onConfirmStartRecording = useAsyncEventCallback(async () => {
        setState(RecordingState.StartPending);
        await obs.send("StartRecording");
    });

    const onRequestStopRecording = useEventCallback(() => {
        setState(RecordingState.StopRequested);
    });

    const onCancelStopRecording = useEventCallback(() => {
        setState(RecordingState.Started);
    });

    const onConfirmStopRecording = useAsyncEventCallback(async () => {
        setState(RecordingState.StopPending);
        await obs.send("StopRecording");
    });

    const onPauseClick = useAsyncEventCallback(async () => {
        await obs.send(paused ? "ResumeRecording" : "PauseRecording");
    });

    // effects
    useEvent(obs, "RecordingStarting", () => {
        setState(RecordingState.Starting);
    });

    useEvent(obs, "RecordingStarted", () => {
        setState(RecordingState.Started);
    });

    useEvent(obs, "RecordingStopping", () => {
        setState(RecordingState.Stopping);
    });

    useEvent(obs, "RecordingStopped", () => {
        setState(RecordingState.Stopped);
    });

    useEvent(obs, "RecordingPaused", () => {
        setState(RecordingState.Paused);
    });

    useEvent(obs, "RecordingResumed", () => {
        setState(RecordingState.Started);
    });

    useAsyncEffect(async token => {
        const status = await obs.send("GetStreamingStatus");
        if (token.signaled) return;

        let paused = false;
        if (status.recording) {
            await new Promise<void>(resolve => {
                const timer = setTimeout(() => {
                    resolve();
                    subscription.unsubscribe();
                }, 10);
                const subscription = token.subscribe(() => {
                    clearTimeout(timer);
                });
            });
            if (token.signaled) return;

            const status2 = await obs.send("GetStreamingStatus");
            if (token.signaled) return;

            if (status2.recording && status2["rec-timecode"] === status["rec-timecode"]) {
                paused = true;
            }
        }
        setState(
            paused ? RecordingState.Paused :
            status.recording ? RecordingState.Started :
            RecordingState.Stopped
        );
    }, [obs]);

    // ui
    return <>
        <Grid item>
            <Dialog
                open={state === RecordingState.StartRequested}
                aria-labelledby="startrecording-dialog-title"
                aria-describedby="startrecording-dialog-description">
                <DialogTitle id="startrecording-dialog-title">Start Recording</DialogTitle>
                <DialogContent>
                    <DialogContentText id="startrecording-dialog-description">
                        This will start recording. Are you sure?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onConfirmStartRecording} variant="contained" color="primary" autoFocus aria-label="yes">Yes</Button>
                    <Button onClick={onCancelStartRecording} variant="contained" color="secondary" aria-label="no">No</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={state === RecordingState.StopRequested}
                aria-labelledby="stoprecording-dialog-title"
                aria-describedby="stoprecording-dialog-description">
                <DialogTitle id="stoprecording-dialog-title">Stop Recording</DialogTitle>
                <DialogContent>
                    <DialogContentText id="stoprecording-dialog-description">
                        This will stop recording. Are you sure?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onConfirmStopRecording} variant="contained" color="primary" autoFocus aria-label="yes">Yes</Button>
                    <Button onClick={onCancelStopRecording} variant="contained" color="secondary" aria-label="no">No</Button>
                </DialogActions>
            </Dialog>
            <TileButton
                icon={
                    stopped ? <RecordIcon /> :
                    started ? <StopRecordIcon /> :
                    <CircularProgress size={24} />
                }
                color={started ? "error" : "primary"}
                disabled={!started && !stopped}
                onClick={
                    stopped ? onRequestStartRecording :
                    started ? onRequestStopRecording :
                    undefined
                }>
                {started || stopping || paused ? "End Rec" : "Rec"}
            </TileButton>
        </Grid>
        <Grid item>
            <TileButton
                icon={<PauseIcon />}
                color={paused ? "warning" : "primary"}
                disabled={!started && !paused}
                onClick={started || paused ? onPauseClick : undefined}>
                {paused ? "Resume" : "Pause"}
            </TileButton>
        </Grid>
    </>;
};