/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { useMemo } from "react";
import { useAppContext } from "../../utils/appContext";
import { AudioSourceTile } from "./audioSourceTile";

export interface AudioSourceTilesProps {
}

export const AudioSourceTiles = ({ }: AudioSourceTilesProps) => {
    // state
    const { sources, sourceTypes } = useAppContext();
    const audioSources = useMemo(() => [...sources.values()].filter(source => sourceTypes.get(source.typeId)?.caps.hasAudio), [sources, sourceTypes]);

    // behavior
    // <none>

    // effects
    // <none>

    // ui
    return <>{audioSources?.map(source => 
        <AudioSourceTile
            source={source}
            key={source.name}
        />)
    }</>;
};