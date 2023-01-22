import express from "express"

import User from "../../models/user"

const COLORS = [
    "#e5e988",
    "#d2a76c",
    "#d292ba",
    "#9fdee1",
    "#b4e8a2"
]

const FONTS = [
    {
        name: "Arial / Helvetica",
        href: null,
        css: "Arial, Helvetica",
        slug: "arial"
    },
    {
        name: "Indie Flower",
        href: "https://fonts.googleapis.com/css?family=Indie%20Flower",
        css: "'Indie Flower'",
        slug: "indie-flower"
    },
    {
        name: "Solitero",
        href: "https://fonts.googleapis.com/css2?family=Solitreo",
        css: "'Solitreo', cursive",
        slug: "solitero"
    },
    {
        name: "Pacifico",
        href: "https://fonts.googleapis.com/css2?family=Pacifico",
        css: "'Pacifico'",
        slug: "pacifico"
    },
    {
        name: "Shadows Into Light",
        href: "https://fonts.googleapis.com/css2?family=Shadows+Into+Light",
        css: "'Shadows Into Light', cursive",
        slug: "shadows-into-light"
    },
    {
        name: "Permanent Marker",
        href: "https://fonts.googleapis.com/css2?family=Permanent+Marker",
        css: "'Permanent Marker', cursive",
        slug: "permament-marker"
    }
]

const router = express.Router()

router.get("/", (req, res) => {
    const noteData = req.user!.dynamicCells.mininote
    const text = noteData?.text || ""
    const color = noteData?.color || COLORS[0]
    const font = FONTS.find(f => f.slug === noteData?.font) || FONTS[0]

    res.render("dynamic-cells/mininote", {
        text,
        color,
        font,
        allColors: COLORS,
        allFonts: FONTS
    })
})

router.put("/text", async (req, res) => {
    const text: unknown = req.body.text

    if (typeof text !== "string" || text.length > 2048)
        return res.status(400).send()

    await User.findByIdAndUpdate(req.user!.id, { "dynamicCells.mininote.text": req.body.text })
    res.send()
})

router.put("/color", async (req, res) => {
    const color: unknown = req.body.color

    if (typeof color !== "string" || !/^\s*#[0-9a-f]{6}\s*$/i.test(color))
        return res.status(400).send()

    await User.findByIdAndUpdate(req.user!.id, { "dynamicCells.mininote.color": req.body.color })
    res.send()
})

router.put("/font", async (req, res) => {
    const font: unknown = req.body.font

    if (typeof font !== "string" || !FONTS.map(f => f.slug).includes(font))
        return res.status(400).send()

    await User.findByIdAndUpdate(req.user!.id, { "dynamicCells.mininote.font": req.body.font })
    res.send()
})

export = router
