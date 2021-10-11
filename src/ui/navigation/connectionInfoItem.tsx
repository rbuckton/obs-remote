/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ListSubheader, Typography } from "@mui/material";
import { IAppInfoService } from "../../app/common/appInfoService";
import { useService } from "../hooks/useService";
import { useAppContext } from "../utils/appContext";

export const ConnectionInfoItem = () => {
    const { connected, obs, version: obsVersion } = useAppContext();
    const { version: appVersion } = useService(IAppInfoService);

    return (
        <ListSubheader sx={{ bgcolor: "info.main", color: "info.contrastText", pt: "8px", pb: "8px", display: "block" }}>
            <Typography variant="caption" sx={{ display: "block", fontWeight: "bold" }}>obs remote control</Typography>
            <Typography variant="body2" sx={{ display: "block", mb: 1 }} noWrap>{`v${appVersion}`}</Typography>
            
            <Typography variant="caption" sx={{ display: "block", fontWeight: "bold" }}>obs websocket</Typography>
            <Typography variant="body2" sx={{ display: "block", mb: 1 }} noWrap>{obsVersion ? `v${obsVersion}` : "..."}</Typography>
            
            <Typography variant="caption" sx={{ display: "block", fontWeight: "bold" }}>host</Typography>
            <Typography variant="body2">{connected ? obs.address : "..."}</Typography>
        </ListSubheader>
    );
};