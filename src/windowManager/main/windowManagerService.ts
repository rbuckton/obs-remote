import { BrowserWindow } from "electron";
import { ServiceIdentifier } from "service-composition";
import { MainOnly } from "../../core/main/decorators";
import { IMainSessionService } from "../../session/main/sessionService";

export const IMainWindowManagerService = ServiceIdentifier.create<IMainWindowManagerService>("IMainWindowManagerService");

export interface IMainWindowManagerService {
    readonly mainWindow: BrowserWindow;
}

@MainOnly
export class MainWindowManagerService implements IMainWindowManagerService {
    private _mainWindow: BrowserWindow;

    constructor(
        @IMainSessionService private _sessionService: IMainSessionService,
    ) {
        this._mainWindow = new BrowserWindow({
            show: false,
            width: 800,
            height: 600,
            fullscreenable: true,
            maximizable: true,
            autoHideMenuBar: true,
            webPreferences: {
                session: this._sessionService.session,
                worldSafeExecuteJavaScript: true,
                // TODO: improve security and disable these
                nodeIntegration: true,
                enableRemoteModule: true,
            }
        });
    }

    get mainWindow() {
        return this._mainWindow;
    }
}