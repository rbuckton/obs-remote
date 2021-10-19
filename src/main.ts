/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import "source-map-support/register";
import { app } from "electron";
import { ServiceCollection } from "service-composition";
import { IMainAppLifetimeManagerService, MainAppLifetimeManagerService } from "./app/main/appLifetimeManagerService";
import { IMainDevToolsService, MainDevToolsService } from "./dev/main/devToolsService";
import { IPreferencesService } from "./preferences/common/preferencesService";
import { MainPreferencesService } from "./preferences/main/preferencesService";
import { IMainSessionService, MainSessionService } from "./session/main/sessionService";
import { IMainWindowManagerService, MainWindowManagerService } from "./windowManager/main/windowManagerService";
import { IPowerManagementService } from "./powerManagement/common/powerManagement";
import { MainPowerManagementService } from "./powerManagement/main/powerManagement";
import { IAppService } from "./app/common/appService";
import { MainAppService } from "./app/main/appService";
import { IMainElectronForgeWebpackInjectionService, MainElectronForgeWebpackInjectionService } from "./app/main/electronForgeWebpackInjectionService";
import { IMainKeyVaultService, MainKeyVaultService } from "./preferences/main/keyVaultService";

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
