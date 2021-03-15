import "source-map-support/register";
import type { Server } from "http";
import { app, session, BrowserWindow } from "electron";
import { installDevtoolsExtensions } from "./utils/devtools";

interface DevServer {
    server: Server;
    port: number;
}

let devServer: DevServer | undefined;

/**
 * For local development and debugging purposes, start a local HTTP server to
 * serve render-thread assets to better work with extensions like the react
 * developer tools.
 */
async function tryStartDevServer() {
    if (!app.isPackaged && !devServer) {
        try {
            const { default: serveStatic } = await import("serve-static");
            const { createServer } = await import("http");
            const serve = serveStatic(app.getAppPath(), { index: false, dotfiles: "ignore", fallthrough: false });
            const server = createServer((req, res) => serve(req, res, () => {
                res.statusCode = 404;
                res.statusMessage = "NOT FOUND";
                res.end();
            }));

            await new Promise<void>((resolve, reject) => {
                server.listen(undefined, "127.0.0.1")
                    .once("listening", resolve)
                    .once("error", reject);
            });

            const address = server.address();
            if (typeof address === "object" && address) {
                devServer = {
                    server,
                    port: address.port
                };
                console.log(`Development server started at: http://localhost:${devServer.port}`);
            }
        }
        catch (e) {
            // We faild to start the development server. Report an error but continue to run the app
            console.error(e);
            devServer = undefined;
        }
    }
    return devServer;
}

async function main() {
    try {
        const ses = session.defaultSession; 
        const mainWindow = new BrowserWindow({
            show: false,
            width: 800,
            height: 600,
            fullscreenable: true,
            maximizable: true,
            autoHideMenuBar: true,
            webPreferences: {
                session: ses,
                worldSafeExecuteJavaScript: true,
                // TODO: improve security and disable these
                nodeIntegration: true,
                enableRemoteModule: true,
            }
        });

        const devServer = await tryStartDevServer();
        if (devServer) {
            await installDevtoolsExtensions(ses);
            await mainWindow.webContents.loadURL(`http://localhost:${devServer.port}/assets/index.html`);
        }
        else {
            await mainWindow.webContents.loadFile("./assets/index.html");
        }

        mainWindow.on("ready-to-show", () => mainWindow.show());
    }
    catch (e) {
        console.error(e);
        app.quit();
    }
}

app.on("ready", main);
app.on("window-all-closed", () => { app.quit(); });
