import express from "express"

const router = express.Router()

router.get("/", (req, res) => {
    if (!req.user) return res.status(403).send()
    res.render("dynamic-cells/spotify")
})

export = router
