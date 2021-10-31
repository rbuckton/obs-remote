/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ContextifiedIpcRenderer } from "../../services/ipc/renderer/contextifiedIpcRenderer";

declare var ipcRenderer: ContextifiedIpcRenderer;

export function isInRenderer() {
    return typeof getIpcRenderer() !== "undefined";
}

export function getIpcRenderer(throwIfMissing: true): ContextifiedIpcRenderer;
export function getIpcRenderer(throwIfMissing?: boolean): ContextifiedIpcRenderer | undefined;
export function getIpcRenderer(throwIfMissing?: boolean) {
    const result = typeof ipcRenderer !== "undefined" ? ipcRenderer : undefined;
    if (result === undefined && throwIfMissing) {
        throw new TypeError("Not in electron Renderer thread");
    }
    return result;
}
