import { GridProps } from "@material-ui/core";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";

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