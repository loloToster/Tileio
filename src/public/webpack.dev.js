const tsDir = __dirname + "/src/ts"
const outDir = __dirname + "/static"

// compile typescript
module.exports = {
    mode: "development",
    watch: true,
    entry: {
        login: tsDir + "/login.ts",
        index: tsDir + "/index.ts"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            }, {
                test: /\.ts$/,
                loader: "ts-loader"
            }
        ]
    },
    resolve: {
        alias: {
            "jquery": "gridstack/dist/jq/jquery.js",
            "jquery-ui": "gridstack/dist/jq/jquery-ui.js",
            "jquery.ui": "gridstack/dist/jq/jquery-ui.js",
            "jquery.ui.touch-punch": "gridstack/dist/jq/jquery.ui.touch-punch.js",
        },
        extensions: [".ts", ".js"]
    },
    output: {
        filename: "[name].js",
        path: outDir + "/js"
    }
}
