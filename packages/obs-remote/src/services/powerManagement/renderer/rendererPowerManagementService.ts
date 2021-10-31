/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Disposable } from "@esfx/disposable";
import { IpcClientDecorators } from "../../../ipc/renderer/decorators";
import { IPowerManagementIpcContract } from "../common/powerManagementIpcContract";
import { IPowerManagementService } from "../common/powerManagementService";

const { IpcClientClass, IpcClientSyncMethod } = IpcClientDecorators.create<IPowerManagementIpcContract, {}>("powerManagement");

/**
 * Handles power managment on an electron Renderer thread.
 */
@IpcClientClass
export class RendererPowerManagementService implements IPowerManagementService {
    /**
     * Starts a power-save blocker, returning a handle to the blocker.
     */
    @IpcClientSyncMethod
    startPowerSaveBlocker(type: "prevent-app-suspension" | "prevent-display-sleep"): number {
        throw new Error("Method not implemented.");
    }

    /**
     * Stops a power-save blocker with the provided handle.
     */
    @IpcClientSyncMethod
    stopPowerSaveBlocker(id: number): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns whether the provided handle points to a power-save blocker that is currently blocking.
     */
    @IpcClientSyncMethod
    isBlockingPowerSave(id: number): boolean {
        throw new Error("Method not implemented.");
    }

    [Disposable.dispose]() {
    }
}