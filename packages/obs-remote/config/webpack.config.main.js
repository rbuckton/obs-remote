// @ts-check

/** @type {import("webpack").Configuration} */
module.exports = {
    entry: './src/main.ts',
    resolve: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    module: { rules: require("./webpack.rules")("main") },
    plugins: require("./webpack.plugins")
};