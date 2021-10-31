// @ts-check

/** @type {import("webpack").RuleSetRule[]} */
const mainRules = [
    {
        // We're specifying native_modules in the test because the asset relocator loader generates a
        // "fake" .node file which is really a cjs file.
        test: /native_modules\/.+\.node$/,
        use: 'node-loader',
    },
    {
        test: /\.(m?js|node)$/,
        parser: { amd: false },
        use: {
            loader: '@vercel/webpack-asset-relocator-loader',
            options: {
                outputAssetBase: 'native_modules',
            },
        },
    },
    {
        test: /\.tsx?$/,
        include: /src/,
        use: [{
            loader: 'ts-loader',
            options: /** @type {import("ts-loader").Options} */({
                transpileOnly: true,
                onlyCompileBundledFiles: true
            })
        }]
    }];

/** @type {import("webpack").RuleSetRule[]} */
const rendererRules = [...mainRules, {
    oneOf: [
        {
            test: /\.css$/,
            use: [
                { loader: "style-loader" },
                { loader: "css-loader" },
            ],
        },
    ]
}];

/** @type {(target: "main" | "renderer") => import("webpack").RuleSetRule[]} */
module.exports = target => target === "main" ? mainRules : rendererRules;