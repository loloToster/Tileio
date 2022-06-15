import express from "express"

import User, { IUser } from "../../models/user"

const router = express.Router()

router.get("/", (req, res) => {
    // @ts-ignore
    const user: IUser = req.user
    const note = user.dynamicCells.mininote?.text || ""
    res.render("dynamic-cells/mininote", { note })
})

router.put("/update", async (req, res) => {
    // @ts-ignore
    await User.findByIdAndUpdate(req.user.id, { "dynamicCells.mininote.text": req.body.text })
    res.send()
})

export = router
