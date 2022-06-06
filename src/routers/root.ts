import express from "express"

const router = express.Router()

router.get("/", async (req, res) => {
    res.render("index", { user: req.user })
})

export = router
