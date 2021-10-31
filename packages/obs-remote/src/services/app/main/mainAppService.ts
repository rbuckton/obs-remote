/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { IpcServerDecorators } from "../../../ipc/main/decorators";
import { IAppService } from "../common/appService";
import { IAppServiceIpcContract } from "../common/appServiceIpcContract";
import { IMainElectronForgeWebpackInjectionService } from "./mainElectronForgeWebpackInjectionService";
import { Version } from "../../../core/common/version";
import { IMainWindowManagerService } from "../../windowManager/main/mainWindowManagerService";

const { IpcServerClass, IpcServerMethod, IpcServerSyncMethod } = IpcServerDecorators.create<IAppServiceIpcContract, {}>("appInfo");

/**
 * Provides access to information about the electron application from the Main thread.
 */
@IpcServerClass
export class MainAppService implements IAppService, Disposable {
    private _version: Version;

    @IMainWindowManagerService _mainWindowService!: IMainWindowManagerService;

    constructor(
        @IMainElectronForgeWebpackInjectionService private _electronForgeService: IMainElectronForgeWebpackInjectionService
    ) {
        this._version = Version.parse(app.getVersion());
    }

    /**
     * Gets the application installation path
     */
    @IpcServerSyncMethod
    getAppPath() {
        return app.getAppPath();
    }

    @IpcServerSyncMethod
    getFreeMemory() {
        return os.freemem();
    }

    @IpcServerSyncMethod
    getMode() {
        return /^http:/i.test(this._electronForgeService.MAIN_WINDOW_WEBPACK_ENTRY) ? "development" : "production";
    }

    @IpcServerMethod
    async getFakeScreenshotDataUri(): Promise<string> {
        let data: Buffer;
        try {
            const screenshotResourcePath = path.resolve(process.resourcesPath, "screenshot.jpg");
            data = await fs.promises.readFile(screenshotResourcePath);
        }
        catch (e) {
            try {
                const screenshotAssetPath = path.resolve(app.getAppPath(), "assets/screenshot.jpg");
                data = await fs.promises.readFile(screenshotAssetPath);
            }
            catch {
                throw e;
            }
        }
        return `data:image/jpeg;base64,${data.toString("base64")}`;
    }

    get version() {
        return this._version;
    }

    @IpcServerSyncMethod("getVersion")
    private _getVersion() {
        return this._version.toString();
    }

    @IpcServerMethod()
    async requestFullscreen() {
        await this._mainWindowService.mainWindow.webContents.executeJavaScript(`
            document.documentElement.requestFullscreen({ navigationUI: "hide" })
        `, /*userGesture*/ true);
    }

    /**
     * Cleans up resources
     */
    [Disposable.dispose]() {
    }
}