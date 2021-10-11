/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

/**
 * Custom source settings key indicating whether the source should be hidden when not in in edit mode.
 */
export const sourceHiddenCustomPropertyKey = "__obs-remote-hidden__";

/**
 * Gets a value indicating whether the source should be hidden when not in edit mode.
 */
export function getSourceHiddenCustomProperty(sourceSettings: Record<string, unknown>): boolean {
    const hidden = sourceSettings[sourceHiddenCustomPropertyKey];
    return hidden === true;
}

/**
 * Sets a value indicating whether the source should be hidden when not in edit mode.
 */
export function setSourceHiddenCustomProperty(sourceSettings: Record<string, unknown>, value: boolean): void {
    sourceSettings[sourceHiddenCustomPropertyKey] = value;
}