/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import {
    Mic as MicIcon,
    MicNone as MicSilentIcon,
    MicOff as MicOffIcon,
    VolumeMute as AudioSilentIcon,
    VolumeOff as AudioOffIcon,
    VolumeUp as AudioIcon
} from "@mui/icons-material";
import { CircularProgress, Grid } from "@mui/material";
import { useContext, useState } from "react";
import { Source } from "../../../obs/common/protocol";
import { getSourceHiddenCustomProperty, setSourceHiddenCustomProperty } from "../../../obs/renderer/extensions";
import { EditModeBadge } from "../../components/editModeBadge";
import { EditModeContainer } from "../../components/editModeContainer";
import { EditModeContent } from "../../components/editModeContent";
import { TileButton } from "../../components/tileButton";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";
import { useAsyncEventCallback } from "../../hooks/useAsyncEventCallback";
import { useEvent } from "../../hooks/useEvent";
import { AppContext } from "../../utils/appContext";

export interface AudioSourceTileProps {
    source: Source;
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
    const onClick = useAsyncEventCallback(async token => {
        if (editMode) {
            setHidden(!hidden);
            setPending(true);
            try {
                const { sourceSettings } = await obs.send("GetSourceSettings", { sourceName: source.name, sourceType: source.typeId });
                if (token.signaled) return;

                setSourceHiddenCustomProperty(sourceSettings, !hidden);
                await obs.send("SetSourceSettings", { sourceName: source.name, sourceType: source.typeId, sourceSettings });
            }
            finally {
                if (!token.signaled) {
                    setPending(false);
                }
            }
        }
        else {
            await obs.send("ToggleMute", { source: source.name });
        }
    });

    // effects
    useEvent(obs, "SourceMuteStateChanged", ({ sourceName, muted }) => {
        if (sourceName !== source.name) return;
        setIsMuted(muted);
    }, [source]);

    useAsyncEffect(async token => {
        const { volume, muted } = await obs.send("GetVolume", { source: source.name, useDecibel: false });
        if (token.signaled) return;
        setVolume(volume);
        setIsMuted(muted);

        const { sourceSettings } = await obs.send("GetSourceSettings", { sourceName: source.name });
        if (token.signaled) return;
        setHidden(getSourceHiddenCustomProperty(sourceSettings));
    }, [obs, source]);

    // ui
    return hidden === undefined ? <></> : <>
        <EditModeContainer hidden={hidden}>
            <EditModeContent component={Grid} item>
                <TileButton
                    icon={
                        <EditModeBadge>{
                            pending ? <CircularProgress size={24} /> :
                            source.typeId === "wasapi_input_capture" ?
                                isMuted ? <MicOffIcon /> : volume === 0 ? <MicSilentIcon /> : <MicIcon /> :
                                isMuted ? <AudioOffIcon /> : volume === 0 ? <AudioSilentIcon /> : <AudioIcon />
                        }</EditModeBadge>
                    } 
                    color={hidden ? undefined : isMuted ? "warning" : "primary"}
                    onClick={onClick}
                    disabled={pending}
                    title={source.name}>
                    {source.name}
                </TileButton>
            </EditModeContent>
        </EditModeContainer>
    </>;
};
