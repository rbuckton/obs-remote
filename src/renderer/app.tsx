import "typeface-roboto";
import "source-map-support/register";
import React from "react";
import * as ReactDOM from "react-dom";
import { MemoryRouter, Switch, Route } from "react-router-dom";
import { Button, CssBaseline, List, SwipeableDrawer, ThemeProvider } from "@material-ui/core";
import { AppContext, createAppContext } from "./ui/utils/context";
import { Dashboard } from "./ui/dashboard";
import { Connect } from "./ui/connect";
import { CssScrollbarWidth } from "./ui/components/cssScrollbarWidth";
import { ConnectionStateItem, HomeItem } from "./ui/navigation";
import { Home } from "./ui/home";
import { SharedPreferencesService } from "./preferences/shared";
import { PreferencesService } from "./preferences";

interface AppProps {
    preferences: PreferencesService;
}

const App = ({ preferences }: AppProps) => {
    // state
    const context = createAppContext({ preferences });
    // behavior
    // effects
    // ui
    return <>
        <AppContext.Provider value={context}>
            <ThemeProvider theme={context.theme}>
                <CssBaseline />
                <CssScrollbarWidth />
                <MemoryRouter initialEntries={["/"]} initialIndex={0}>
                    <SwipeableDrawer anchor="left" open={context.appDrawerOpen} onOpen={context.openAppDrawer} onClose={context.closeAppDrawer}>
                        <List component="nav">
                            <HomeItem />
                            <ConnectionStateItem />
                        </List>
                    </SwipeableDrawer>
                    <Switch>
                        <Route path="/connect" exact><Connect /></Route>
                        <Route path="/autoConnect" exact><Connect auto /></Route>
                        <Route path="/dashboard" exact><Dashboard /></Route>
                        <Route path="/"><Home /></Route>
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
App.displayName = "App";

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