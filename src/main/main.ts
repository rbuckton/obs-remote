import "source-map-support/register";
import { app, BrowserView, BrowserWindow, session } from "electron";

async function main() {
    try {
        await app.whenReady();

        const mainWindow = new BrowserWindow({
            show: false,
            width: 800,
            height: 600,
            fullscreenable: true,
            maximizable: true,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });

        await mainWindow.webContents.loadFile("./assets/index.html");
        mainWindow.show();

        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit();
            }
        });
    }
    catch (e) {
        console.error(e);
        app.quit();
    }
}

main();