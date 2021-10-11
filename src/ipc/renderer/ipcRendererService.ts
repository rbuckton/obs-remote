/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ServiceIdentifier } from "service-composition";
import { ContextifiedIpcRenderer } from "./contextifiedIpcRenderer";

export const IpcRendererService = ServiceIdentifier.create<ContextifiedIpcRenderer>("ipcRenderer");