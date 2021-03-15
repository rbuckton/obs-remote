import React, { Children } from "react";
import clsx from "clsx";
import { Button, ButtonProps, ExtendButtonBaseTypeMap, fade, Grid, PropTypes, Theme, Typography } from "@material-ui/core";
import { OverrideProps } from "@material-ui/core/OverridableComponent";
import { ClassKeyOfStyles, createStyles, WithStyles, withStyles } from "@material-ui/styles";

const styles = (theme: Theme) => createStyles({
    root: {
        height: "128px",
        width: "128px",
        margin: "12px",
        // "&.MuiButton-textTwitch": {
        //     color: theme.palette.twitch.main,
        //     "&:hover": {
        //         backgroundColor: fade(theme.palette.twitch.main, theme.palette.action.hoverOpacity),
        //         "@media (hover: none)": {
        //             backgroundColor: "transparent"
        //         }
        //     }
        // },
        // "&.MuiButton-outlinedTwitch": {
        //     color: theme.palette.twitch.main,
        //     border: `1px solid ${fade(theme.palette.twitch.main, 0.5)}`,
        //     "&:hover": {
        //         border: `1px solid ${theme.palette.twitch.main}`,
        //         backgroundColor: fade(theme.palette.twitch.main, theme.palette.action.hoverOpacity),
        //         "@media (hover: none)": {
        //             backgroundColor: "transparent"
        //         }
        //     }
        // },
        // "&.MuiButton-containedTwitch": {
        //     color: theme.palette.twitch.contrastText,
        //     backgroundColor: theme.palette.twitch.main,
        //     "&:hover": {
        //         backgroundColor: theme.palette.twitch.dark,
        //         "@media (hover: none)": {
        //             backgroundColor: theme.palette.twitch.main
        //         }
        //     }
        // },
        "& .MuiButton-label": {
            height: "100%"
        },
    },
    textTwitch: {
        color: theme.palette.twitch.main,
        "&:hover": {
            backgroundColor: fade(theme.palette.twitch.main, theme.palette.action.hoverOpacity),
            "@media (hover: none)": {
                backgroundColor: "transparent"
            }
        }
    },
    outlinedTwitch: {
        color: theme.palette.twitch.main,
        border: `1px solid ${fade(theme.palette.twitch.main, 0.5)}`,
        "&:hover": {
            border: `1px solid ${theme.palette.twitch.main}`,
            backgroundColor: fade(theme.palette.twitch.main, theme.palette.action.hoverOpacity),
            "@media (hover: none)": {
                backgroundColor: "transparent"
            }
        }
    },
    containedTwitch: {
        color: theme.palette.twitch.contrastText,
        backgroundColor: theme.palette.twitch.main,
        "&:hover": {
            backgroundColor: theme.palette.twitch.dark,
            "@media (hover: none)": {
                backgroundColor: theme.palette.twitch.main
            }
        }
    },
    container: {
        height: "100%",
    },
    icon: {
        padding: theme.spacing(1, 0, 0),
        justifyContent: "center",
        alignItems: "center"
    },
    caption: {
        padding: theme.spacing(1, 0, 0),
        flexGrow: 1,
        minHeight: "68px",
        maxHeight: "138px",
        justifyContent: "center",
        alignItems: "center",
    },
    captionText: {
        maxHeight: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis"
    }
});

export type TileButtonClassKey = ClassKeyOfStyles<typeof styles>;

export type TileButtonTypeMap<
    P = {},
    D extends React.ElementType = 'button'
> = ExtendButtonBaseTypeMap<{
    props: P & {
        icon?: React.ReactNode;
        children?: React.ReactNode;
        color?: PropTypes.Color | "twitch";
        disabled?: boolean;
        disableElevation?: boolean;
        disableFocusRipple?: boolean;
        fullWidth?: boolean;
        size?: 'small' | 'medium' | 'large';
        variant?: 'text' | 'outlined' | 'contained';
        noWrap?: boolean;
    };
    defaultComponent: D;
    classKey: TileButtonClassKey;
}>;

export type TileButtonProps<
    D extends React.ElementType = TileButtonTypeMap['defaultComponent'],
    P = {}
> = OverrideProps<TileButtonTypeMap<P, D>, D>;

export const TileButton = withStyles(styles, { name: "TileButton", withTheme: true })(({
    // from WithStyles
    theme,
    classes,

    // from TileButtonProps
    icon,
    children,

    // from ButtonProps
    variant = "contained",
    noWrap,
    color,
    className,
    ...props
}: TileButtonProps & WithStyles<typeof styles, true>) => {
    const twitch = color === "twitch";
    if (color === "twitch") color = "default";
    // ui
    return <>
        <Button variant={variant} color={color} {...props} className={
            clsx([
                classes.root,
                {
                    [classes[`${variant}Twitch` as keyof typeof classes]]: twitch
                },
                className
            ])}>
            <Grid container direction="column" className={classes.container} wrap="nowrap">
                <Grid item container className={classes.icon}>{icon}</Grid>
                <Grid item container className={classes.caption} zeroMinWidth={noWrap}>
                    <Typography className={classes.captionText} noWrap={noWrap}>
                        {Children.toArray(children)}
                    </Typography>
                </Grid>
            </Grid>
        </Button>
    </>;
});