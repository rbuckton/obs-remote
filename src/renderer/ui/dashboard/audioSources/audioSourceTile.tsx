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
import { Badge, CircularProgress, createStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => createStyles({
    button: {
    },
    buttonHidden: {
        opacity: "50%"
    }
}));

export interface AudioSourceTileProps {
    source: AudioSource;
}

export const AudioSourceTile = ({
    source,
}: AudioSourceTileProps) => {
    // state
    const classes = useStyles();
    const { obs, editMode } = useContext(AppContext);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0);
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
    return <>
        {(hidden === false || editMode) && <TileButton
            icon={
                <Badge
                    badgeContent={editMode ? hidden ? "hidden" : "visible" : undefined}
                    style={{textTransform: "lowercase"}}
                    color="secondary"
                >{
                    pending ? <CircularProgress size={24} /> :
                    source.sourceType.typeId === "wasapi_input_capture" ?
                        isMuted ? <MicOffIcon /> : volume === 0 ? <MicSilentIcon /> : <MicIcon /> :
                        isMuted ? <AudioOffIcon /> : volume === 0 ? <AudioSilentIcon /> : <AudioIcon />
                }</Badge>
            } 
            color={isMuted && !hidden ? "secondary" : "default"}
            onClick={onClick}
            className={hidden ? classes.buttonHidden : classes.button}
            title={source.name}>
            {source.name}
        </TileButton>}
    </>;
};
