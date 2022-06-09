import express from "express"
import path from "path"

const router = express.Router()

router.get("/", async (req, res) => {
    res.render("index", { user: req.user })
})

router.get(/\/gridstack\.min\.css|\/gridstack-extra\.min\.css/,
    (req, res) =>
        res.sendFile(
            path.normalize(__dirname + "/../../node_modules/gridstack/dist" + req.path)
        )
)

router.use("/static", express.static(__dirname + "/../public/static"))

export = router
