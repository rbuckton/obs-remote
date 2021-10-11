// @ts-check

/** 
 * @template C
 * @typedef {import("@electron-forge/maker-base").default<C>} MakerBase<C>
 */

/** 
 * @template {MakerBase<any>} T
 * @typedef {T extends MakerBase<infer C> ? C : import("@electron-forge/maker-base").MakerOptions } MakerOptions
 */

/** @type {import("@electron-forge/shared-types").ForgeConfig} */
module.exports = {
    packagerConfig: {
        appCopyright: "Copyright © 2021 Ron Buckton",
        extraResource: [
            require.resolve("../assets/screenshot.jpg")
        ]
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: /** @type {MakerOptions<import("@electron-forge/maker-squirrel").default>} */({
            })
        },
        // {
        //     name: "@electron-forge/maker-appx",
        //     config: /** @type {MakerOptions<import("@electron-forge/maker-appx").default>} */({
        //     })
        // },
        // {
        //     name: "@electron-forge/maker-zip",
        //     platforms: ["darwin"],
        //     config: /** @type {MakerOptions<import("@electron-forge/maker-zip").default>} */({
        //     })
        // },
        // {
        //     name: "@electron-forge/maker-deb",
        //     config: /** @type {MakerOptions<import("@electron-forge/maker-deb").default>} */({
        //     })
        // },
        // {
        //     name: "@electron-forge/maker-rpm",
        //     config: /** @type {MakerOptions<import("@electron-forge/maker-rpm").default>} */({
        //     })
        // }
    ],
    plugins: [
        ["@electron-forge/plugin-webpack", /** @type {import("@electron-forge/plugin-webpack/dist/Config").WebpackPluginConfig} */({
            devContentSecurityPolicy: "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data:; connect-src 'self' ws: wss:",
            devServer: {
            },
            mainConfig: require.resolve("./webpack.config.main.js"),
            renderer: {
                // nodeIntegration: true,
                config: require.resolve("./webpack.config.renderer.js"),
                entryPoints: [
                    {
                        html: require.resolve("../assets/index.html"),
                        js: require.resolve("../src/renderer.tsx"),
                        preload: {
                            js: require.resolve("../src/preload.ts")
                        },
                        name: "main_window"
                    }
                ]
            }
        })]
    ]
};