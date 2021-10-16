/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import "source-map-support/register";
import { app } from "electron";
import { ServiceCollection } from "service-composition";
import { IMainAppService, MainAppService } from "./app/main/appService";
import { IMainDevToolsService, MainDevToolsService } from "./dev/main/devToolsService";
import { IPreferencesService } from "./preferences/common/preferencesService";
import { MainPreferencesService } from "./preferences/main/preferencesService";
import { IMainSessionService, MainSessionService } from "./session/main/sessionService";
import { IMainWindowManagerService, MainWindowManagerService } from "./windowManager/main/windowManagerService";
import { IPowerManagementService } from "./powerManagement/common/powerManagement";
import { MainPowerManagementService } from "./powerManagement/main/powerManagement";
import { IAppInfoService } from "./app/common/appInfoService";
import { MainAppInfoService } from "./app/main/appInfoService";
import { IMainElectronForgeService } from "./app/main/electronForgeService";
import { IMainKeyVaultService, MainKeyVaultService } from "./preferences/main/keyVaultService";

// injected by @electron-forge/plugin-webpack
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}
  
/**
 * Starts the electron Main thread
 */
async function main() {
    try {
        const keyVaultService = new MainKeyVaultService();
        await keyVaultService.waitForReady();

        const serviceProvider = new ServiceCollection()
            .addInstance(IMainElectronForgeService, {
                MAIN_WINDOW_WEBPACK_ENTRY: MAIN_WINDOW_WEBPACK_ENTRY,
                MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            })
            .addInstance(IMainKeyVaultService, keyVaultService)
            .addClass(IPreferencesService, MainPreferencesService)
            .addClass(IPowerManagementService, MainPowerManagementService)
            .addClass(IAppInfoService, MainAppInfoService)
            .addClass(IMainDevToolsService, MainDevToolsService)
            .addClass(IMainSessionService, MainSessionService)
            .addClass(IMainWindowManagerService, MainWindowManagerService)
            .addClass(IMainAppService, MainAppService)
            .createContainer();

        // 'main()' should suspend until the application has ended.
        const appService = serviceProvider.getService(IMainAppService);
        await appService.run();
    }
    catch (e) {
        console.error(e);
        app.quit();
    }
}

app.on("ready", main);
app.on("window-all-closed", () => { app.quit(); });
