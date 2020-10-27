import "typeface-roboto";
import * as ReactDOM from "react-dom";
import React, { useContext, useEffect, useState } from "react";
import { MemoryRouter, Switch, Route, Link as RouterLink, Redirect, useHistory } from "react-router-dom";
import { Button, CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemIcon, ListItemText, SwipeableDrawer, ThemeProvider } from "@material-ui/core";
import { Home as HomeIcon, ExitToApp as DisconnectIcon } from "@material-ui/icons";
import { AppContext, createAppContext } from "./ui/utils/context";
import { Dashboard } from "./ui/dashboard";
import { Connect } from "./ui/connect";
import { PreferencesService } from "./preferences";
import { SharedPreferencesService } from "./preferences/shared";
import { NullObsWebSocket } from "./obs";

const enum DisconnectState {
    Connected,
    DisconnectRequested,
    Disconnected
}

const DisconnectItem = () => {
    // state
    const context = useContext(AppContext);
    const { obs } = context;
    const history = useHistory();
    const [state, setState] = useState(() => context.obs.connected ? DisconnectState.Connected : DisconnectState.Disconnected);
    const requested = state === DisconnectState.DisconnectRequested;
    const connected = requested || state === DisconnectState.Connected;

    // behavior
    const onRequestDisconnect = () => {
        context.closeAppDrawer();
        setState(DisconnectState.DisconnectRequested);
    };

    const onConfirmDisconnect = () => {
        context.preferences.autoConnect.value = false;
        context.setConnection(NullObsWebSocket.instance);
        context.closeAppDrawer();
        history.push("/connect");
        setState(DisconnectState.Disconnected);
    };

    const onCancelDisconnect = () => {
        setState(() => context.obs.connected ? DisconnectState.Connected : DisconnectState.Disconnected)
    };

    const onDisconnected = () => {
        setState(DisconnectState.Disconnected);
    };
    
    const onConnected = () => {
        setState(DisconnectState.Connected);
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
            aria-labelledby="alert-disconnect-title"
            aria-describedby="alert-disconnect-description">
            <DialogTitle id="alert-disconnect-title">Disconnect from OBS</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-disconnect-description">
                    This will disconnect you from OBS. Are you sure?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onConfirmDisconnect} variant="contained" color="primary" autoFocus>Yes</Button>
                <Button onClick={onCancelDisconnect} variant="contained" color="secondary">No</Button>
            </DialogActions>
        </Dialog>
    </>;
};

interface AppProps {
    preferences: PreferencesService;
}

const App = ({ preferences }: AppProps) => {
    const context = createAppContext({ preferences });

    useEffect(() => {
        document.documentElement.style.setProperty('--scrollbar-width', (window.innerWidth - document.documentElement.clientWidth) + "px");
    }, []);

    return <>
        <AppContext.Provider value={context}>
            <ThemeProvider theme={context.theme}>
                <CssBaseline />
                <MemoryRouter initialEntries={["/"]} initialIndex={0}>
                    <SwipeableDrawer anchor="left" open={context.appDrawerOpen} onOpen={context.openAppDrawer} onClose={context.closeAppDrawer}>
                        <List component="nav">
                            <ListItem button component={RouterLink} to="/">
                                <ListItemIcon><HomeIcon /></ListItemIcon>
                                <ListItemText>Home</ListItemText>
                            </ListItem>
                            <DisconnectItem />
                        </List>
                    </SwipeableDrawer>
                    <Switch>
                        <Route path="/connect" exact><Connect /></Route>
                        <Route path="/autoConnect" exact><Connect auto /></Route>
                        <Route path="/dashboard" exact><Dashboard /></Route>
                        <Route path="/">{
                            context.obs.connected ? <Redirect to="/dashboard" /> :
                            context.preferences.autoConnect.value ? <Redirect to="/autoConnect" /> :
                            <Redirect to="/connect" />
                        }</Route>
                        <Route path="*">{({ history }) =>
                            <div>
                                <p>Unrecognized route!</p>
                                <Button onClick={() => history.goBack()}>Go back</Button> |
                                <Button onClick={() => history.push("/dashboard")}>Go home</Button>
                            </div>
                        }</Route>
                    </Switch>
                </MemoryRouter>
            </ThemeProvider>
        </AppContext.Provider>
    </>;
};

async function main() {
    let appRoot: JSX.Element;
    try {
        const sharedPreferences = new SharedPreferencesService();
        const preferences = new PreferencesService(sharedPreferences);
        appRoot = <App preferences={preferences} />;
    }
    catch (e) {
        console.error(e);
        appRoot = <div><pre>{e.stack}</pre></div>;
    }
    ReactDOM.render(appRoot, document.getElementById("app"));
}

main();