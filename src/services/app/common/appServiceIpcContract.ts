/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

export interface IAppServiceIpcContract {
    /** Gets the application installation path */
    getAppPath(): string;
    getFreeMemory(): number;
    getMode(): "production" | "development";
    getFakeScreenshotDataUri(): Promise<string>;
    getVersion(): string;
    requestFullscreen(): Promise<void>;
}