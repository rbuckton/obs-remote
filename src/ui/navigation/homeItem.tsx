import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Home as HomeIcon } from "@material-ui/icons";

export const HomeItem = () => {
    return <>
        <ListItem button component={RouterLink} to="/">
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText>Home</ListItemText>
        </ListItem>
    </>;
};