import React, { Children, createContext, ReactNode, useContext } from "react";
import { Theme, WithStyles, createStyles, withStyles } from "@material-ui/core";
import { AppContext } from "../utils/context";

export const EditModeContext = createContext<{ hidden?: boolean; editModeClassName?: string }>({
    hidden: undefined,
    editModeClassName: undefined
});

const styles = (theme: Theme) => createStyles({
    editModeHidden: {
        opacity: "50%"
    }
});

export interface EditModeContainerProps {
    hidden?: boolean;
    children?: ReactNode;
}

export const EditModeContainer = withStyles(styles, { name: "EditModeContainer" })(({
    classes,
    hidden,
    children: childrenProp
}: EditModeContainerProps & WithStyles<typeof styles>) => {
    const { editMode } = useContext(AppContext);
    const children = Children.toArray(childrenProp);
    return <>
        {(!hidden || editMode) &&
            <EditModeContext.Provider value={{ hidden, editModeClassName: classes.editModeHidden }}>
                {children}
            </EditModeContext.Provider>
        }
    </>;
});

export const useEditModeClassName = (hidden?: boolean) => {
    const { hidden: hiddenContext, editModeClassName } = useContext(EditModeContext);
    return (hidden ?? hiddenContext) ? editModeClassName : undefined;
};