/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { app, Session } from 'electron';
import { Comparer } from "@esfx/equatable";
import { ServiceIdentifier } from "service-composition";
import { MainOnly } from "../../core/main/decorators";

const REACT_DEVTOOLS_EXTENSION = "fmkadmapgofadopljbjfkapdkoienihi";

/**
 * Installs the React developer tools extensions into the electron Main process, if available.
 * This service is designed to only be run from the electron Main thread.
 */
export const IMainDevToolsService = ServiceIdentifier.create<IMainDevToolsService>("IMainDevToolsService");

/**
 * Installs the React developer tools extensions into the electron Main process, if available.
 * This service is designed to only be run from the electron Main thread.
 */
export interface IMainDevToolsService {
    /**
     * Installs the React developer tools into the provided session.
     */
    install(session: Session): Promise<void>;
}

/**
 * Installs the React developer tools extensions into the electron Main process, if available.
 * This service is designed to only be run from the electron Main thread.
 */
@MainOnly
export class MainDevToolsService implements IMainDevToolsService {
    _sessions = new WeakMap<Session, Promise<void>>();

    /**
     * Installs the React developer tools into the provided session.
     */
    async install(session: Session): Promise<void> {
        let promise = this._sessions.get(session);
        if (!promise) this._sessions.set(session, promise = this._installDevtoolsExtensions(session));
        await promise;
    }

    private _parseVersion(versionText: string) {
        const match = /^(\d+)\.(\d+)\.(\d+)(?:_(\d+))?$/.exec(versionText);
        if (!match) return undefined;
        return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10), match[4] ? parseInt(match[4], 10) : 0] as const;
    }
    
    private _getDevtoolsExtensionBasePath(id: string) {
        const tryPath = (file: string) => fs.existsSync(file) ? file : undefined;
        switch (process.platform) {
            case "win32":
                if (process.env.LOCALAPPDATA) {
                    return tryPath(path.join(process.env.LOCALAPPDATA, "Google/Chrome/User Data/Default/Extensions", id))
                        || tryPath(path.join(process.env.LOCALAPPDATA, "Microsoft/Edge/Chrome/User Data/Default/Extensions", id));
                }
                break;
            case "darwin":
                return tryPath(path.join(os.homedir(), "Library/Application Support/Google/Chrome/Default/Extensions", id));
            default:
                return tryPath(path.join(os.homedir(), ".config/google-chrome/Default/Extensions/", id));
        }
    }
    
    private _getDevtoolsExtensionPath(id: string) {
        const extensionPath = this._getDevtoolsExtensionBasePath(id);
        if (extensionPath) {
            try {
                let latestVersionName: string | undefined;
                let latestVersion: readonly [number, number, number, number] | undefined;
                for (const entry of fs.readdirSync(extensionPath, { withFileTypes: true })) {
                    if (!entry.isDirectory()) continue;
                    const version = this._parseVersion(entry.name);
                    if (!version) continue;
                    if (!latestVersion || Comparer.tupleComparer.compare(version, latestVersion) > 0) {
                        latestVersion = version;
                        latestVersionName = entry.name;
                    }
                }
                if (latestVersionName) {
                    return path.join(extensionPath, latestVersionName);
                }
            }
            catch {
                return undefined;
            }
        }
    }
    
    private async _installDevtoolsExtension(id: string, session: Session) {
        await app.whenReady();
        const extensions = session.getAllExtensions();
        const devtoolsExtensionPath = this._getDevtoolsExtensionPath(id);
        if (devtoolsExtensionPath) {
            try {
                const manifest = JSON.parse(fs.readFileSync(path.join(devtoolsExtensionPath, "manifest.json"), "utf8"));
                const manifestVersion = this._parseVersion(manifest.version)!;
                const extension = extensions.find(ext => ext.id === manifest.name);
                if (extension) {
                    const extensionVersion = this._parseVersion(extension.version);
                    if (extensionVersion) {
                        if (Comparer.tupleComparer.compare(extensionVersion, manifestVersion) >= 0) {
                            return;
                        }
                        session.removeExtension(extension.name);
                    }
                }
                await session.loadExtension(devtoolsExtensionPath);
            }
            catch (e) {
                console.error(e);
            }
        }
    }

    private async _installDevtoolsExtensions(session: Session): Promise<void> {
        try {
            await this._installDevtoolsExtension(REACT_DEVTOOLS_EXTENSION, session);
        }
        catch (e) {
            this._sessions.delete(session);
            throw e;
        }
    }
}
