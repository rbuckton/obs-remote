import { app, remote } from "electron";
import React, { useContext, useEffect, useState } from "react";
import { CancelToken } from "@esfx/async-canceltoken";
import { useHistory, useParams } from "react-router-dom";
import { Avatar, Button, Checkbox, CircularProgress, Container, createStyles, Dialog, FormControlLabel, FormGroup, FormHelperText, Grid, makeStyles, TextField, Typography } from "@material-ui/core";
import { AppContext } from "./utils/context";
import { AppBar } from "./components/appBar";
import { LockOutlined as LockOutlinedIcon } from "@material-ui/icons";
import { ObsWebSocket } from "../obs";
import { createDefaultFakeObsWebSocket } from "../fakes/fakeObsWebSocket";
import { useAsyncCallback, useAsyncEffect } from "./utils/useAsync";

const useStyles = makeStyles(theme => createStyles({
    // root: {
    //     margin: theme.spacing(2),
    //     "& .MuiTextField-root": {
    //         margin: theme.spacing(1),
    //         width: '25ch'
    //     }
    // },
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
}));

export interface ConnectProps {
    auto?: boolean;
}

export const Connect = ({
    auto
}: ConnectProps) => {
    // state
    const classes = useStyles();
    const history = useHistory();
    const context = useContext(AppContext);
    const { error } = useParams<{ auto?: string, error?: string }>();
    const [formState, setFormState] = useState(() => ({
        hostname: context.preferences.hostname.value,
        port: context.preferences.port.value || 4444,
        authKey: context.preferences.authKey.value,
        autoConnect: context.preferences.autoConnect.value,
        connectionStarted: false,
        connecting: auto,
        error
    }));

    // behavior
    const isValid = () => !!formState.hostname && !!formState.port;

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({
            ...formState,
            [event.target.name]:
                event.target.name === "port" ? event.target.valueAsNumber :
                event.target.name === "autoConnect" ? event.target.checked :
                event.target.value
        });
    };

    const onClickConnect = useAsyncCallback(async () => {
        await doConnect();
    });

    const onClickDemo = useAsyncCallback(async () => {
        await doDemo();
    });

    const doConnect = async (token?: CancelToken) => {
        try {
            if (!isValid() || formState.connectionStarted) return;
            const { hostname, port, authKey, autoConnect } = formState;
            setFormState({ ...formState, error: undefined, connecting: true, connectionStarted: true });
            const obs = new ObsWebSocket();
            await obs.connect({ address: `${hostname}:${port}`, password: authKey });
            if (token?.signaled) return;

            context.preferences.hostname.value = hostname;
            context.preferences.port.value = port;
            context.preferences.authKey.value = authKey;
            context.preferences.autoConnect.value = autoConnect;
            context.setConnection(obs);
            history.replace("/dashboard");
        }
        catch (e) {
            setFormState({ ...formState, error: e.message, connecting: false, connectionStarted: false });
        }
    };

    const doDemo = async (token?: CancelToken) => {
        if (formState.connectionStarted) return;
        const { hostname, port, authKey } = formState;
        setFormState({ ...formState, error: undefined, connecting: true, connectionStarted: true });
        const obs = createDefaultFakeObsWebSocket();
        await obs.connect({ address: `${hostname}:${port}`, password: authKey });
        if (token?.signaled) return;

        context.preferences.hostname.value = hostname;
        context.preferences.port.value = port;
        context.preferences.authKey.value = authKey;
        context.preferences.autoConnect.value = false;
        context.setConnection(obs);
        history.replace("/dashboard");
    };

    const onDialogClose = () => {
        if (history.length > 1) {
            history.goBack();
        }
        else {
            remote.app.exit();
        }
    };

    // effects
    useAsyncEffect(async (token) => {
        if (auto && context.preferences.autoConnect) {
            await doConnect(token);
        }
        // await doDemo(token);
    }, [auto]);

    // ui
    return <>
        <Dialog fullScreen open onClose={onDialogClose}>
            <AppBar variant="dialog" primary="Connect to OBS" onClose={onDialogClose} />
            <Container component="main" maxWidth="xs">
                <form className={classes.form} noValidate autoComplete="off">
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography className={classes.title} component="h1" variant="h5">
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
                                disabled={formState.connecting}
                                placeholder="(e.g., localhost)"
                                value={formState.hostname}
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
                                disabled={formState.connecting}
                                inputProps={{ min: 1, max: 9999 }}
                                value={formState.port}
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
                                disabled={formState.connecting}
                                value={formState.authKey}
                                onChange={onChange}
                                />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox
                                    id="autoConnect"
                                    name="autoConnect"
                                    color="primary"
                                    checked={formState.autoConnect}
                                    onChange={onChange}
                                    disabled={formState.connecting}
                                    />}
                                label="Automatically Connect"
                                disabled={formState.connecting}
                                />
                        </Grid>
                        <Grid item container xs={6}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                className={classes.submit}
                                disabled={!isValid() || formState.connecting}
                                onClick={onClickConnect}>
                                Connect
                            </Button>
                        </Grid>
                        <Grid item container xs={6}>
                            <Button
                                variant="contained"
                                color="secondary"
                                fullWidth
                                className={classes.submit}
                                disabled={formState.connecting}
                                onClick={onClickDemo}>
                                Demo
                            </Button>
                        </Grid>
                    </Grid>
                    {formState.error && <FormHelperText error>{formState.error}</FormHelperText>}
                    {formState.connecting && <CircularProgress size="24" />}
                </form>
            </Container>
        </Dialog>
    </>;
}