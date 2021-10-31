/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { contextBridge, ipcRenderer } from "electron";
import type { ContextifiedIpcRenderer } from "./services/ipc/renderer/contextifiedIpcRenderer";

const contextifiedIpcRenderer: ContextifiedIpcRenderer = {
    on(channel, listener) {
        ipcRenderer.on(channel, listener);
        let subscribed = true;
        return {
            unsubscribe() {
                if (subscribed) {
                    ipcRenderer.off(channel, listener);
                    subscribed = false;
                }
            }
        };
    },
    invoke(channel, ...args) {
        return ipcRenderer.invoke(channel, ...args);
    },
    send(channel, ...args) {
        return ipcRenderer.sendSync(channel, ...args);
    },
    sendSync(channel, ...args) {
        return ipcRenderer.sendSync(channel, ...args);
    },
    sendTo(webContentsId, channel, ...args) {
        return ipcRenderer.sendTo(webContentsId, channel, args);
    },
    sendToHost(channel, ...args) {
        return ipcRenderer.sendToHost(channel, ...args);
    },
};

contextBridge.exposeInMainWorld("ipcRenderer", contextifiedIpcRenderer);