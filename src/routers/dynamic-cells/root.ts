import express from "express"
import dynamicCells from "../../dynamic-cells.json"

const router = express.Router()

router.get("/*", (req, res, next) => {
    if (!req.user) return res.status(401).send()

    const cell = dynamicCells.find(c => req.path == `/${c.id}`)
    if (!cell || !cell.sizes) return next()

    let size = `${req.query.w}x${req.query.h}`
    if (cell.sizes.includes(size))
        return next()

    res.render("dynamic-cells/unsupported", { sizes: cell.sizes })
})

export = router
