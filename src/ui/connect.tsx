/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Brightness4 as DarkThemeIcon, Brightness7 as LightThemeIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon, LockOutlined as LockOutlinedIcon } from "@mui/icons-material";
import {
    Avatar,
    Button,
    Checkbox,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    TextField, Typography
} from "@mui/material";
import { styled } from "@mui/system";
import React, { useCallback, useState } from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { IAppService } from "../app/common/appService";
import { NullObsWebSocket, ObsWebSocket } from "../obs/renderer";
import { createDefaultFakeObsWebSocket } from "../obs/renderer/fakeObsWebSocket";
import { AppBar } from "./components/appBar";
import { useAsyncCallback } from "./hooks/useAsyncCallback";
import { useAsyncEffect } from "./hooks/useAsyncEffect";
import { usePreferenceEditor } from "./hooks/usePreference";
import { useService } from "./hooks/useService";
import { DarkTheme, LightTheme } from "./themes";
import { useAppContext } from "./utils/appContext";
import { generateUtilityClasses } from "./utils/mui";
import { NavigationProps } from "./utils/withNavigation";

const classes = generateUtilityClasses("Connect", ["form", "title", "avatar", "submit"]);

const Form = styled("form")(({ theme }) => ({
    [`&.${classes.form}`]: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        alignItems: 'center',
        width: '100%',
    },
    [`& .${classes.title}`]: {
        marginBottom: theme.spacing(1)
    },
    [`& .${classes.avatar}`]: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main
    },
    [`& .${classes.submit}`]: {
        margin: theme.spacing(2, 0, 2)
    },
}));

const enum ConnectionState {
    Disconnected,
    AutoConnectRequested,
    Connecting,
    Connected
}

export interface ConnectProps extends NavigationProps<{ error?: string }> {
    auto?: boolean;
}

