import "source-map-support/register";
import { app } from "electron";
import { ServiceCollection } from "service-composition";
import { IMainAppService, MainAppService } from "./app/main/appService";
import { IMainDevServerService, MainDevServerService } from "./dev/main/devServerService";
import { IMainDevToolsService, MainDevToolsService } from "./dev/main/devToolsService";
import { IPreferencesService } from "./preferences/common/preferencesService";
import { MainPreferencesService } from "./preferences/main/mainPreferencesService";
import { IMainSessionService, MainSessionService } from "./session/main/sessionService";
import { IMainWindowManagerService, MainWindowManagerService } from "./windowManager/main/windowManagerService";

async function main() {
    try {
        // The preferences store needs to be created before the render thread is started.
        const preferencesService = new MainPreferencesService();
        const serviceProvider = new ServiceCollection()
            .addInstance(IPreferencesService, preferencesService)
            .addClass(IMainDevServerService, MainDevServerService)
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
