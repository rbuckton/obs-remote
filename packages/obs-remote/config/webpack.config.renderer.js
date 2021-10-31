// @ts-check

/** @type {import("webpack").Configuration} */
module.exports = {
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        fallback: {
            "fs": false,
            "util": false,
            "path": require.resolve("path-browserify")
        }
    },
    module: { rules: require("./webpack.rules")("renderer") },
    plugins: require("./webpack.plugins"),
};