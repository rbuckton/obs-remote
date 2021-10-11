/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { ExitToApp as DisconnectIcon } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { NullObsWebSocket } from "../../obs/renderer";
import { useEvent } from "../hooks/useEvent";
import { useAppContext } from "../utils/appContext";

const enum ConnectionState {
    Connected,
    DisconnectRequested,
    Disconnected
}

export const ConnectionStateItem = () => {
    // state
    const history = useHistory();
    const context = useAppContext();
    const { obs } = context;
    const [state, setState] = useState(() => context.obs.connected ? ConnectionState.Connected : ConnectionState.Disconnected);
    const requested = state === ConnectionState.DisconnectRequested;
    const connected = requested || state === ConnectionState.Connected;

    // behavior
    const onRequestDisconnect = () => {
        setState(ConnectionState.DisconnectRequested);
    };

    const onConfirmDisconnect = () => {
        context.closeAppDrawer();
        context.preferences.autoConnect = false;
        context.setConnection(NullObsWebSocket.instance);
        history.push("/connect");
        setState(ConnectionState.Disconnected);
    };

    const onCancelDisconnect = () => {
        setState(() => context.obs.connected ? ConnectionState.Connected : ConnectionState.Disconnected)
        context.closeAppDrawer();
    };

    const onDisconnected = () => {
        setState(ConnectionState.Disconnected);
    };
    
    const onConnected = () => {
        setState(ConnectionState.Connected);
    };

    // effects
    useEvent(obs, "ConnectionOpened", onConnected);
    useEvent(obs, "ConnectionClosed", onDisconnected);
    useEvent(obs, "Exiting", onDisconnected);

    // ui
    return <>
        {connected &&
            <ListItem button onClick={onRequestDisconnect}>
                <ListItemIcon><DisconnectIcon /></ListItemIcon>
                <ListItemText>Disconnect</ListItemText>
            </ListItem>
        }
        <Dialog open={requested} onClose={onCancelDisconnect}
            aria-labelledby="disconnect-dialog-title"
            aria-describedby="disconnect-dialog-description">
            <DialogTitle id="disconnect-dialog-title">Disconnect from OBS</DialogTitle>
            <DialogContent>
                <DialogContentText id="disconnect-dialog-description">
                    This will disconnect you from OBS. Are you sure?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onConfirmDisconnect} variant="contained" color="primary" autoFocus aria-label="yes">Yes</Button>
                <Button onClick={onCancelDisconnect} variant="contained" color="secondary" aria-label="no">No</Button>
            </DialogActions>
        </Dialog>
    </>;
};