import express from "express"

import { IconResponse, SerializedCell, SerializedCellContent, SIIcon } from "../types/types"
import User from "../models/user"
import GridEmulator from "./_GridEmulator"

import Fuse from "fuse.js"
import type { SimpleIcon } from "simple-icons"
import * as si from "simple-icons"
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

function validateCells(gridW: number, gridH: number, cells: unknown): SerializedCell[] {
    if (!Array.isArray(cells)) throw Error("Cells are not an array")

    let validatedCells: SerializedCell[] = []
    const emul = new GridEmulator(gridW, gridH)
    let usedIds: number[] = []

    for (const cell of cells) {
        let content: undefined | SerializedCellContent
        if (!cell.content) {
            content = undefined
        } else {
            if (cell.content.type == "d") {
                if (typeof cell.content.src !== "string") throw Error("Bad type of content.src")

                content = {
                    type: "d",
                    src: cell.content.src
                }
            } else if (cell.content.type == "l") {
                if (typeof cell.content.iconUrl !== "string") throw Error("Bad type of content.iconUrl")
                if (typeof cell.content.link !== "string") throw Error("Bad type of content.link")
                if (typeof cell.content.bgColor !== "string" && typeof cell.content.bgColor !== "undefined") throw Error("Bad type of content.bgColor")

                content = {
                    type: "l",
                    iconUrl: cell.content.iconUrl,
                    link: cell.content.link,
                    bgColor: cell.content.bgColor
                }
            } else {
                throw Error("Bad cell content type")
            }
        }

        if (
            typeof cell.cellId !== "number" ||
            typeof cell.x !== "number" ||
            typeof cell.y !== "number" ||
            typeof cell.w !== "number" ||
            typeof cell.h !== "number"
        )
            throw Error("Bad type of x, y, w or h")

        cell.cellId = parseInt(cell.cellId)
        if (usedIds.includes(cell.cellId) || cell.cellId < 0 || cell.cellId > 2048)
            throw Error("Bad cell id")
        usedIds.push(cell.cellId)

        emul.addWidget(cell.x, cell.y, cell.w, cell.h)

        validatedCells.push({
            cellId: cell.cellId,
            x: cell.x,
            y: cell.y,
            w: cell.w,
            h: cell.h,
            content
        })
    }

    return validatedCells
}

router.put("/update", async (req, res) => {
    if (!req.user) return res.status(403).send()

    let newCells: any = req.body

    try {
        newCells = validateCells(req.user.grid.col, req.user.grid.row, newCells)
    } catch (error) {
        console.log(error)
        return res.status(400).send()
    }

    await User.findByIdAndUpdate(req.user.id, { "grid.cells": newCells })

    res.send()
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
