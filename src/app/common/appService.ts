/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ServiceIdentifier } from "service-composition";
import { Version } from "../../core/common/version";

/**
 * Provides access to information about the electron application.
 */
export const IAppService = ServiceIdentifier.create<IAppService>("IAppService");

/**
 * Provides access to information about the electron application.
 */
export interface IAppService {
    get version(): Version;
    getAppPath(): string;
    getFreeMemory(): number;
    getFakeScreenshotDataUri(): Promise<string>;
    getMode(): "production" | "development";
    requestFullscreen(): Promise<void>;
}