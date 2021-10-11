/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

export type {
    OBSStats,
    Scene,
    SceneItem,
    SceneItemTransform,
    Output,
    FontFlags,
    ImageFormat,
    BoundingBoxType,
    Alignment,
    SceneItemSpec as SceneItemQueryRef,
    SceneItemSpec as SceneItemNameQueryRef,
    SceneItemRef,
} from "../common/protocol";
export * from "./obsWebSocket";
export * from "./nullObsWebSocket";
export * from "./iObsWebSocket";