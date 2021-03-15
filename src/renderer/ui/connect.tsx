import React, { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { Avatar, Button, Checkbox, CircularProgress, Container, createStyles, Dialog, DialogContent, FormControlLabel, FormHelperText, Grid, TextField, Typography, Theme, WithStyles, withStyles, StyledComponentProps } from "@material-ui/core";
import { LockOutlined as LockOutlinedIcon } from "@material-ui/icons";
import { CancelToken } from "@esfx/async-canceltoken";
import { NullObsWebSocket, ObsWebSocket } from "../obs";
import { createDefaultFakeObsWebSocket } from "../fakes/fakeObsWebSocket";
import { AppContext } from "./utils/context";
import { useAsyncEffect } from "./utils/useAsync";
import { WithNavigation, withNavigation, WithNavigationProps } from "./utils/withNavigation";
import { ClassKeyOfStyles } from "@material-ui/styles";

const styles = (theme: Theme) => createStyles({
    form: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        marginBottom: theme.spacing(1)
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main
    },
    submit: {
        margin: theme.spacing(2, 0, 2)
    }
});

const enum ConnectionState {
    Disconnected,
    AutoConnectRequested,
    Connecting,
    Connected
}

export interface ConnectProps extends
    StyledComponentProps<ClassKeyOfStyles<typeof styles>>,
    WithNavigationProps<{ error?: string }> {
    auto?: boolean;
}

type _ConnectProps = 
    & ConnectProps
    & WithStyles<typeof styles>
    & WithNavigation<{ error?: string }>;

