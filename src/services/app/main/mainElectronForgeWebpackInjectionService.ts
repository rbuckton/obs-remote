/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ServiceIdentifier } from "service-composition";
import { MainOnly } from "../../../core/main/decorators";

// injected by @electron-forge/plugin-webpack
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const IMainElectronForgeWebpackInjectionService = ServiceIdentifier.create<IMainElectronForgeWebpackInjectionService>("IMainElectronForgeWebpackInjectionService");

export interface IMainElectronForgeWebpackInjectionService {
    readonly MAIN_WINDOW_WEBPACK_ENTRY: string;
    readonly MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
}

@MainOnly
export class MainElectronForgeWebpackInjectionService implements IMainElectronForgeWebpackInjectionService {
    readonly MAIN_WINDOW_WEBPACK_ENTRY = MAIN_WINDOW_WEBPACK_ENTRY;
    readonly MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY = MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY;
}