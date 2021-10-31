/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { GridProps } from "@mui/material";
import { Breakpoint } from '@mui/material';

export function useBreakpoints(size: GridProps[Breakpoint], overrides?: Pick<GridProps, Breakpoint>): Pick<GridProps, Breakpoint> {
    const breakpoints: Pick<GridProps, Breakpoint> = {
        xs: size,
        sm: size,
        md: size,
        lg: size,
        xl: size,
        ...overrides
    };
    return breakpoints;
}