/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { useAppContext } from "../../utils/appContext";
import { SceneTile } from "./sceneTile";

export interface SceneTilesProps {
}

export const SceneTiles = ({ }: SceneTilesProps) => {
    // state
    const { scenes, currentScene } = useAppContext();

    // ui
    return <>{[...scenes.values()].map(scene =>
        <SceneTile
            scene={scene}
            key={scene.name}
            current={scene.name === currentScene}
        />)
    }</>;
};