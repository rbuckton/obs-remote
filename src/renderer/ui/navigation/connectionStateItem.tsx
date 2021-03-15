import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { ExitToApp as DisconnectIcon } from "@material-ui/icons";
import { AppContext } from "../utils/context";
import { NullObsWebSocket } from "../../obs";

const enum ConnectionState {
    Connected,
    DisconnectRequested,
    Disconnected
}

export const ConnectionStateItem = () => {
    // state
    const history = useHistory();
    const context = useContext(AppContext);
    const { obs } = context;
    const [state, setState] = useState(() => obs.connected ? ConnectionState.Connected : ConnectionState.Disconnected);
    const requested = state === ConnectionState.DisconnectRequested;
    const connected = requested || state === ConnectionState.Connected;

    // behavior
    const onRequestDisconnect = () => {
        setState(ConnectionState.DisconnectRequested);
    };

    const onConfirmDisconnect = () => {
        context.closeAppDrawer();
        context.preferences.autoConnect.value = false;
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
    useEffect(() => {
        obs.on("ConnectionOpened", onConnected);
        obs.on("ConnectionClosed", onDisconnected);
        obs.on("Exiting", onDisconnected);
        return () => {
            obs.off("ConnectionOpened", onConnected);
            obs.off("ConnectionClosed", onDisconnected);
            obs.off("Exiting", onDisconnected);
        };
    }, [obs]);

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