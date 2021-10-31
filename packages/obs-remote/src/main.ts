/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import "source-map-support/register";
import { app } from "electron";
import { ServiceCollection } from "service-composition";
import { IMainDevToolsService, MainDevToolsService } from "./services/dev/main/mainDevToolsService";
import { IPowerManagementService } from "./services/powerManagement/common/powerManagementService";
import { MainPowerManagementService } from "./services/powerManagement/main/mainPowerManagementService";
import { IAppService } from "./services/app/common/appService";
import { IMainAppLifetimeManagerService, MainAppLifetimeManagerService } from "./services/app/main/mainAppLifetimeManagerService";
import { MainAppService } from "./services/app/main/mainAppService";
import { IMainElectronForgeWebpackInjectionService, MainElectronForgeWebpackInjectionService } from "./services/app/main/mainElectronForgeWebpackInjectionService";
import { IPreferencesService } from "./services/preferences/common/preferencesService";
import { IMainKeyVaultService, MainKeyVaultService } from "./services/preferences/main/mainKeyVaultService";
import { MainPreferencesService } from "./services/preferences/main/mainPreferencesService";
import { IMainWindowManagerService, MainWindowManagerService } from "./services/windowManager/main/mainWindowManagerService";
import { IMainSessionService, MainSessionService } from "./services/session/main/mainSessionService";

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
            .addInstance(IMainKeyVaultService, keyVaultService)
            .addClass(IMainElectronForgeWebpackInjectionService, MainElectronForgeWebpackInjectionService)
            .addClass(IPreferencesService, MainPreferencesService)
            .addClass(IPowerManagementService, MainPowerManagementService)
            .addClass(IAppService, MainAppService)
            .addClass(IMainDevToolsService, MainDevToolsService)
            .addClass(IMainSessionService, MainSessionService)
            .addClass(IMainWindowManagerService, MainWindowManagerService)
            .addClass(IMainAppLifetimeManagerService, MainAppLifetimeManagerService)
            .createContainer();

        // 'main()' should suspend until the application has ended.
        const appService = serviceProvider.getService(IMainAppLifetimeManagerService);
        await appService.run();
    }
    catch (e) {
        console.error(e);
        app.quit();
    }
}

app.on("ready", main);
app.on("window-all-closed", () => { app.quit(); });
