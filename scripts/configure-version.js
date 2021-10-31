// @ts-check

const fs = require("fs");
const path = require("path");

/**
 * @param {string | undefined} arg 
 */
function parseTag(arg) {
    switch (arg?.toLowerCase()) {
        case "pre": return "pre";
        case "beta": return "beta";
        case "none": return "";
        case undefined: throw new Error("Expected a value for parameter '--tag'");
        default: throw new Error(`Invalid value for '--tag'. Expected: 'none', 'pre', or 'beta'. Received: '${arg}'.`);
    }
}

/**
 * @param {string | undefined} arg 
 */
function parseTimestampKind(arg) {
    switch (arg?.toLowerCase()) {
        case "datetime": return "datetime";
        case "date": return "date";
        case "none": return "none";
        case undefined: throw new Error("Expected a value for parameter '--timestamp-kind'");
        default: throw new Error(`Invalid value for '--timestamp-kind'. Expected: 'none', 'date', or 'datetime'. Received: '${arg}'.`);
    }
}

function printHelp() {
    console.log("Usage:");
    console.log(`node ${path.resolve(process.cwd(), __filename)} [[--tag] <pre | beta>] [[--timestamp-kind] <none | date | datetime>]`);
}

/**
 * @param {string[]} argv 
 */
function parseArgs(argv) {
    try {
        /** @type {undefined | "" | "pre" | "beta"} */
        let tag;
        /** @type {undefined | "none" | "date" | "datetime"} */
        let timestampKind;
        while (argv.length) {
            const arg = argv.shift();
            switch (arg.toLowerCase()) {
                case "-?":
                case "-h":
                case "--help":
                    printHelp();
                    process.exit(0);
                    break;
                case "--tag": 
                    tag = parseTag(argv.shift());
                    break;
                case "--timestamp-kind": 
                    timestampKind = parseTimestampKind(argv.shift());
                    break;
                default:
                    if (arg.startsWith("-")) throw new Error(`Unrecognized argument: '${arg}'`);
                    if (tag === undefined) {
                        tag = parseTag(arg);
                        break;
                    }
                    if (timestampKind === undefined) {
                        timestampKind = parseTimestampKind(arg);
                        break;
                    }
                    throw new Error(`Unrecognized argument: '${arg}'`);
            }
        }
        if (tag === undefined) tag = "";
        if (tag === "") timestampKind = "none";
        if (timestampKind === undefined) timestampKind = tag ? "date" : "none";
        return { tag, timestampKind };
    }
    catch (e) {
        console.log(e.message);
        printHelp();
        process.exit(-1);
    }
}

function * collectPackages() {
    const rootDir = path.dirname(__dirname);
    const file = path.join(rootDir, "package.json");
    const json = require(file);
    const version = parseVersion(json);
    yield { file, version, json, root: true };

    const packagesDir = path.join(rootDir, "packages");
    for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        try {
            const file = path.join(packagesDir, entry.name, "package.json");
            const json = require(file);
            const version = parseVersion(json);
            yield { file, version, json, root: false };
        }
        catch {
        }
    }
}

/**
 * 
 * @param {any} packageJson 
 * @returns {[major: number, minor: number, patch: number]}
 */
function parseVersion(packageJson) {
    const packageVersion = packageJson.version;
    const versionRegExp = /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/;
    const versionMatch = versionRegExp.exec(packageVersion);
    if (!versionMatch?.groups) throw new Error(`Invalid version: ${packageVersion}`);
    const version = versionMatch.groups;
    return [+version.major, +version.minor, +version.patch];
}

/**
 * @param {[major: number, minor: number, patch: number]} left 
 * @param {[major: number, minor: number, patch: number]} right 
 */
function compareVersion(left, right) {
    return left[0] - right[0]
        || left[1] - right[1]
        || left[2] - right[2];
}

function main() {
    const { tag, timestampKind } = parseArgs(process.argv.slice(2));
    const packages = [...collectPackages()];

    let maxVersion;
    for (const { version } of packages) {
        if (!maxVersion || compareVersion(maxVersion, version) < 0) {
            maxVersion = version;
        }
    }

    if (!maxVersion) throw new Error(`Could not determine package version`);
    const timestamp = 
        timestampKind === "datetime" ? new Date().toISOString()
            .replace(/\.*$/, "")
            .replace(/[-T:]/g, "") :
        timestampKind === "date" ? new Date().toISOString()
            .replace(/T.*$/, "")
            .replace(/-/g, "") :
        "";
    const prerelease = tag ? `-${tag}.${timestamp}` : "";
    const newVersion = `${maxVersion[0]}.${maxVersion[1]}.${maxVersion[2]}${prerelease}`;

    for (const { file, json } of packages) {
        if (json.version !== newVersion) {
            json.version = newVersion;
            fs.writeFileSync(file, JSON.stringify(json, undefined, "  "), "utf-8");
        }
    }
}

main();