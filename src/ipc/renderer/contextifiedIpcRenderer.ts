/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import type { IpcRendererEvent } from "electron";

export interface ContextifiedIpcRenderer {
    on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): { unsubscribe(): void };
    invoke(channel: string, ...args: any[]): Promise<any>;
    send(channel: string, ...args: any[]): void;
    sendSync(channel: string, ...args: any[]): any;    
    sendTo(webContentsId: number, channel: string, ...args: any[]): void;
    sendToHost(channel: string, ...args: any[]): void;
}