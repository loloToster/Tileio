const sass = require("sass")
const fs = require("fs")

const tsDir = __dirname + "/src/ts"
const sassDir = __dirname + "/src/sass"
const outDir = __dirname + "/static"

// compile sass
for (file of fs.readdirSync(sassDir)) {
    if (!file.match(/^(?!_).+\.scss$/m)) {
        console.log("Ignoring " + file)
        continue
    }

    console.log("Compiling " + file)
    const css = sass.compile(`${sassDir}/${file}`).css

    fs.writeFileSync(`${outDir}/css/${file.slice(0, -5)}.css`, css)
}

// compile typescript
module.exports = {
    mode: "development",
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