export const Connect = 
    (withStyles(styles, { name: "Connect" })
    (withNavigation()
    (({
        classes,
        params: { error },
        history,
        auto,
    }: _ConnectProps) => {
        // state
        const { preferences, setConnection } = useContext(AppContext);
        const [hostname, setHostname] = useState(() => preferences.hostname.value);
        const [port, setPort] = useState(() => preferences.port.value || 4444);
        const [authKey, setAuthKey] = useState(() => preferences.authKey.value);
        const [autoConnect, setAutoConnect] = useState(() => preferences.autoConnect.value);
        const [state, setState] = useState(() => auto ? ConnectionState.AutoConnectRequested : ConnectionState.Disconnected);
        const [errorMessage, setErrorMessage] = useState(() => error);

        // behavior

        const validate = () => {
            if (!hostname) return setErrorMessage("Hostname required."), false;
            if (!port) return setErrorMessage("Port required."), false;
            return true;
        }

        /**
         * Updates state when a form field changes.
         */
        const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            switch (event.target.name) {
                case "hostname": return setHostname(event.target.value);
                case "port": return setPort(event.target.valueAsNumber);
                case "authKey": return setAuthKey(event.target.value);
                case "autoConnect": return setAutoConnect(event.target.checked);
            }
        };

        /**
         * Connect to the remote OBS instance. 
         */
        const doConnect = async (token?: CancelToken) => {
            try {
                if (state >= ConnectionState.Connecting) return;
                if (!validate()) return;
                setState(ConnectionState.Connecting);
                setErrorMessage(undefined);

                const obs = new ObsWebSocket();
                await obs.connect({ address: `${hostname}:${port}`, password: authKey });
                if (token?.signaled) {
                    // The component was unmounted before this operation
                    // could complete. Disconnect the now unused OBS
                    // connection.
                    obs.disconnect();
                    return;
                }

                preferences.hostname.value = hostname;
                preferences.port.value = port;
                preferences.authKey.value = authKey;
                preferences.autoConnect.value = autoConnect;
                setConnection(obs);
                setState(ConnectionState.Connected);
                setErrorMessage(undefined);
            }
            catch (e) {
                setConnection(NullObsWebSocket.instance);
                setState(ConnectionState.Disconnected);
                setErrorMessage(e.message);
            }
        };

        /**
         * Connect to a fake OBS instance for demo/test purposes
         */
        const doDemo = async (token?: CancelToken) => {
            try {
                if (state >= ConnectionState.Connecting) return;
                setState(ConnectionState.Connecting);
                setErrorMessage(undefined);

                const obs = createDefaultFakeObsWebSocket();
                await obs.connect({ address: `demo:4444` });
                if (token?.signaled) {
                    // The component was unmounted before this operation
                    // could complete. Disconnect the now unused OBS
                    // connection.
                    obs.disconnect();
                    return;
                }

                preferences.hostname.value = hostname;
                preferences.port.value = port;
                preferences.authKey.value = authKey;
                preferences.autoConnect.value = false;
                setConnection(obs);
                setState(ConnectionState.Connected);
                setErrorMessage(undefined);
            }
            catch (e) {
                setConnection(NullObsWebSocket.instance);
                setState(ConnectionState.Disconnected);
                setErrorMessage(e.message);
            }
        };

        const onDialogClose = () => {
            if (history.length > 1) {
                history.goBack();
            }
            else {
                window.close();
            }
        };

        // effects

        // Track when user preferences have changed
        useEffect(() => {
            preferences.hostname.onDidValueChange.on(setHostname);
            preferences.port.onDidValueChange.on(setPort);
            preferences.authKey.onDidValueChange.on(setAuthKey);
            preferences.autoConnect.onDidValueChange.on(setAutoConnect);
            return () => {
                preferences.hostname.onDidValueChange.off(setHostname);
                preferences.port.onDidValueChange.off(setPort);
                preferences.authKey.onDidValueChange.off(setAuthKey);
                preferences.autoConnect.onDidValueChange.off(setAutoConnect);
            };
        }, [preferences]);

        // Start auto-connection if this is the first mount of the component
        useAsyncEffect(async (token) => {
            if (state === ConnectionState.AutoConnectRequested) {
                await doConnect(token);
            }
        }, []);

        // ui
        return state === ConnectionState.Connected ?
            <Redirect to="/dashboard" /> :
            <Dialog
                fullScreen
                open
                onClose={onDialogClose}
                aria-describedby="connect-dialog-description">
                <DialogContent>
                    <Container component="main" maxWidth="xs">
                        <form className={classes.form} noValidate autoComplete="off">
                            <Avatar className={classes.avatar}>
                                <LockOutlinedIcon />
                            </Avatar>
                            <Typography id="connect-dialog-description" className={classes.title} component="h1" variant="h5">
                                Connect to OBS Studio
                            </Typography>
                            <Grid container direction="row" spacing={1}>
                                <Grid item container xs={9}>
                                    <TextField
                                        id="hostname"
                                        name="hostname"
                                        autoComplete="hostname"
                                        variant="filled"
                                        type="text"
                                        label="Hostname"
                                        required
                                        autoFocus
                                        fullWidth
                                        disabled={state >= ConnectionState.AutoConnectRequested}
                                        placeholder="(e.g., localhost)"
                                        value={hostname}
                                        onChange={onChange}
                                        inputProps={{ pattern: "^[\\w_-][\\w\\d_-]*(?:\\.[\\w_-][\\w\\d_-]*)*$" }}
                                        />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        id="port"
                                        name="port"
                                        variant="filled"
                                        type="number"
                                        label="Port"
                                        required
                                        disabled={state >= ConnectionState.AutoConnectRequested}
                                        inputProps={{ min: 1, max: 9999 }}
                                        value={port}
                                        onChange={onChange}
                                        />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="authKey"
                                        name="authKey"
                                        variant="filled"
                                        type="password"
                                        label="Auth Key"
                                        fullWidth
                                        disabled={state >= ConnectionState.AutoConnectRequested}
                                        value={authKey}
                                        onChange={onChange}
                                        />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={<Checkbox
                                            id="autoConnect"
                                            name="autoConnect"
                                            color="primary"
                                            checked={autoConnect}
                                            onChange={onChange}
                                            disabled={state >= ConnectionState.AutoConnectRequested}
                                            />}
                                        label="Automatically Connect"
                                        disabled={state >= ConnectionState.AutoConnectRequested}
                                        />
                                </Grid>
                                <Grid item container xs={6}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        className={classes.submit}
                                        disabled={!hostname || !port || state >= ConnectionState.AutoConnectRequested}
                                        onClick={() => doConnect()}>
                                        Connect
                                    </Button>
                                </Grid>
                                <Grid item container xs={6}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        fullWidth
                                        className={classes.submit}
                                        disabled={state >= ConnectionState.AutoConnectRequested}
                                        onClick={() => doDemo()}>
                                        Demo
                                    </Button>
                                </Grid>
                            </Grid>
                            {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
                            {state >= ConnectionState.AutoConnectRequested && <CircularProgress size="24" />}
                        </form>
                    </Container>
                </DialogContent>
            </Dialog>;
    })));