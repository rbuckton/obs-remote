import React, {
    ChangeEvent,
    KeyboardEvent,
    Children,
    forwardRef,
    useContext,
    useState
} from "react";
import {
    AppBar as MuiAppBar,
    AppBarProps as MuiAppBarProps,
    IconButton,
    IconButtonProps,
    TextField,
    TextFieldProps,
    Toolbar,
    ToolbarProps,
    Typography,
    TypographyProps
} from "@material-ui/core";
import {
    ArrowBack as ArrowBackIcon,
    Menu as MenuIcon,
    Search as SearchIcon
} from "@material-ui/icons";
import { AppContext } from "../utils/context";

export interface AppBarProps extends Omit<MuiAppBarProps, "variant"> {
    variant?: "default" | "dialog";
    primary: string;
    searchable?: boolean;
    closable?: boolean;
    onClose?: () => void;
    onSearch?: (text: string) => void;
    onStartSearch?: () => void;
    onCancelSearch?: () => void;
    AppBarProps?: MuiAppBarProps;
    ToolbarProps?: ToolbarProps;
    MenuButtonProps?: IconButtonProps;
    TypographyProps?: TypographyProps;
    SearchButtonProps?: IconButtonProps;
    SearchFieldProps?: TextFieldProps;
}
export const AppBar = forwardRef(({
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
}: AppBarProps, ref) => {
    const { openAppDrawer } = useContext(AppContext);
    const [showSearch, setShowSearch] = useState(false);
    const children = Children.toArray(childrenProp);
    const startSearch = () => {
        setShowSearch(true);
        onStartSearch?.();
    };
    const cancelSearch = () => {
        setShowSearch(false);
        onCancelSearch?.();
    };
    const onSearchBoxChange = (event: ChangeEvent<HTMLInputElement>) => {
        onSearch?.(event.target.value);
    };
    const onSearchBoxKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape" && !event.currentTarget.value) {
            cancelSearch();
        }
    };
    return <>
        <MuiAppBar position="static" color="default" ref={ref} {...props} {...AppBarProps}>
            <Toolbar {...ToolbarProps}>
                {showSearch ? 
                <>
                    <IconButton edge="start" aria-label="cancel" style={{ marginRight: 12 }} {...MenuButtonProps} onClick={cancelSearch}><ArrowBackIcon /></IconButton>
                    <TextField autoFocus type="search" aria-label="search" placeholder="Search..." style={{ flexGrow: 1 }} {...SearchFieldProps} onChange={onSearchBoxChange} onKeyDownCapture={onSearchBoxKeyDown} />
                </> :
                <>
                    {variant === "default" && <IconButton edge="start" aria-label="menu" style={{marginRight: 12 }} {...MenuButtonProps} onClick={openAppDrawer}><MenuIcon /></IconButton>}
                    {variant === "dialog" && closable && <IconButton edge="start" aria-label="close" style={{marginRight: 12 }} {...MenuButtonProps} onClick={onClose}><ArrowBackIcon /></IconButton>}
                    <Typography variant="h6" style={{flexGrow: 1}} {...TypographyProps}>{primary}</Typography>
                    {searchable && <IconButton {...SearchButtonProps} onClick={startSearch}><SearchIcon /></IconButton>}
                </>}
                {children}
            </Toolbar>
        </MuiAppBar>
    </>;
});