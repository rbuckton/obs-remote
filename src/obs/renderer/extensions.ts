export const editModeHiddenKey = "__obs-remote-hidden__";

export function getSourceHiddenInEditMode(sourceSettings: Record<string, unknown>): boolean {
    const hidden = sourceSettings[editModeHiddenKey];
    return hidden === true;
}

export function setSourceHiddenInEditMode(sourceSettings: Record<string, unknown>, value: boolean): void {
    sourceSettings[editModeHiddenKey] = value;
}