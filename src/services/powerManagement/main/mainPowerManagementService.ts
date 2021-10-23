/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import { powerSaveBlocker } from "electron";
import { IpcServerDecorators } from "../../../ipc/main/decorators";
import { IPowerManagementIpcContract } from "../common/powerManagementIpcContract";
import { IPowerManagementService } from "../common/powerManagementService";

const { IpcServerClass, IpcServerSyncMethod } = IpcServerDecorators.create<IPowerManagementIpcContract, {}>("powerManagement");

/**
 * Handles power managment on the electron Main thread.
 */
@IpcServerClass
export class MainPowerManagementService implements IPowerManagementService {
    /**
     * Starts a power-save blocker, returning a handle to the blocker.
     */
    @IpcServerSyncMethod
    startPowerSaveBlocker(type: "prevent-app-suspension" | "prevent-display-sleep"): number {
        return powerSaveBlocker.start(type);
    }

    /**
     * Stops a power-save blocker with the provided handle.
     */
    @IpcServerSyncMethod
    stopPowerSaveBlocker(id: number): void {
        powerSaveBlocker.stop(id);
    }

    /**
     * Returns whether the provided handle points to a power-save blocker that is currently blocking.
     */
    @IpcServerSyncMethod
    isBlockingPowerSave(id: number): boolean {
        return powerSaveBlocker.isStarted(id);
    }

    [Disposable.dispose]() {
    }
}