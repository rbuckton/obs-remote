/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Home as HomeIcon } from "@mui/icons-material";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export const HomeItem = () => {
    return <>
        <ListItem button component={RouterLink} to="/">
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
        </ListItem>
    </>;
};