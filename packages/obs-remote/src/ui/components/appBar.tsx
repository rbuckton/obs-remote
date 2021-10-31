/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ArrowBack as ArrowBackIcon, Menu as MenuIcon, Search as SearchIcon } from "@mui/icons-material";
import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps, IconButton, IconButtonProps, TextField, TextFieldProps, Toolbar, ToolbarProps, Typography, TypographyProps } from "@mui/material";
import { DistributiveOmit, OverrideProps } from "@mui/types";
import * as PropTypes from "prop-types";
import { ChangeEvent, Children, ElementType, forwardRef, FunctionComponent, KeyboardEvent, useCallback, useContext, useState } from "react";
import { OverridableFunctionComponent } from "../../core/renderer/types";
import { useEventCallback } from "../hooks/useEventCallback";
import { AppContext } from "../utils/appContext";

export interface AppBarTypeMap<P = {}, D extends ElementType = 'header'> {
    props: P & DistributiveOmit<MuiAppBarProps, "variant"> & {
        variant?: "default" | "dialog";
        primary: string;
        searchable?: boolean;
        closable?: boolean;
        onClose?: () => void;
        onSearch?: (text: string) => void;
        onStartSearch?: () => void;
        onCancelSearch?: () => void;
        AppBarProps?: Omit<MuiAppBarProps, "children" | "ref">;
        ToolbarProps?: Omit<ToolbarProps, "children">;
        MenuButtonProps?: Omit<IconButtonProps, "onClick">;
        TypographyProps?: Omit<TypographyProps, "children">;
        SearchButtonProps?: Omit<IconButtonProps, "onClick">;
        SearchFieldProps?: Omit<TextFieldProps, "onChange" | "onKeyDownCapture">;    
    };
    defaultComponent: D;
}

export type AppBarProps<
    D extends ElementType = AppBarTypeMap['defaultComponent'],
    P = {}
> = OverrideProps<AppBarTypeMap<P, D>, D>;

/**
 * `<AppBar />` is a custom version of the MUI {@link MuiAppBar AppBar} component.
 */
export const AppBar = /*#__PURE__*/forwardRef(({
    variant = "default",
    primary,
    searchable,
    closable,
    children: childrenProp,
    onClose,
    onSearch,
    onStartSearch,
    onCancelSearch,
    AppBarProps,
    ToolbarProps,
    MenuButtonProps,
    TypographyProps,
    SearchButtonProps,
    SearchFieldProps,
    ...props
}, ref) => {
    // state
    const { openAppDrawer } = useContext(AppContext);
    const [showSearch, setShowSearch] = useState(false);
    const children = Children.toArray(childrenProp);

    // behavior
    const startSearch = useCallback(() => {
        setShowSearch(true);
        onStartSearch?.();
    }, [onStartSearch]);

    const cancelSearch = useCallback(() => {
        setShowSearch(false);
        onCancelSearch?.();
    }, [onCancelSearch]);

    const onOpenAppDrawerClick = useEventCallback(() => {
        openAppDrawer();
    });

    const onStartSearchClick = useEventCallback(() => {
        startSearch();
    });

    const onCancelSearchClick = useEventCallback(() => {
        cancelSearch();
    });

    const onCloseClick = useEventCallback(() => {
        onClose?.();
    });

    const onSearchBoxChange = useEventCallback((event: ChangeEvent<HTMLInputElement>) => {
        onSearch?.(event.target.value);
    });

    const onSearchBoxKeyDown = useEventCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape" && !event.currentTarget.value) {
            cancelSearch();
        }
    });

    // effects
    // <none>

    // ui
    return (
        <MuiAppBar 
            ref={ref} 
            position="static" 
            color="default" 
            {...props}
            {...AppBarProps}>
            <Toolbar 
                {...ToolbarProps}>
                {showSearch ? 
                <>
                    <IconButton 
                        edge="start"
                        aria-label="cancel search"
                        sx={{ mr: 1.5 }}
                        {...MenuButtonProps}
                        onClick={onCancelSearchClick}>
                        <ArrowBackIcon />
                    </IconButton>
                    
                    <TextField 
                        autoFocus
                        type="search"
                        aria-label="search text"
                        placeholder="Search..."
                        sx={{ flexGrow: 1 }}
                        {...SearchFieldProps}
                        onChange={onSearchBoxChange}
                        onKeyDownCapture={onSearchBoxKeyDown} />
                </> :
                <>
                    {variant === "default" && 
                        <IconButton
                            edge="start"
                            aria-label="menu"
                            sx={{ mr: 1.5 }}
                            {...MenuButtonProps}
                            onClick={onOpenAppDrawerClick}>
                            <MenuIcon />
                        </IconButton>}

                    {variant === "dialog" && closable && 
                        <IconButton 
                            edge="start"
                            aria-label="close"
                            sx={{ mr: 1.5 }}
                            {...MenuButtonProps}
                            onClick={onCloseClick}>
                            <ArrowBackIcon />
                        </IconButton>}

                    <Typography
                        variant="h6"
                        sx={{flexGrow: 1}}
                        {...TypographyProps}>
                        {primary}
                    </Typography>

                    {searchable &&
                        <IconButton
                            edge="end"
                            aria-label="search"
                            {...SearchButtonProps}
                            onClick={onStartSearchClick}>
                            <SearchIcon />
                        </IconButton>}
                </>}
                {children}
            </Toolbar>
        </MuiAppBar>
    );
}) as OverridableFunctionComponent<AppBarTypeMap>;

if (process.env.NODE_ENV !== "production") {
    AppBar.propTypes = {
        ...(MuiAppBar as FunctionComponent<MuiAppBarProps>).propTypes,
        variant: PropTypes.oneOf(["default", "dialog"]),
        primary: PropTypes.string.isRequired,
        searchable: PropTypes.bool,
        closable: PropTypes.bool,
        onClose: PropTypes.func,
        onSearch: PropTypes.func,
        onStartSearch: PropTypes.func,
        onCancelSearch: PropTypes.func,
        AppBarProps: PropTypes.object,
        ToolbarProps: PropTypes.object,
        MenuButtonProps: PropTypes.object,
        TypographyProps: PropTypes.object,
        SearchButtonProps: PropTypes.object,
        SearchFieldProps: PropTypes.object,
    };
    AppBar.displayName = "AppBar";
}