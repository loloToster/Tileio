import express from "express"

import User from "../../models/user"

const router = express.Router()

router.get("/", (req, res) => {
    res.render("dynamic-cells/google-calendar")
})

export = router
