/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { GlobalStyles } from "@mui/material";
import { generateUtilityClasses } from "../utils/mui";

export const globalClasses = generateUtilityClasses("ObsRemote", [
    "editModeHidden",
    "editModeBadge"
]);

export const appGlobalStyles = <GlobalStyles styles={{
    [`.${globalClasses.editModeHidden}`]: {
        opacity: "50%"
    },
    [`.${globalClasses.editModeBadge}`]: {
        textTransform: "lowercase"
    }
}} />;

