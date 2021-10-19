/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import { Version } from "../../core/common/version";
import { IpcClientDecorators } from "../../ipc/renderer";
import { IAppService } from "../common/appService";
import { IAppInfoServiceIpcContract } from "../common/ipc";

const { IpcClientClass, IpcClientAsyncMethod: IpcClientMethod, IpcClientSyncMethod } = IpcClientDecorators.create<IAppInfoServiceIpcContract, {}>("appInfo");

/**
 * Provides access to information about the electron application from the Renderer thread.
 */
@IpcClientClass
export class RendererInfoAppService implements IAppService {
    private _version: Version | undefined;

    /**
     * Gets the application installation path
     */
    @IpcClientSyncMethod
    getAppPath(): string {
        throw new Error("Method not implemented.");
    }

    @IpcClientSyncMethod
    getFreeMemory(): number {
        throw new Error("Method not implemented.");
    }

    @IpcClientSyncMethod
    getMode(): "production" | "development" {
        throw new Error("Method not implemented.");
    }

    @IpcClientMethod
    getFakeScreenshotDataUri(): Promise<string> {
        throw new Error("Method not implemented.");
    }

    @IpcClientMethod
    requestFullscreen(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    get version() {
        if (!this._version) {
            this._version = Version.parse(this._getVersion());
        }
        return this._version;
    }
    
    @IpcClientSyncMethod("getVersion")
    private _getVersion(): string {
        throw new Error("Method not implemented.");
    }

    /**
     * Cleans up resources
     */
    [Disposable.dispose]() {
    }
}