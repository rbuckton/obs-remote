import React, {
    useContext,
    useEffect,
    useState
} from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    ThemeProvider,
    useTheme
} from "@material-ui/core";
import {
    ScreenShare as StreamIcon,
    StopScreenShare as StopStreamIcon
} from "@material-ui/icons";
import { TileButton } from "../../components/tileButton";
import { AppContext } from "../../utils/context";
import { useAsyncCallback, useAsyncEffect } from "../../utils/useAsync";
import { TwitchIcon } from "../../icons/TwitchIcon";
import { TwitchTheme } from "../../themes/twitch";

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
    const starting = state === StreamState.Starting;
    const started = state === StreamState.Started || state === StreamState.StopRequested;
    const stopping = state === StreamState.Stopping;

    // behavior
    const onStreamStarting = () => { setState(StreamState.Starting); };
    const onStreamStarted = () => { setState(StreamState.Started); };
    const onStreamStopping = () => { setState(StreamState.Stopping); };
    const onStreamStopped = () => { setState(StreamState.Stopped); };
    const onRequestStartStream = () => { setState(StreamState.StartRequested); };
    const onCancelStartStream = () => { setState(StreamState.Stopped); };
    const onConfirmStartStream = useAsyncCallback(async () => {
        setState(StreamState.Starting);
        await obs.send("StartStreaming", {});
    });
    const onRequestStopStream = () => { setState(StreamState.StopRequested); };
    const onCancelStopStream = () => { setState(StreamState.Started); };
    const onConfirmStopStream = useAsyncCallback(async () => {
        setState(StreamState.Stopping);
        await obs.send("StopStreaming");
    });

    // effects
    useEffect(() => {
        obs.on("StreamStarting", onStreamStarting);
        obs.on("StreamStarted", onStreamStarted);
        obs.on("StreamStopping", onStreamStopping);
        obs.on("StreamStopped", onStreamStopped);
        return () => {
            obs.off("StreamStarting", onStreamStarting);
            obs.off("StreamStarted", onStreamStarted);
            obs.off("StreamStopping", onStreamStopping);
            obs.off("StreamStopped", onStreamStopped);
        };
    }, [obs, onStreamStarting, onStreamStarted, onStreamStopping, onStreamStopped]);

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
    return <>
        <Dialog
            open={state === StreamState.StartRequested}
            aria-labelledby="dialog-golive-title"
            aria-describedby="dialog-golive-description">
            <DialogTitle id="dialog-golive-title">Go Live</DialogTitle>
            <DialogContent>
                <DialogContentText id="dialog-golive-description">
                    This will start broadcasting your stream. Are you sure?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onConfirmStartStream} variant="contained" color="primary" autoFocus>Yes</Button>
                <Button onClick={onCancelStartStream} variant="contained" color="secondary">No</Button>
            </DialogActions>
        </Dialog>
        <Dialog
            open={state === StreamState.StopRequested}
            aria-labelledby="dialog-endstream-title"
            aria-describedby="dialog-endstream-description">
            <DialogTitle id="dialog-endstream-title">End Stream</DialogTitle>
            <DialogContent>
                <DialogContentText id="dialog-endstream-description">
                    This will stop broadcasting your stream. Are you sure?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onConfirmStopStream} variant="contained" color="primary" autoFocus>Yes</Button>
                <Button onClick={onCancelStopStream} variant="contained" color="secondary">No</Button>
            </DialogActions>
        </Dialog>
        <TileButton
            icon={
                stopped ? isTwitch ? <TwitchIcon htmlColor="white" /> : <StreamIcon /> :
                started ? <StopStreamIcon /> :
                <CircularProgress size={24} />
            }
            color={
                started ? "secondary" :
                stopped && isTwitch ? "twitch" :
                "default"
            }
            disabled={!started && !stopped}
            onClick={
                stopped ? onRequestStartStream :
                started ? onRequestStopStream :
                undefined
            }
        >
            {started || stopping ? <>End Stream</> : <>Go Live</>}
        </TileButton>
    </>;
};