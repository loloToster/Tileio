import express from "express"

import User from "../../models/user"

const router = express.Router()

router.get("/", (req, res) => {
    // TODO: use middleware to check if user exists
    if (!req.user) return res.status(403).send()
    const user = req.user
    const note = user.dynamicCells.mininote?.text || ""
    res.render("dynamic-cells/mininote", { note })
})

router.put("/update", async (req, res) => {
    if (!req.user) return res.status(403).send()
    await User.findByIdAndUpdate(req.user.id, { "dynamicCells.mininote.text": req.body.text })
    res.send()
})

export = router
