import React, { useContext, useEffect, useState } from "react";
import {
    Mic as MicIcon,
    MicNone as MicSilentIcon,
    MicOff as MicOffIcon,
    VolumeUp as AudioIcon,
    VolumeMute as AudioSilentIcon,
    VolumeOff as AudioOffIcon
} from "@material-ui/icons";
import { SourceMuteStateChangedEventArgs } from "../../../obs/protocol";
import { TileButton } from "../../components/tileButton";
import { AppContext, editModeHiddenKey } from "../../utils/context";
import { AudioSource } from "./audioSource";
import { useAsyncCallback, useAsyncEffect } from "../../utils/useAsync";
import { CircularProgress, createStyles, makeStyles } from "@material-ui/core";
import { EditModeContainer } from "../../components/editModeContainer";
import { EditModeBadge } from "../../components/editModeBadge";
import { EditModeContent } from "../../components/editModeContent";

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
    const onSourceMuteStateChanged = ({ sourceName, muted }: SourceMuteStateChangedEventArgs) => {
        if (sourceName !== source.name) return;
        setIsMuted(muted);
    };

    const onClick = useAsyncCallback(async () => {
        if (editMode) {
            setHidden(!hidden);
            setPending(true);
            try {
                const { sourceSettings } = await obs.send("GetSourceSettings", { sourceName: source.name, sourceType: source.typeId });
                sourceSettings[editModeHiddenKey] = !hidden;
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
    useEffect(() => {
        obs.on("SourceMuteStateChanged", onSourceMuteStateChanged);
        return () => {
            obs.off("SourceMuteStateChanged", onSourceMuteStateChanged);
        };
    }, [obs, source]);

    useAsyncEffect(async (token) => {
        const { volume, muted } = await obs.send("GetVolume", { source: source.name, useDecibel: false });
        if (token.signaled) return;
        setVolume(volume);
        setIsMuted(muted);

        const settings = await obs.send("GetSourceSettings", { sourceName: source.name });
        if (settings.sourceSettings[editModeHiddenKey]) {
            setHidden(true);
        }
        else {
            setHidden(false);
        }
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
