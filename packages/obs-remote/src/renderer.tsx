/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import "source-map-support/register";
import "@fontsource/roboto";
import { Button, CssBaseline, Divider, List, StyledEngineProvider, SwipeableDrawer, Theme, ThemeProvider } from "@mui/material";
import { styled } from "@mui/system";
import * as ReactDOM from "react-dom";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import { IServiceProvider, ServiceCollection } from "service-composition";
import { IAppService } from "./services/app/common/appService";
import { RendererAppService } from "./services/app/renderer/rendererAppService";
import { IPowerManagementService } from "./services/powerManagement/common/powerManagementService";
import { RendererPowerManagementService } from "./services/powerManagement/renderer/rendererPowerManagementService";
import { IPreferencesService } from "./services/preferences/common/preferencesService";
import { RendererPreferencesService } from "./services/preferences/renderer/rendererPreferencesService";
import { FullscreenMode } from "./ui/components/fullscreenMode";
import { appGlobalStyles } from "./ui/components/globalStyles";
import { Connect } from "./ui/connect";
import { Dashboard } from "./ui/dashboard";
import { Home } from "./ui/home";
import { ConnectionInfoItem, ConnectionStateItem, HomeItem } from "./ui/navigation";
import { AppContext, createAppContext, useAppContext } from "./ui/utils/appContext";
import { CompositionContext, createCompositionContext } from "./ui/utils/compositionContext";

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const NavList = styled("nav")({
    minWidth: "250px",
});

const App = () => {
    // state
    const appContext = useAppContext();

    // behavior
    // <none>
    
    // effects
    // <none>
    
    // ui
    return (
        <ThemeProvider theme={appContext.theme}>
            <CssBaseline />
            {appGlobalStyles}
            <FullscreenMode />
            <SwipeableDrawer anchor="left" open={appContext.appDrawerOpen} onOpen={appContext.openAppDrawer} onClose={appContext.closeAppDrawer}>
                <List component={NavList} subheader={<ConnectionInfoItem />}>
                    <Divider />
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
        </ThemeProvider>
    );
};

const AppWithContext = () => 
    <AppContext.Provider value={createAppContext()}>
        <StyledEngineProvider injectFirst>
            <App />
        </StyledEngineProvider>
    </AppContext.Provider>;

const AppWithServices = ({ serviceProvider }: { serviceProvider: IServiceProvider }) => 
    <MemoryRouter initialEntries={["/"]} initialIndex={0}>
        <CompositionContext.Provider value={createCompositionContext({ serviceProvider })}>
            <AppWithContext />
        </CompositionContext.Provider>
    </MemoryRouter>;

async function main() {
    let appRoot: JSX.Element;
    try {
        const serviceProvider = new ServiceCollection()
            .addClass(IPreferencesService, RendererPreferencesService)
            .addClass(IPowerManagementService, RendererPowerManagementService)
            .addClass(IAppService, RendererAppService)
            .createContainer();

        appRoot = <AppWithServices serviceProvider={serviceProvider} />;
    }
    catch (e) {
        console.error(e);
        appRoot = <div><pre>{e instanceof Error ? e.stack : `${e}`}</pre></div>;
    }

    ReactDOM.render(appRoot, document.getElementById("app"));
}

main();