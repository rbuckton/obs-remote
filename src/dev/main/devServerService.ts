import type { Server } from "http";
import { app } from "electron";
import { ServiceIdentifier } from "service-composition";
import { MainOnly } from "../../core/main/decorators";

/**
 * Service that provides a local web server for serving static content for development purposes. 
 * Not used when the application is packaged. This service is designed to only be run from the electron Main thread.
 */
export const IMainDevServerService = ServiceIdentifier.create<IMainDevServerService>("IMainDevServerService");

/**
 * Service that provides a local web server for serving static content for development purposes. 
 * Not used when the application is packaged. This service is designed to only be run from the electron Main thread.
 */
export interface IMainDevServerService {
    /** Gets a value indicating whether the development server is started. */
    readonly started: boolean;
    /** Gets the connection information for the development server. */
    readonly serverInfo: DevServer | undefined;
    /** Tries to start the local development server, returning connection information if successful. */
    tryStart(): Promise<DevServer | undefined>;
    /** Stops the local development server if it has already been started. */
    stop(): void;
}

/**
 * Connection information for the local development server.
 */
export interface DevServer {
    readonly server: Server;
    readonly port: number;
}

/**
 * Service that provides a local web server for serving static content for development purposes. 
 * Not used when the application is packaged. This service is designed to only be run from the electron Main thread.
 */
@MainOnly
export class MainDevServerService implements IMainDevServerService {
    private _serverInfo: DevServer | undefined;

    get started() { return this._serverInfo !== undefined; }
    get serverInfo() { return this._serverInfo; }

    async tryStart(): Promise<DevServer | undefined> {
        if (!app.isPackaged && !this._serverInfo) {
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
                    this._serverInfo = { server, port: address.port };
                    console.log(`Development server started at: http://localhost:${this._serverInfo.port}`);
                }
            }
            catch (e) {
                // We failed to start the development server. Report an error but continue to run the app
                console.error(e);
                this._serverInfo = undefined;
            }
        }
        return this._serverInfo;
    }

    stop(): void {
        this._serverInfo?.server.close();
        this._serverInfo = undefined;
    }
}
