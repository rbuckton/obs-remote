/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { createContext, useContext } from "react";
import { globalClasses } from "../components/globalStyles";

/**
 * A context that injects state into a component tree based on whether the 
 * component is hidden outside of edit mode.
 */
export interface EditContainerContext {
    hidden?: boolean;
}

/**
 * A context that injects state into a component tree based on whether the 
 * component is hidden outside of edit mode.
 */
export const EditContainerContext = createContext<EditContainerContext>({
    hidden: false,
});

/**
 * A hook to use the current {@link EditContainerContext}.
 */
export function useEditContainerContext() {
    return useContext(EditContainerContext);
}

export const useEditModeClassName = (hidden?: boolean) => {
    return (hidden ?? useEditContainerContext().hidden) ? globalClasses.editModeHidden : undefined;
};
