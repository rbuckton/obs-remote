import React, { useContext } from "react";
import { Badge, BadgeProps, makeStyles } from "@material-ui/core";
import { AppContext } from "../utils/context";
import clsx from "clsx";
import { EditModeContext } from "./editModeContainer";

const useStyles = makeStyles(theme => ({
    root: {
        textTransform: "lowercase"
    }
}));

export interface EditModeBadgeProps extends Omit<BadgeProps, "badgeContent"> {
    hidden?: boolean;
}

export const EditModeBadge = ({
    hidden: hiddenProp,
    className,
    ...props
}: EditModeBadgeProps) => {
    // state
    const classes = useStyles();
    const { editMode } = useContext(AppContext);
    const editModeContext = useContext(EditModeContext);
    const hidden = hiddenProp ?? editModeContext.hidden;
    return <Badge
        badgeContent={
            editMode ? 
                hidden ? 
                    "hidden" :
                    "visible" :
            undefined
        }
        color="secondary"
        className={clsx([
            classes.root,
            className
        ])}
        {...props}
    />;
}