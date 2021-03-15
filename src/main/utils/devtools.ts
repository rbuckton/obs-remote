import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { app, Session, session as _session } from 'electron';
import { Comparer } from "@esfx/equatable";

const REACT_DEVTOOLS_EXTENSION = "fmkadmapgofadopljbjfkapdkoienihi";
const devToolsEnabledForSession = new WeakSet<Session>();

function parseVersion(versionText: string) {
    const match = /^(\d+)\.(\d+)\.(\d+)(?:_(\d+))?$/.exec(versionText);
    if (!match) return undefined;
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10), match[4] ? parseInt(match[4], 10) : 0] as const;
}

function getDevtoolsExtensionBasePath(id: string) {
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

function getDevtoolsExtensionPath(id: string) {
    const extensionPath = getDevtoolsExtensionBasePath(id);
    if (extensionPath) {
        try {
            let latestVersionName: string | undefined;
            let latestVersion: readonly [number, number, number, number] | undefined;
            for (const entry of fs.readdirSync(extensionPath, { withFileTypes: true })) {
                if (!entry.isDirectory()) continue;
                const version = parseVersion(entry.name);
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

async function installDevtoolsExtension(id: string, session: Session) {
    await app.whenReady();
    const extensions = session.getAllExtensions();
    const devtoolsExtensionPath = getDevtoolsExtensionPath(id);
    if (devtoolsExtensionPath) {
        try {
            const manifest = JSON.parse(fs.readFileSync(path.join(devtoolsExtensionPath, "manifest.json"), "utf8"));
            const manifestVersion = parseVersion(manifest.version)!;
            const extension = extensions.find(ext => ext.id === manifest.name);
            if (extension) {
                const extensionVersion = parseVersion(extension.version);
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

/**
 * Install development tools in the provided `Session`.
 */
export async function installDevtoolsExtensions(session: Session) {
    if (!devToolsEnabledForSession.has(session)) {
        devToolsEnabledForSession.add(session);
        try {
            await installDevtoolsExtension(REACT_DEVTOOLS_EXTENSION, session);
        }
        catch (e) {
            devToolsEnabledForSession.delete(session);
            throw e;
        }
    }
}