import express from "express"
import User, { IUser, Grid } from "../models/user"

const router = express.Router()

// logged in?
router.use((req, res, next) => {
    if (req.user) next()
    else res.redirect("/auth")
})

router.get("/", async (req, res) => {
    // @ts-ignore
    const user: IUser = req.user!
    res.json(user.grid)
})

// TODO: grid validation
function validateGrid(grid: any): grid is Grid {
    return true
}

router.put("/update", async (req, res) => {
    const newGrid: any = req.body

    if (!validateGrid(newGrid))
        return res.status(403).send()

    // @ts-ignore
    await User.updateOne({ id: req.user.id }, { grid: newGrid })

    res.send()
})

export = router
