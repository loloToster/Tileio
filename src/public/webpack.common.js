const { marked } = require("marked")
const cheerio = require("cheerio")

const fs = require("fs")

const srcDir = __dirname + "/src"
const outDir = __dirname + "/static"

// compile markdown
console.log("Compiling markdown...")

const staticInDir = srcDir + "/static-pages"
const staticOutDir = __dirname + "/views/static-pages"

if (!fs.existsSync(staticOutDir))
    fs.mkdirSync(staticOutDir)

fs.readdirSync(staticInDir).forEach(file => {
    if (!file.endsWith(".md") && !file.endsWith(".html")) {
        console.log("Ignoring", file)
        return
    }

    const pathToFile = `${staticInDir}/${file}`
    console.log("Compiling " + pathToFile)

    let content = fs.readFileSync(pathToFile).toString()

    if (file.endsWith(".md")) {
        const $md = cheerio.load(
            marked.parse(content)
        )

        let toc = ""

        $md("h1, h2, h3, h4, h5, h6").each(function () {
            const el = $md(this)
            const id = el.attr("id")
            const level = el.prop("tagName").substring(1)
            const text = el.text()
            toc += `<a href="#${id}" class="level-${level}">${text}</a>`
        })

        content = `
            <main>
                <div class="toc">
                    ${toc}
                </div>
                <div class="content">
                    ${$md.html()}
                </div>
            </main>
            `
    }

    fs.writeFileSync(
        `${staticOutDir}/${file.split(".")[0]}.ejs`,
        content,
        { flag: "w" }
    )
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
