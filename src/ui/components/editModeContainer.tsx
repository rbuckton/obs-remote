/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ReactNode } from "react";
import { useAppContext } from "../utils/appContext";
import { EditContainerContext } from "../utils/editContainerContext";

export interface EditModeContainerProps {
    /**
     * Indicates whether the nested component(s) should be hidden when not in edit mode.
     */
    hidden?: boolean;
    children?: ReactNode;
}

/**
 * A container for a component that affects visibility based on the container's 
 * `hidden` state and whether the UI is in edit mode.
 */
export const EditModeContainer = ({ hidden, children }: EditModeContainerProps) => {
        // state
    const { editMode } = useAppContext();
    
    // behavior
    // <none>
    
    // effects
    // <none>
    
    // ui
    // If the container is not hidden, or the UI is in edit mode, show the container.
    return !hidden || editMode ?
        <EditContainerContext.Provider value={{ hidden }} children={children} /> :
        null;
};