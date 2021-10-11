// @ts-check

const fs = require("fs");
const path = require("path");

/**
 * @param {string | undefined} arg 
 */
function parseTag(arg) {
    switch (arg?.toLowerCase()) {
        case "nightly": return "nightly";
        case "beta": return "beta";
        case "none": return "";
        case undefined: throw new Error("Expected a value for parameter '--tag'");
        default: throw new Error(`Invalid value for '--tag'. Expected: 'none', 'nightly', or 'beta'. Received: '${arg}'.`);
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
    console.log(`node ${path.resolve(process.cwd(), __filename)} [[--tag] <nightly | beta>] [[--timestamp-kind] <none | date | datetime>]`);
}

/**
 * @param {string[]} argv 
 */
function parseArgs(argv) {
    try {
        /** @type {undefined | "" | "nightly" | "beta"} */
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

function main() {
    const { tag, timestampKind } = parseArgs(process.argv.slice(2));

    const packageJson = require("../package.json");
    const packageVersion = packageJson.version;
    const versionRegExp = /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)/;
    const versionMatch = versionRegExp.exec(packageVersion);
    if (!versionMatch?.groups) throw new Error(`Invalid version: ${packageVersion}`);
    const version = versionMatch.groups;
    const timestamp = 
        timestampKind === "datetime" ? new Date().toISOString()
            .replace(/\.*$/, "")
            .replace(/[-T:]/g, "") :
        timestampKind === "date" ? new Date().toISOString()
            .replace(/T.*$/, "")
            .replace(/-/g, "") :
        "";
    const prerelease = tag ? `-${tag}.${timestamp}` : "";
    const newVersion = `${version.major}.${version.minor}.${version.patch}${prerelease}`;
    if (packageVersion !== newVersion) {
        packageJson.version = newVersion;
        fs.writeFileSync(require.resolve("../package.json"), JSON.stringify(packageJson, undefined, "  "), "utf-8");
    }
}

main();