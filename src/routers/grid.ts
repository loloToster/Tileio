import express from "express"

import { Grid, Icon } from "../types/types"
import User, { IUser } from "../models/user"

import Fuse from "fuse.js"
import { SimpleIcon } from "simple-icons"
import si from "simple-icons/icons"

const MAX_SEARCH_LIMIT = 64

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

const simpleIcons: Icon[] = []

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

const fuse = new Fuse(simpleIcons, {
    keys: ["title"]
})

router.get("/search_icon", (req, res) => {
    const searchQuery = req.query.q
    const limit = req.query.l

    if (typeof searchQuery != "string" || typeof limit != "string")
        return res.status(400).send()

    // check if limit is a number
    if (!/^-?\d+$/.test(limit))
        return res.status(400).send()

    let searchResults = fuse.search(searchQuery, {
        limit: parseInt(limit) % MAX_SEARCH_LIMIT
    }).map(r => r.item)

    res.json(searchResults)
})

export = router
