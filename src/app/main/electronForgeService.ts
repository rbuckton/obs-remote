/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ServiceIdentifier } from "service-composition";

export const IMainElectronForgeService = ServiceIdentifier.create<IMainElectronForgeService>("IMainElectronForgeService");

export interface IMainElectronForgeService {
    readonly MAIN_WINDOW_WEBPACK_ENTRY: string;
    readonly MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
}