import React, { useContext, useEffect, useState } from "react";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import {
    FiberManualRecord as RecordIcon,
    Stop as StopRecordIcon,
    Pause as PauseIcon,
} from "@material-ui/icons";
import { TileButton } from "../../components/tileButton";
import { AppContext } from "../../utils/context";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useAsyncCallback } from "../../hooks/useAsyncCallback";

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
    const starting = state === RecordingState.Starting || state === RecordingState.StartPending;
    const started = state === RecordingState.Started || state === RecordingState.Paused || state === RecordingState.StopRequested;
    const stopping = state === RecordingState.Stopping || state === RecordingState.StopPending;
    const paused = state === RecordingState.Paused;

    // behavior
    const onRecordingStarting = () => { setState(RecordingState.Starting); };
    const onRecordingStarted = () => { setState(RecordingState.Started); };
    const onRecordingStopping = () => { setState(RecordingState.Stopping); };
    const onRecordingStopped = () => { setState(RecordingState.Stopped); };
    const onRecordingPaused = () => { setState(RecordingState.Paused); };
    const onRecordingResumed = () => { setState(RecordingState.Started); };
    const onRequestStartRecording = () => { setState(RecordingState.StartRequested); };
    const onCancelStartRecording = () => { setState(RecordingState.Stopped); };
    const onConfirmStartRecording = useAsyncCallback(async () => {
        setState(RecordingState.StartPending);
        await obs.send("StartRecording");
    });
    const onRequestStopRecording = () => { setState(RecordingState.StopRequested); };
    const onCancelStopRecording = () => { setState(RecordingState.Started); };
    const onConfirmStopRecording = useAsyncCallback(async () => {
        setState(RecordingState.StopPending);
        await obs.send("StopRecording");
    });
    const onPauseClick = useAsyncCallback(async () => {
        await obs.send(paused ? "ResumeRecording" : "PauseRecording");
    });

    // effects
    useEffect(() => {
        obs.on("RecordingStarting", onRecordingStarting);
        obs.on("RecordingStarted", onRecordingStarted);
        obs.on("RecordingStopping", onRecordingStopping);
        obs.on("RecordingStopped", onRecordingStopped);
        obs.on("RecordingPaused", onRecordingPaused);
        obs.on("RecordingResumed", onRecordingResumed);
        return () => {
            obs.off("RecordingStarting", onRecordingStarting);
            obs.off("RecordingStarted", onRecordingStarted);
            obs.off("RecordingStopping", onRecordingStopping);
            obs.off("RecordingStopped", onRecordingStopped);
            obs.off("RecordingPaused", onRecordingPaused);
            obs.off("RecordingResumed", onRecordingResumed);
        };
    }, [obs]);

    useAsyncEffect(async (token) => {
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
            color={started ? "secondary" : "default"}
            disabled={!started && !stopped}
            onClick={
                stopped ? onRequestStartRecording :
                started ? onRequestStopRecording :
                undefined
            }>
            {started || stopping || paused ? "End Rec" : "Rec"}
        </TileButton>
        <TileButton
            icon={<PauseIcon />}
            color={paused ? "primary" : "default"}
            disabled={!started && !paused}
            onClick={started || paused ? onPauseClick : undefined}>
            {paused ? "Resume" : "Pause"}
        </TileButton>
    </>;
};