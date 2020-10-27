module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.tsx?": "ts-jest"
    },
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/"
    ],
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.json",
            compiler: require.resolve("typescript")
        }
    }
};