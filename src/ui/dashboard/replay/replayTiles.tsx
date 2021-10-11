/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import React, { useContext, useEffect, useState } from "react";
import { CircularProgress, Grid } from "@mui/material";
import {
    FiberSmartRecord as RecordIcon,
    Stop as StopRecordIcon,
    SaveAlt as SaveIcon
} from "@mui/icons-material";
import { StreamStatusEventArgs } from "../../../obs/common/protocol";
import { TileButton } from "../../components/tileButton";
import { AppContext } from "../../utils/appContext";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useAsyncCallback } from "../../hooks/useAsyncCallback";
import { useEvent } from "../../hooks/useEvent";
import { useEventCallback } from "../../hooks/useEventCallback";
import { useAsyncEventCallback } from "../../hooks/useAsyncEventCallback";

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
    const started = state === ReplayBufferState.Started;
    const stopping = state === ReplayBufferState.StopPending || state === ReplayBufferState.Stopping;
    const stopped = state === ReplayBufferState.Stopped;

    // behavior

    const onStreamStatus = useEventCallback(({ "replay-buffer-active": active }: StreamStatusEventArgs) => {
        obs.off("StreamStatus", onStreamStatus);
        setState(active ? ReplayBufferState.Started : ReplayBufferState.Stopped);
    });

    const onRequestStartReplayBuffer = useAsyncEventCallback(async () => {
        setState(ReplayBufferState.StartPending);
        await obs.send("StartReplayBuffer");
    });

    const onRequestStopReplayBuffer = useAsyncEventCallback(async () => {
        setState(ReplayBufferState.StopPending);
        await obs.send("StopReplayBuffer");
    });

    const onSaveReplayBuffer = useAsyncEventCallback(async token => {
        if (started && !saving) {
            setSaving(true);
            await obs.send("SaveReplayBuffer");

            if (token.signaled) return;
            setSaving(false);
        }
    });

    // effects
    useEvent(obs, "ReplayStarting", () => setState(ReplayBufferState.Starting));
    useEvent(obs, "ReplayStarted", () => setState(ReplayBufferState.Started));
    useEvent(obs, "ReplayStopping", () => setState(ReplayBufferState.Stopping));
    useEvent(obs, "ReplayStopped", () => setState(ReplayBufferState.Stopped));
    useEvent(obs, "StreamStarted", () => setState(ReplayBufferState.Stopped));
    useEvent(obs, "StreamStarting", () => setState(ReplayBufferState.Unavailable));
    useEvent(obs, "StreamStopping", () => setState(ReplayBufferState.Unavailable));
    useEvent(obs, "StreamStopped", () => setState(ReplayBufferState.Unavailable));

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
        <Grid item>
            <TileButton
                icon={
                    stopped || unavailable ? <RecordIcon /> :
                    started ? <StopRecordIcon /> :
                    <CircularProgress size={24} />
                }
                color={started ? "error" : "primary"}
                disabled={!stopped && !started}
                onClick={
                    stopped ? onRequestStartReplayBuffer :
                    started ? onRequestStopReplayBuffer :
                    undefined
                }>
                {started || stopping ? "Stop Replay Buffer" : "Start Replay Buffer"}
            </TileButton>
        </Grid>
        <Grid item>
            <TileButton
                icon={saving ? <CircularProgress size={24} /> : <SaveIcon />}
                disabled={!started || saving}
                onClick={started && !saving ? onSaveReplayBuffer : undefined}>
                Save Replay
            </TileButton>
        </Grid>
    </>;
};