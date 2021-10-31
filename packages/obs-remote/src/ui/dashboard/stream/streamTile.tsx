/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import {
    ScreenShare as StreamIcon,
    StopScreenShare as StopStreamIcon
} from "@mui/icons-material";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid
} from "@mui/material";
import { useContext, useState } from "react";
import { TileButton } from "../../components/tileButton";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useAsyncEventCallback } from "../../hooks/useAsyncEventCallback";
import { useEvent } from "../../hooks/useEvent";
import { useEventCallback } from "../../hooks/useEventCallback";
import { TwitchGlitchIcon } from "../../icons/TwitchGlitchIcon";
import { AppContext } from "../../utils/appContext";

const enum StreamState {
    Unknown,
    Stopped,
    StartRequested,
    Starting,
    Started,
    StopRequested,
    Stopping,
}

export interface StreamTileProps {
}

export const StreamTile = ({ }: StreamTileProps) => {
    // state
    const { obs } = useContext(AppContext);
    const [state, setState] = useState(StreamState.Unknown);
    const [isTwitch, setIsTwitch] = useState<boolean>();
    const stopped = state === StreamState.Stopped || state === StreamState.StartRequested;
    const started = state === StreamState.Started || state === StreamState.StopRequested;
    const stopping = state === StreamState.Stopping;

    // behavior
    const onRequestStartStream = useEventCallback(() => {
        setState(StreamState.StartRequested);
    });

    const onCancelStartStream = useEventCallback(() => {
        setState(StreamState.Stopped);
    });

    const onConfirmStartStream = useAsyncEventCallback(async () => {
        setState(StreamState.Starting);
        await obs.send("StartStreaming", {});
    });

    const onRequestStopStream = useEventCallback(() => {
        setState(StreamState.StopRequested);
    });

    const onCancelStopStream = useEventCallback(() => {
        setState(StreamState.Started);
    });

    const onConfirmStopStream = useAsyncEventCallback(async () => {
        setState(StreamState.Stopping);
        await obs.send("StopStreaming");
    });

    // effects
    useEvent(obs, "StreamStarting", () => {
        setState(StreamState.Starting);
    });

    useEvent(obs, "StreamStarted", () => {
        setState(StreamState.Started);
    });

    useEvent(obs, "StreamStopping", () => {
        setState(StreamState.Stopping);
    });

    useEvent(obs, "StreamStopped", () => {
        setState(StreamState.Stopped);
    });

    useAsyncEffect(async (token) => {
        const [{ settings }, status] = await Promise.all([
            obs.send("GetStreamSettings"),
            obs.send("GetStreamingStatus")
        ]);
        if (token.signaled) return;
        setIsTwitch(/twitch/i.test(settings.server) || /twitch/i.test(settings.service || ""));
        setState(status.streaming ? StreamState.Started : StreamState.Stopped);
    }, [obs]);

    // ui
    return <Grid item>
        <Dialog
            open={state === StreamState.StartRequested}
            aria-labelledby="golive-dialog-title"
            aria-describedby="golive-dialog-description">
            <DialogTitle id="golive-dialog-title">Go Live</DialogTitle>
            <DialogContent>
                <DialogContentText id="golive-dialog-description">
                    This will start broadcasting your stream. Are you sure?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onConfirmStartStream} variant="contained" color="primary" autoFocus aria-label="yes">Yes</Button>
                <Button onClick={onCancelStartStream} variant="contained" color="secondary" aria-label="no">No</Button>
            </DialogActions>
        </Dialog>
        <Dialog
            open={state === StreamState.StopRequested}
            aria-labelledby="endstream-dialog-title"
            aria-describedby="endstream-dialog-description">
            <DialogTitle id="endstream-dialog-title">End Stream</DialogTitle>
            <DialogContent>
                <DialogContentText id="endstream-dialog-description">
                    This will stop broadcasting your stream. Are you sure?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onConfirmStopStream} variant="contained" color="primary" autoFocus aria-label="yes">Yes</Button>
                <Button onClick={onCancelStopStream} variant="contained" color="secondary" aria-label="no">No</Button>
            </DialogActions>
        </Dialog>
        <TileButton
            icon={
                stopped ? isTwitch ? <TwitchGlitchIcon htmlColor="white" /> : <StreamIcon /> :
                started ? <StopStreamIcon /> :
                <CircularProgress size={24} />
            }
            color={
                started ? "error" :
                stopped && isTwitch ? "twitch" :
                "primary"
            }
            disabled={!started && !stopped}
            onClick={
                stopped ? onRequestStartStream :
                started ? onRequestStopStream :
                undefined
            }>
            {started || stopping ? "End Stream" : "Go Live"}
        </TileButton>
    </Grid>;
};