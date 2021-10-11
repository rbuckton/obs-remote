/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { optional, ServiceIdentifier } from "service-composition";
import { MainOnly } from "../../core/main/decorators";
import { IMainDevToolsService } from "../../dev/main/devToolsService";
import { IPowerManagementService } from "../../powerManagement/common/powerManagement";
import { IPreferencesService } from "../../preferences/common/preferencesService";
import { IMainWindowManagerService } from "../../windowManager/main/windowManagerService";
import { IAppInfoService } from "../common/appInfoService";
import { IMainElectronForgeService } from "./electronForgeService";

/**
 * Application component for the electron Main thread. Starts the application and
 * shows the main window.
 */
export const IMainAppService = ServiceIdentifier.create<IMainAppService>("IMainAppService");

/**
 * Application component for the electron Main thread. Starts the application and
 * shows the main window.
 */
export interface IMainAppService {
    /**
     * Runs the application. Resolves only once the main window has closed.
     */
    run(): Promise<void>;
}

/**
 * Application component for the electron Main thread. Starts the application and
 * shows the main window.
 */
@MainOnly
export class MainAppService implements IMainAppService {
    // Other IPC servers need to be instantiated before we start the render thread
    @IPreferencesService declare private _preferencesService: IPreferencesService;
    @IPowerManagementService declare private _powerManagementService: IPowerManagementService;

    constructor(
        @IMainWindowManagerService private _windowManagerService: IMainWindowManagerService,
        @IMainElectronForgeService private _electronForgeService: IMainElectronForgeService,
        @IAppInfoService private _appInfoService: IAppInfoService,
        @optional(IMainDevToolsService) private _devToolsService?: IMainDevToolsService | undefined,
    ) {
    }

    /**
     * Runs the application. Resolves only once the main window has closed.
     */
    async run(): Promise<void> {
        const mainWindow = this._windowManagerService.mainWindow;
        const session = mainWindow.webContents.session;
        switch (this._appInfoService.getMode()) {
            case "development":
                await this._devToolsService?.install(session);
                break;
            case "production":
                session.webRequest.onHeadersReceived((details, callback) => {
                    if (!details.responseHeaders?.["content-security-policy"] &&
                        !details.responseHeaders?.["Content-Security-Policy"]) {
                        details.responseHeaders ||= {};
                        details.responseHeaders["Content-Security-Policy"] = ["script-src 'self'; connect-src 'self' ws: wss:"];
                    }
                    callback(details);
                });
                break;        
        }

        mainWindow.on("ready-to-show", () => mainWindow.show());
        await mainWindow.webContents.loadURL(this._electronForgeService.MAIN_WINDOW_WEBPACK_ENTRY);

        // run() should suspend until the main window is closed.
        await new Promise(resolve => mainWindow.on("closed", resolve));
    }
}