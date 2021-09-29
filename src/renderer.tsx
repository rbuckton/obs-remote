import "source-map-support/register";
import "typeface-roboto";
import { Button, CssBaseline, List, SwipeableDrawer, ThemeProvider } from "@material-ui/core";
import React from "react";
import * as ReactDOM from "react-dom";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import { IServiceProvider, ServiceCollection } from "service-composition";
import { IPreferencesService } from "./preferences/common/preferencesService";
import { RendererPreferencesService } from "./preferences/renderer/rendererPreferencesService";
import { CssScrollbarWidth } from "./ui/components/cssScrollbarWidth";
import { Connect } from "./ui/connect";
import { Dashboard } from "./ui/dashboard";
import { Home } from "./ui/home";
import { ConnectionStateItem, HomeItem } from "./ui/navigation";
import { AppContext, createAppContext } from "./ui/utils/context";

interface AppProps {
    serviceProvider: IServiceProvider;
}

const App = ({ serviceProvider }: AppProps) => {
    // state
    const context = createAppContext({ serviceProvider });
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
        const serviceProvider = new ServiceCollection()
            .addClass(IPreferencesService, RendererPreferencesService)
            .createContainer();
        appRoot = <App serviceProvider={serviceProvider} />;
    }
    catch (e) {
        console.error(e);
        appRoot = <div><pre>{e.stack}</pre></div>;
    }

    ReactDOM.render(appRoot, document.getElementById("app"));
}

main();