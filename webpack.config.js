const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = [
    {
        mode: 'development',
        entry: './src/main.ts',
        target: 'electron-main',
        devtool: 'source-map',
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        },
        module: {
            rules: [{
                test: /\.ts$/,
                include: /src/,
                use: [{ loader: 'ts-loader' }]
            }]
        },
        externals: {
            "semver": "commonjs semver",
            "electron": "commonjs electron",
        },
        output: {
            path: __dirname + "/dist",
            filename: "main.js"
        }
    },
    {
        mode: 'development',
        entry: './src/renderer.tsx',
        target: 'electron-renderer',
        devtool: 'source-map',
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        },
        module: {
            rules: [{
                test: /\.tsx?$/,
                include: /src/,
                use: [{ loader: 'ts-loader' }]
            }, {
                oneOf: [
                    {
                        test: /\.css$/,
                        loader: "css-loader",
                        options: { importLoaders: 1, sourceMap: true },
                        sideEffects: true
                    },
                    {
                        loader: 'file-loader',
                        exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                        options: {
                            name: 'static/media/[name].[hash:8].[ext]'
                        }
                    }
                ]
            }]
        },
        externals: {
            "semver": "commonjs semver",
            "electron": "commonjs electron",
        },
        output: {
            path: __dirname + "/dist",
            filename: "renderer.js"
        }
    }
];