import express from "express"
import frameguard from "frameguard"
import path from "path"

import dynamicCells from "../dynamic-cells.json"

const router = express.Router()

const strategyIdToName: Record<string, string> = {
    "lcl": "Email",
    "ggl": "Google",
    "dsc": "Discord",
    "git": "Github"
}

const publicStaticDir = __dirname + "/../public/static"
const htmlDir = publicStaticDir + "/html"

router.get("/", frameguard({ action: "deny" }), async (req, res) => {
    if (!req.user) return res.redirect("/home")
    const strategy: string = req.user.strategyId.slice(0, 3)
    res.render("index", { user: req.user, strategy: strategyIdToName[strategy], dynamicCells })
})

const staticPages = ["home", "guides", "api-docs"]

function titleizePage(page: string) {
    const titleElements = page.split("-")

    // Capitalize every word
    titleElements.forEach((el, i) => {
        titleElements[i] = el.charAt(0).toUpperCase() + el.slice(1)
    })

    return titleElements.join(" ")
}

staticPages.forEach(page => {
    const title = titleizePage(page)

    router.get("/" + page, (req, res) => {
        res.render("static-page", { content: page, title })
    })
})

router.get("/home", async (req, res) => {
    res.render("home")
})

router.get("/api-docs", async (req, res) => {
    res.sendFile(
        path.normalize(htmlDir + "/api-docs.html")
    )
})

router.get(/\/gridstack\.min\.css|\/gridstack-extra\.min\.css/,
    (req, res) =>
        res.sendFile(
            path.normalize(__dirname + "/../../node_modules/gridstack/dist" + req.path)
        )
)

router.use("/static", express.static(publicStaticDir))

export = router
