/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Badge, BadgeProps } from "@mui/material";
import clsx from "clsx";
import { useAppContext } from "../utils/appContext";
import { useEditContainerContext } from "../utils/editContainerContext";
import { globalClasses } from "./globalStyles";

export interface EditModeBadgeProps extends Omit<BadgeProps, "badgeContent"> {
}

/**
 * A component that adds a badge in edit mode indicating whether a component is hidden or visible
 * when not in edit mode.
 */
export const EditModeBadge = ({ className, ...props }: EditModeBadgeProps) => {
    // state
    const { editMode } = useAppContext();
    const { hidden } = useEditContainerContext();

    // behavior
    // <none>

    // effects
    // <none>

    // ui
    return <Badge
        badgeContent={editMode ? hidden ? "hidden" : "visible" : undefined}
        color="secondary"
        className={clsx(
            globalClasses.editModeBadge,
            className
        )}
        {...props}
    />;
};
