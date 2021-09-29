import React, { useContext, useState } from "react";
import { SourceType } from "../../../obs/common/protocol";
import { AppContext } from "../../utils/context";
import { AudioSourceTile } from "./audioSourceTile";
import { AudioSource } from "./audioSource";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";

export interface AudioSourceTilesProps {
}

export const AudioSourceTiles = ({ }: AudioSourceTilesProps) => {
    // state
    const { obs } = useContext(AppContext);
    const [sources, setSources] = useState<AudioSource[]>();

    // behavior

    // effects
    useAsyncEffect(async (token) => {
        const { types } = await obs.send("GetSourceTypesList");
        if (token.signaled) return;

        const { sources } = await obs.send("GetSourcesList");
        if (token.signaled) return;

        const typeMap = new Map(types.map(t => [t.typeId, t]));
        const newSources: AudioSource[] = [];
        for (const source of sources) {
            const sourceType = typeMap.get(source.typeId);
            if (sourceType?.caps.hasAudio) {
                newSources.push({ ...source, sourceType: sourceType as SourceType & { caps: { isAudio: true } } });
            }
        }
        setSources(newSources);
    }, [obs]);

    // ui
    return <>{sources?.map(source => 
        <AudioSourceTile
            source={source}
            key={source.name}
        />)
    }</>;
};