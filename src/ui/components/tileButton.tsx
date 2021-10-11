/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { alpha, Button, ButtonProps, ExtendButtonBaseTypeMap, Grid, Typography } from "@mui/material";
import { OverrideProps } from "@mui/types";
import { styled, SxProps, Theme } from "@mui/system";
import clsx from "clsx";
import { Children, ElementType, ForwardedRef, forwardRef, ReactNode } from "react";
import { generateUtilityClasses } from "../utils/mui";
import { OverridableFunctionComponent } from "../../core/renderer/types";

const classes = generateUtilityClasses("TileButton", [
    "root",
    "textTwitch",
    "outlinedTwitch",
    "containedTwitch",
    "container",
    "icon",
    "caption",
    "captionText",
]);

const RootButton = styled(Button)(({ theme }) => ({
    [`&.${classes.root}`]: {
        height: "128px",
        width: "128px",
        "& .MuiButton-label": {
            height: "100%"
        },
    },
    [`& .${classes.textTwitch}`]: {
        color: theme.palette.twitch.main,
        "&:hover": {
            backgroundColor: alpha(theme.palette.twitch.main, theme.palette.action.hoverOpacity),
            "@media (hover: none)": {
                backgroundColor: "transparent"
            }
        }
    },
    [`& .${classes.outlinedTwitch}`]: {
        color: theme.palette.twitch.main,
        border: `1px solid ${alpha(theme.palette.twitch.main, 0.5)}`,
        "&:hover": {
            border: `1px solid ${theme.palette.twitch.main}`,
            backgroundColor: alpha(theme.palette.twitch.main, theme.palette.action.hoverOpacity),
            "@media (hover: none)": {
                backgroundColor: "transparent"
            }
        }
    },
    [`& .${classes.containedTwitch}`]: {
        color: theme.palette.twitch.contrastText,
        backgroundColor: theme.palette.twitch.main,
        "&:hover": {
            backgroundColor: theme.palette.twitch.dark,
            "@media (hover: none)": {
                backgroundColor: theme.palette.twitch.main
            }
        }
    },
    [`& .${classes.container}`]: {
        height: "100%",
    },
    [`& .${classes.icon}`]: {
        padding: theme.spacing(1, 0, 0),
        justifyContent: "center",
        alignItems: "center"
    },
    [`& .${classes.caption}`]: {
        padding: theme.spacing(1, 0, 0),
        flexGrow: 1,
        minHeight: "68px",
        maxHeight: "138px",
        justifyContent: "center",
        alignItems: "center",
    },
    [`& .${classes.captionText}`]: {
        maxHeight: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
}))

export type TileButtonTypeMap<
    P = {},
    D extends ElementType = 'button'
> = ExtendButtonBaseTypeMap<{
    props: P & {
        icon?: ReactNode;
        children?: ReactNode;
        color?: ButtonProps["color"];
        disabled?: boolean;
        disableElevation?: boolean;
        disableFocusRipple?: boolean;
        fullWidth?: boolean;
        size?: 'small' | 'medium' | 'large';
        variant?: 'text' | 'outlined' | 'contained';
        noWrap?: boolean;
        sx?: SxProps<Theme>;
    };
    defaultComponent: D;
}>;

export type TileButtonProps<
    D extends ElementType = TileButtonTypeMap['defaultComponent'],
    P = {}
> = OverrideProps<TileButtonTypeMap<P, D>, D>;

export const TileButton = forwardRef(({
    // from TileButtonProps
    icon,
    children,

    // from ButtonProps
    variant = "contained",
    noWrap,
    color,
    className,
    ...props
}: TileButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
    // state
    // <none>

    // behavior
    // <none>
    
    // effects
    // <none>

    // ui
    return <RootButton
        ref={ref}
        variant={variant}
        color={color}
        className={clsx([
            classes.root,
            { [classes[`${variant}Twitch`]]: color === "twitch" },
            className
        ])}
        {...props}>
        <Grid container direction="column" className={classes.container} wrap="nowrap">
            <Grid item container className={classes.icon}>{icon}</Grid>
            <Grid item container className={classes.caption} zeroMinWidth={noWrap}>
                <Typography className={classes.captionText} noWrap={noWrap}>
                    {Children.toArray(children)}
                </Typography>
            </Grid>
        </Grid>
    </RootButton>;
}) as OverridableFunctionComponent<TileButtonTypeMap>;