import express from "express"

import User from "../../models/user"

const router = express.Router()

router.get("/", (req, res) => {
    const note = req.user!.dynamicCells.mininote?.text || ""
    res.render("dynamic-cells/mininote", { note })
})

router.put("/update", async (req, res) => {
    await User.findByIdAndUpdate(req.user!.id, { "dynamicCells.mininote.text": req.body.text })
    res.send()
})

export = router
