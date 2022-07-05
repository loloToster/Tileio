import express from "express"

import { Grid, IconResponse, SIIcon } from "../types/types"
import User from "../models/user"

import Fuse from "fuse.js"
import { SimpleIcon } from "simple-icons"
import si from "simple-icons/icons"
import fa from "../fa-icons.json"

const MAX_SEARCH_LIMIT = 64

const router = express.Router()

// logged in?
router.use((req, res, next) => {
    if (req.user) next()
    else res.redirect("/auth")
})

router.get("/", async (req, res) => {
    const user = req.user!
    res.json(user.grid)
})

// TODO: grid validation
function validateGrid(grid: any): grid is Grid {
    return true
}

router.put("/update", async (req, res) => {
    if (!req.user) return res.status(403).send()

    const newGrid: any = req.body

    if (!validateGrid(newGrid))
        return res.status(403).send()

    await User.findByIdAndUpdate(req.user.id, { grid: newGrid })

    res.send()
})

const simpleIcons: SIIcon[] = []

for (const key in si) {
    // @ts-ignore
    const icon: SimpleIcon = si[key]
    simpleIcons.push({
        title: icon.title,
        slug: icon.slug,
        source: icon.source,
        hex: icon.hex
    })
}

const SIfuse = new Fuse(simpleIcons, {
    keys: ["title"]
})

const FAfuse = new Fuse(fa, {
    keys: ["name"]
})

router.get("/search_icon", (req, res) => {
    const searchQuery = req.query.q
    const limit = req.query.l

    if (typeof searchQuery != "string" || typeof limit != "string")
        return res.status(400).send()

    // check if limit is a number
    if (!/^-?\d+$/.test(limit))
        return res.status(400).send()

    let SIsearchResults = SIfuse.search(searchQuery, {
        limit: parseInt(limit) % MAX_SEARCH_LIMIT
    }).map(r => r.item)

    let FAsearchResults = FAfuse.search(searchQuery, {
        limit: parseInt(limit) % MAX_SEARCH_LIMIT
    }).map(r => r.item)

    const resp: IconResponse = { si: SIsearchResults, fa: FAsearchResults }

    res.json(resp)
})

const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/
router.put("/update-settings", async (req, res) => {
    const values = req.body

    if (!values ||
        typeof values.bgColor != "string" ||
        !hexColorRegex.test(values.bgColor) ||
        typeof values.cellColor != "string" ||
        !hexColorRegex.test(values.cellColor) ||
        typeof values.col != "number" ||
        typeof values.row != "number")
        return res.status(403).send()

    await User.findByIdAndUpdate(req.user!.id,
        {
            $set: { "grid.bg": values.bgColor, "grid.cell": values.cellColor, "grid.col": values.col, "grid.row": values.row },
        }
    )

    res.send()
})

export = router
