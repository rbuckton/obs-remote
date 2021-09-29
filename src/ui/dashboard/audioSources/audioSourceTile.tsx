import React, { useContext, useEffect, useState } from "react";
import {
    Mic as MicIcon,
    MicNone as MicSilentIcon,
    MicOff as MicOffIcon,
    VolumeUp as AudioIcon,
    VolumeMute as AudioSilentIcon,
    VolumeOff as AudioOffIcon
} from "@material-ui/icons";
import { SourceMuteStateChangedEventArgs } from "../../../obs/common/protocol";
import { TileButton } from "../../components/tileButton";
import { AppContext } from "../../utils/context";
import { AudioSource } from "./audioSource";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useAsyncCallback } from "../../hooks/useAsyncCallback";
import { CircularProgress, createStyles, makeStyles } from "@material-ui/core";
import { EditModeContainer } from "../../components/editModeContainer";
import { EditModeBadge } from "../../components/editModeBadge";
import { EditModeContent } from "../../components/editModeContent";
import { getSourceHiddenInEditMode, setSourceHiddenInEditMode } from "../../../obs/renderer/extensions";
import { useObsWebSocketEvent } from "../../hooks/useObsWebSocketEvent";

export interface AudioSourceTileProps {
    source: AudioSource;
}

export const AudioSourceTile = ({
    source,
}: AudioSourceTileProps) => {
    // state
    const { obs, editMode } = useContext(AppContext);
    const [isMuted, setIsMuted] = useState<boolean>();
    const [volume, setVolume] = useState<number>();
    const [hidden, setHidden] = useState<boolean>();
    const [pending, setPending] = useState(false);

    // behavior
    const onClick = useAsyncCallback(async () => {
        if (editMode) {
            setHidden(!hidden);
            setPending(true);
            try {
                const { sourceSettings } = await obs.send("GetSourceSettings", { sourceName: source.name, sourceType: source.typeId });
                setSourceHiddenInEditMode(sourceSettings, !hidden);
                await obs.send("SetSourceSettings", { sourceName: source.name, sourceType: source.typeId, sourceSettings });
            }
            finally {
                setPending(false);
            }
        }
        else {
            await obs.send("ToggleMute", { source: source.name });
        }
    });

    // effects
    useObsWebSocketEvent("SourceMuteStateChanged", ({ sourceName, muted }: SourceMuteStateChangedEventArgs) => {
        if (sourceName !== source.name) return;
        setIsMuted(muted);
    }, [source]);

    useAsyncEffect(async (token) => {
        const { volume, muted } = await obs.send("GetVolume", { source: source.name, useDecibel: false });
        if (token.signaled) return;
        setVolume(volume);
        setIsMuted(muted);

        const { sourceSettings } = await obs.send("GetSourceSettings", { sourceName: source.name });
        setHidden(getSourceHiddenInEditMode(sourceSettings));
    }, [obs, source]);

    // ui
    return hidden === undefined ? <></> : <>
        <EditModeContainer hidden={hidden}>
            <EditModeContent component={TileButton}
                icon={
                    <EditModeBadge>{
                        pending ? <CircularProgress size={24} /> :
                        source.sourceType.typeId === "wasapi_input_capture" ?
                            isMuted ? <MicOffIcon /> : volume === 0 ? <MicSilentIcon /> : <MicIcon /> :
                            isMuted ? <AudioOffIcon /> : volume === 0 ? <AudioSilentIcon /> : <AudioIcon />
                    }</EditModeBadge>
                } 
                color={isMuted && !hidden ? "secondary" : "default"}
                onClick={onClick}
                title={source.name}>
                {source.name}
            </EditModeContent>
        </EditModeContainer>
    </>;
};
