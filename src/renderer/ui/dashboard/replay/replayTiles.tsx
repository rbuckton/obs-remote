import React, { useContext, useEffect, useState } from "react";
import {
    FiberSmartRecord as RecordIcon,
    Stop as StopRecordIcon,
    SaveAlt as SaveIcon
} from "@material-ui/icons";
import { StreamStatusEventArgs } from "../../../obs/protocol";
import { TileButton } from "../../components/tileButton";
import { CircularProgress } from "@material-ui/core";
import { AppContext } from "../../utils/context";
import { useAsyncCallback, useAsyncEffect } from "../../utils/useAsync";

const enum ReplayBufferState {
    Unknown,
    Unavailable,
    StartPending,
    Starting,
    Started,
    StopPending,
    Stopping,
    Stopped,
}

export interface ReplayTilesProps {
}

export const ReplayTiles = ({ }: ReplayTilesProps) => {
    // state
    const { obs } = useContext(AppContext);
    const [state, setState] = useState(ReplayBufferState.Unknown);
    const [saving, setSaving] = useState(false);
    const unavailable = state === ReplayBufferState.Unavailable;
    const starting = state === ReplayBufferState.StartPending || state === ReplayBufferState.Starting;
    const started = state === ReplayBufferState.Started;
    const stopping = state === ReplayBufferState.StopPending || state === ReplayBufferState.Stopping;
    const stopped = state === ReplayBufferState.Stopped;

    // behavior
    const onReplayBufferStarting = () => setState(ReplayBufferState.Starting);
    const onReplayBufferStarted = () => setState(ReplayBufferState.Started);
    const onReplayBufferStopping = () => setState(ReplayBufferState.Stopping);
    const onReplayBufferStopped = () => setState(ReplayBufferState.Stopped);
    const onStreamStarted = () => setState(ReplayBufferState.Stopped);
    const onStreamNotStarted = () => setState(ReplayBufferState.Unavailable);

    const onStreamStatus = ({ "replay-buffer-active": active }: StreamStatusEventArgs) => {
        obs.off("StreamStatus", onStreamStatus);
        setState(active ? ReplayBufferState.Started : ReplayBufferState.Stopped);
    };

    const onRequestStartReplayBuffer = useAsyncCallback(async () => {
        setState(ReplayBufferState.StartPending);
        await obs.send("StartReplayBuffer");
    });

    const onRequestStopReplayBuffer = useAsyncCallback(async () => {
        setState(ReplayBufferState.StopPending);
        await obs.send("StopReplayBuffer");
    });

    const onSaveReplayBuffer = useAsyncCallback(async () => {
        if (started && !saving) {
            setSaving(true);
            await obs.send("SaveReplayBuffer");
            setSaving(false);
        }
    });

    // effects
    useEffect(() => {
        obs.on("ReplayStarting", onReplayBufferStarting);
        obs.on("ReplayStarted", onReplayBufferStarted);
        obs.on("ReplayStopping", onReplayBufferStopping);
        obs.on("ReplayStopped", onReplayBufferStopped);
        obs.on("StreamStarted", onStreamStarted);
        obs.on("StreamStarting", onStreamNotStarted);
        obs.on("StreamStopping", onStreamNotStarted);
        obs.on("StreamStopped", onStreamNotStarted);
        return () => {
            obs.off("ReplayStarting", onReplayBufferStarting);
            obs.off("ReplayStarted", onReplayBufferStarted);
            obs.off("ReplayStopping", onReplayBufferStopping);
            obs.off("ReplayStopped", onReplayBufferStopped);
            obs.off("StreamStarted", onStreamStarted);
            obs.off("StreamStarting", onStreamNotStarted);
            obs.off("StreamStopping", onStreamNotStarted);
            obs.off("StreamStopped", onStreamNotStarted);
            obs.off("StreamStatus", onStreamStatus);
        };
    }, [obs]);

    useAsyncEffect(async (token) => {
        const status = await obs.send("GetStreamingStatus");
        if (token.signaled) return;

        if (!status.streaming) {
            setState(ReplayBufferState.Unavailable);
        }
        else {
            // wait for the next stream status to update
            obs.on("StreamStatus", onStreamStatus);
        }
    }, [obs]);

    // ui
    return <>
        <TileButton
            icon={
                stopped || unavailable ? <RecordIcon /> :
                started ? <StopRecordIcon /> :
                <CircularProgress size={24} />
            }
            color={started ? "secondary" : "default"}
            disabled={!stopped && !started}
            onClick={
                stopped ? onRequestStartReplayBuffer :
                started ? onRequestStopReplayBuffer :
                undefined
            }>
            {started || stopping ? <>Stop Replay Buffer</> : <>Start Replay Buffer</>}
        </TileButton>
        <TileButton
            icon={saving ? <CircularProgress size={24} /> : <SaveIcon />}
            disabled={!started || saving}
            onClick={started && !saving ? onSaveReplayBuffer : undefined}>
            Save Replay
        </TileButton>
    </>;
};