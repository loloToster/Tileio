const { marked } = require("marked")
const cheerio = require("cheerio")

const fs = require("fs")

const srcDir = __dirname + "/src"
const outDir = __dirname + "/static"

// compile markdown
console.log("Compiling markdown...")

const markdownDir = srcDir + "/markdown"
const markdownOutDir = outDir + "/html"

if (!fs.existsSync(markdownOutDir))
    fs.mkdirSync(markdownOutDir)

fs.readdirSync(markdownDir).forEach(file => {
    if (!file.match(/\.md$/)) return

    const $base = cheerio.load(fs.readFileSync(markdownDir + "/base.html").toString())

    const pathToFile = `${markdownDir}/${file}`
    console.log("Compiling " + pathToFile)
    const $md = cheerio.load(
        marked.parse(
            fs.readFileSync(pathToFile).toString()
        )
    )

    let toc = ""

    $md("h1, h2, h3, h4, h5, h6").each(function () {
        const el = $md(this)
        const id = el.attr("id")
        const level = el.prop("tagName").substring(1)
        const text = el.text()
        toc += `<a href="#${id}" class="level-${level}">${text}</div>`
    })

    $base("#toc").replaceWith(toc)
    $base("#content").replaceWith($md.html())

    fs.writeFileSync(`${markdownOutDir}/${file.slice(0, -3)}.html`, $base.html(), { flag: "w" })
})

const tsDir = srcDir + "/ts"
const dynamicCellsDir = srcDir + "/dynamic-cells"

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
