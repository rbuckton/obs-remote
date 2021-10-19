/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { BrowserWindow } from "electron";
import { ServiceIdentifier } from "service-composition";
import { IMainElectronForgeWebpackInjectionService } from "../../app/main/electronForgeWebpackInjectionService";
import { MainOnly } from "../../core/main/decorators";
import { IMainSessionService } from "../../session/main/sessionService";

/**
 * Handles the creation and lifetime of the application main window.
 */
export const IMainWindowManagerService = ServiceIdentifier.create<IMainWindowManagerService>("IMainWindowManagerService");

/**
 * Handles the creation and lifetime of the application main window.
 */
export interface IMainWindowManagerService {
    get mainWindow(): BrowserWindow;
}

/**
 * Handles the creation and lifetime of the application main window.
 */
@MainOnly
export class MainWindowManagerService implements IMainWindowManagerService {
    private _mainWindow: BrowserWindow;

    constructor(
        @IMainSessionService private _sessionService: IMainSessionService,
        @IMainElectronForgeWebpackInjectionService private _electronForgeService: IMainElectronForgeWebpackInjectionService,
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
                preload: this._electronForgeService.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
            }
        });
    }

    get mainWindow() {
        return this._mainWindow;
    }
}