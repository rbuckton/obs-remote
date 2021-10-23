/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ServiceIdentifier } from "service-composition";

/**
 * Controls electron power-management.
 */
export const IPowerManagementService = ServiceIdentifier.create<IPowerManagementService>("IPowerManagementService");

/**
 * Controls electron power-management.
 */
export interface IPowerManagementService {
    /**
     * Starts a power-save blocker, returning a handle to the blocker.
     */
    startPowerSaveBlocker(type: "prevent-app-suspension" | "prevent-display-sleep"): number;
    /**
     * Stops a power-save blocker with the provided handle.
     */
    stopPowerSaveBlocker(id: number): void;
    /**
     * Returns whether the provided handle points to a power-save blocker that is currently blocking.
     */
    isBlockingPowerSave(id: number): boolean;
}
