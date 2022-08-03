const sass = require("sass")
const { merge } = require("webpack-merge")
const common = require("./webpack.common")

const fs = require("fs")

const srcDir = __dirname + "/src"
const sassDir = srcDir + "/sass"
const dynamicCellsDir = srcDir + "/dynamic-cells"

const outDir = __dirname + "/static"

// compile main sass
if (!fs.existsSync(`${outDir}/css`))
    fs.mkdirSync(`${outDir}/css`)

fs.readdirSync(sassDir).forEach(file => {
    if (!file.match(/^(?!_).+\.scss$/)) {
        return console.log("Ignoring " + file)
    }

    console.log("Compiling " + file)
    const css = sass.compile(`${sassDir}/${file}`).css

    fs.writeFileSync(`${outDir}/css/${file.slice(0, -5)}.css`, css, {
        flag: "w"
    })
})

// compile sass from dynamic-cells 
if (!fs.existsSync(`${outDir}/dynamic-cells`))
    fs.mkdirSync(`${outDir}/dynamic-cells`)

fs.readdirSync(dynamicCellsDir).forEach(dir => {
    const pathToScss = `${dynamicCellsDir}/${dir}/main.scss`

    if (!fs.existsSync(pathToScss)) return

    console.log("Compiling " + pathToScss)
    const css = sass.compile(pathToScss).css

    if (!fs.existsSync(`${outDir}/dynamic-cells/${dir}`))
        fs.mkdirSync(`${outDir}/dynamic-cells/${dir}`)

    fs.writeFileSync(`${outDir}/dynamic-cells/${dir}/main.css`, css, {
        flag: "w"
    })
})

// compile typescript
module.exports = merge(common, {
    mode: "production"
})