export const Connect = ({
    params: { error } = useParams()!,
    history = useHistory(),
    auto,
}: ConnectProps) => {
    // state
    const {
        theme, setTheme,
        fullscreen, setFullscreen,
        setConnection
    } = useAppContext();
    const app = useService(IAppService);
    const [hostname, setHostname, commitHostname] = usePreferenceEditor("hostname");
    const [port, setPort, commitPort] = usePreferenceEditor("port");
    const [rememberAuthKey, setRememberAuthKey, commitRememberAuthKey] = usePreferenceEditor("rememberAuthKey");
    const [authKey, setAuthKey, commitAuthKey] = usePreferenceEditor("authKey");
    const [autoConnect, setAutoConnect, commitAutoConnect] = usePreferenceEditor("autoConnect");
    const [state, setState] = useState(() => auto ? ConnectionState.AutoConnectRequested : ConnectionState.Disconnected);
    const [errorMessage, setErrorMessage] = useState(() => error);

    // behavior
    const toggleTheme = useCallback(() => {
        setTheme(theme === LightTheme ? DarkTheme : LightTheme);
    }, [theme]);
    
    const toggleFullscreen = useCallback(() => {
        setFullscreen(!fullscreen);
    }, [fullscreen]);

    const validate = useCallback(() => {
        if (!hostname) return setErrorMessage("Hostname required."), false;
        if (!port) return setErrorMessage("Port required."), false;
        return true;
    }, [hostname, port]);

    /**
     * Updates state when a form field changes.
     */
    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        switch (event.target.name) {
            case "hostname": return setHostname(event.target.value);
            case "port": return setPort(event.target.valueAsNumber);
            case "rememberAuthKey": return setRememberAuthKey(event.target.checked);
            case "authKey": return setAuthKey(event.target.value);
            case "autoConnect": return setAutoConnect(event.target.checked);
        }
    }, []);

    /**
     * Connect to the remote OBS instance. 
     */
    const doConnect = useAsyncCallback(async token => {
        try {
            if (state >= ConnectionState.Connecting) return;
            if (!validate()) return;
            setState(ConnectionState.Connecting);
            setErrorMessage(undefined);

            const obs = new ObsWebSocket();
            await obs.connect({ address: `${hostname}:${port}`, password: authKey });
            if (token.signaled) {
                // The component was unmounted before this operation
                // could complete. Disconnect the now unused OBS
                // connection.
                obs.disconnect();
                return;
            }

            commitHostname();
            commitPort();
            commitRememberAuthKey();
            commitAuthKey();
            commitAutoConnect();
            setConnection(obs);
            setErrorMessage(undefined);
            setState(ConnectionState.Connected);
        }
        catch (e) {
            setConnection(NullObsWebSocket.instance);
            setErrorMessage(e instanceof Error ? e.message : `${e}`);
            setState(ConnectionState.Disconnected);
        }
    }, [state, hostname, port, authKey, validate]);

    /**
     * Connect to a fake OBS instance for demo/test purposes
     */
    const doDemo = useAsyncCallback(async token => {
        try {
            if (state >= ConnectionState.Connecting) return;
            setState(ConnectionState.Connecting);
            setErrorMessage(undefined);

            const obs = createDefaultFakeObsWebSocket(app);
            await obs.connect({ address: `demo:4444` });
            if (token.signaled) {
                // The component was unmounted before this operation
                // could complete. Disconnect the now unused OBS
                // connection.
                obs.disconnect();
                return;
            }

            commitHostname();
            commitPort();
            commitRememberAuthKey();
            commitAuthKey();
            commitAutoConnect(false);
            setConnection(obs);
            setErrorMessage(undefined);
            setState(ConnectionState.Connected);
        }
        catch (e) {
            setConnection(NullObsWebSocket.instance);
            setErrorMessage(e instanceof Error ? e.message : `${e}`);
            setState(ConnectionState.Disconnected);
        }
    }, [state, createDefaultFakeObsWebSocket, app]);

    const onDialogClose = useCallback(() => {
        if (history.length > 1) {
            history.goBack();
        }
        else {
            window.close();
        }
    }, [history, window]);

    // effects

    // Start auto-connection if this is the first mount of the component
    useAsyncEffect(async (token) => {
        if (state === ConnectionState.AutoConnectRequested) {
            await doConnect.cancelable(token);
        }
    }, [state, doConnect]);

    // ui
    return state === ConnectionState.Connected ?
        <Redirect to="/dashboard" /> :
        <Dialog
            fullScreen
            open
            onClose={onDialogClose}
            aria-describedby="connect-dialog-description">
            <DialogContent sx={{ padding: 0 }}>
                <AppBar primary="" elevation={0} variant="dialog" color="transparent">
                    <IconButton onClick={toggleTheme} title="Toggle light/dark theme">
                        {theme === LightTheme ? <DarkThemeIcon /> : <LightThemeIcon />}
                    </IconButton>
                    <IconButton edge="end" onClick={toggleFullscreen} title="Toggle Fullscreen">
                        {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                </AppBar>
                <Container component="main" maxWidth="xs">
                    <Form noValidate autoComplete="off" className={classes.form}>
                        <Avatar className={classes.avatar}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography id="connect-dialog-description" component={"h1"} variant="h5" className={classes.title}>
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
                                        id="rememberAuthKey"
                                        name="rememberAuthKey"
                                        color="primary"
                                        checked={rememberAuthKey}
                                        onChange={onChange}
                                        disabled={state >= ConnectionState.AutoConnectRequested}
                                        />}
                                    label="Remember Auth Key"
                                    disabled={state >= ConnectionState.AutoConnectRequested}
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
                                    onClick={doConnect}>
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
                                    onClick={doDemo}>
                                    Demo
                                </Button>
                            </Grid>
                        </Grid>
                        {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
                        {state >= ConnectionState.AutoConnectRequested && <CircularProgress size="24" />}
                    </Form>
                </Container>
            </DialogContent>
        </Dialog>;
};