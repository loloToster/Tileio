import express from "express"
import path from "path"

import dynamicCells from "../dynamic-cells.json"

const router = express.Router()

const strategyIdToName: Record<string, string> = {
    "ggl": "Google",
    "dsc": "Discord",
    "git": "Github"
}

router.get("/", async (req, res) => {
    if (!req.user) return res.redirect("/auth")
    // @ts-ignore
    const strategy: string = req.user.strategyId.slice(0, 3)
    res.render("index", { user: req.user, strategy: strategyIdToName[strategy], dynamicCells })
})

router.get(/\/gridstack\.min\.css|\/gridstack-extra\.min\.css/,
    (req, res) =>
        res.sendFile(
            path.normalize(__dirname + "/../../node_modules/gridstack/dist" + req.path)
        )
)

router.use("/static", express.static(__dirname + "/../public/static"))

export = router
