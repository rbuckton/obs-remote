import { Equatable, defaultEqualer, Comparable, defaultComparer, combineHashes } from "@esfx/equatable";

const versionRegexp = /^(?<major>\d+)\.(?<minor>\d+)\.(?<revision>\d+)(?<extra>[.+-].*)?$/;

export class Version {
    static readonly "4.8.0" = new Version(4, 8, 0);
    static readonly "4.9.0" = new Version(4, 9, 0);
    static readonly "4.9.1" = new Version(4, 9, 1);
    static readonly MIN_VERSION = this["4.8.0"];

    constructor(
        readonly major: number,
        readonly minor: number,
        readonly revision: number,
        readonly extra: string = ""
    ) {
    }

    static tryParse(text: string) {
        if (text === "4.8.0") return this["4.8.0"];
        if (text === "4.9.0") return this["4.9.0"];
        if (text === "4.9.1") return this["4.9.1"];
        const match = versionRegexp.exec(text)?.groups;
        if (match) {
            const major = parseInt(match.major, 10);
            const minor = parseInt(match.minor, 10);
            const revision = parseInt(match.revision, 10);
            const extra = match.extra;
            return new Version(major, minor, revision, extra);
        }
        return undefined;
    }

    static parse(text: string) {
        const version = this.tryParse(text);
        if (!version) throw new SyntaxError(`Invalid version: ${text}`);
        return version;
    }

    static equals(left: Version, right: Version) {
        return defaultEqualer.equals(left, right);
    }

    static compare(left: Version, right: Version) {
        return defaultComparer.compare(left, right);
    }

    equals(other: Version) {
        return this[Equatable.equals](other);
    }

    hash() {
        return this[Equatable.hash]();
    }

    compareto(other: Version) {
        return this[Comparable.compareTo](other);
    }

    toString() {
        return `${this.major}.${this.minor}.${this.revision}${this.extra}`;
    }

    [Equatable.equals](other: unknown) {
        if (!(other instanceof Version)) return false;
        return this.major === other.major
            && this.minor === other.minor
            && this.revision === other.revision
            && this.extra === other.extra;
    }

    [Equatable.hash]() {
        let hc = defaultEqualer.hash(this.major);
        hc = combineHashes(hc, defaultEqualer.hash(this.minor));
        hc = combineHashes(hc, defaultEqualer.hash(this.revision));
        hc = combineHashes(hc, defaultEqualer.hash(this.extra));
        return hc;
    }

    [Comparable.compareTo](other: unknown) {
        if (!(other instanceof Version)) return 0;
        return defaultComparer.compare(this.major, other.major)
            || defaultComparer.compare(this.minor, other.minor)
            || defaultComparer.compare(this.revision, other.revision)
            || defaultComparer.compare(this.extra, other.extra);
    }
}