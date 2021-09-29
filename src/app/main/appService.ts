import { optional, ServiceIdentifier } from "service-composition";
import { MainOnly } from "../../core/main/decorators";
import { IMainDevServerService } from "../../dev/main/devServerService";
import { IMainDevToolsService } from "../../dev/main/devToolsService";
import { IMainWindowManagerService } from "../../windowManager/main/windowManagerService";

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
    constructor(
        @IMainWindowManagerService private _windowManagerService: IMainWindowManagerService,
        @optional(IMainDevServerService) private _devServerService?: IMainDevServerService | undefined,
        @optional(IMainDevToolsService) private _devToolsService?: IMainDevToolsService | undefined,
    ) {
    }

    async run(): Promise<void> {
        const mainWindow = this._windowManagerService.mainWindow;
        const session = mainWindow.webContents.session;
        const devServer = await this._devServerService?.tryStart();
        if (devServer) {
            await this._devToolsService?.install(session);
            mainWindow.webContents.loadURL(`http://localhost:${devServer.port}/assets/index.html`);
        }
        else {
            mainWindow.webContents.loadFile("./assets/index.html");
        }
        mainWindow.on("ready-to-show", () => mainWindow.show());

        // run() should suspend until the main window is closed.
        await new Promise(resolve => mainWindow.on("closed", resolve));
    }
}