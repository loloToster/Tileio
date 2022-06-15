const fs = require("fs")

const srcDir = __dirname + "/src"
const tsDir = srcDir + "/ts"
const dynamicCellsDir = srcDir + "/dynamic-cells"

const outDir = __dirname + "/static"

let entry = {}

// load files from ts dir
fs.readdirSync(tsDir).forEach(file => {
    if (!file.match(/\.ts$/)) return

    const name = file.slice(0, -3)
    entry["js/" + name] = `${tsDir}/${file}`
})

// load every index.ts from /dynamic-cells/**/
fs.readdirSync(dynamicCellsDir).forEach(dir => {
    const pathToIndex = `${dynamicCellsDir}/${dir}/index.ts`

    if (fs.existsSync(pathToIndex))
        entry[`dynamic-cells/${dir}/index`] = pathToIndex
})

module.exports = {
    entry,
    module: {
        rules: [{
            test: /\.ts$/,
            loader: "ts-loader"
        }]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        filename: "[name].js",
        path: outDir
    }
}
