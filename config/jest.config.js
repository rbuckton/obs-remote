module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    rootDir: "../",
    transform: {
        "^.+\\.tsx?": "ts-jest"
    },
    testPathIgnorePatterns: [
        "/.vscode/",
        "/.webpack/",
        "/assets/",
        "/config/",
        "/dist/",
        "/node_modules/",
        "/out/",
    ],
    globals: {
        "ts-jest": {
            tsconfig: require.resolve("../tsconfig.json"),
            compiler: require.resolve("typescript")
        }
    }
};