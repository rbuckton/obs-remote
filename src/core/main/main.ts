/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

let ipcMain: import("electron").IpcMain | undefined | null;
let inMain: boolean | undefined;

export function isInMain() {
    return inMain ??= typeof getIpcMain() !== "undefined";
}

export function getIpcMain(throwIfMissing: true): import("electron").IpcMain;
export function getIpcMain(throwIfMissing?: boolean): import("electron").IpcMain | undefined;
export function getIpcMain(throwIfMissing?: boolean) {
    if (ipcMain === undefined) {
        try {
            ipcMain = require("electron").ipcMain;
        }
        catch {
            ipcMain = null
        }
    }
    const result = ipcMain === null ? undefined : ipcMain;
    if (result === undefined && throwIfMissing) {
        throw new TypeError("Not in electron Main thread");
    }
    return result;
}
