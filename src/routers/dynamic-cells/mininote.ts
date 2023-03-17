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
    if (req.query.preview === "true")
        return res.render("dynamic-cells/mininote", {
            text: "Remember to water the plants",
            color: COLORS[0],
            font: FONTS[0],
            allColors: [],
            allFonts: [],
            preview: true
        })

    if (!req.query.id)
        return res.status(400).send()

    const noteData = req.user!.dynamicCells.mininotes?.get(req.query.id.toString())
    const text = noteData?.text || ""
    const color = noteData?.color || COLORS[0]
    const font = FONTS.find(f => f.slug === noteData?.font) || FONTS[0]

    res.render("dynamic-cells/mininote", {
        text,
        color,
        font,
        allColors: COLORS,
        allFonts: FONTS,
        preview: false
    })
})

async function updateNote(userId: string | undefined, noteId: string | number, field: string, value: string) {
    return await User.findByIdAndUpdate(
        userId,
        {
            [`dynamicCells.mininotes.${noteId}.${field}`]: value
        }
    )
}

router.put("/:id/text", async (req, res) => {
    const text: unknown = req.body.text

    if (typeof text !== "string" || text.length > 2048)
        return res.status(400).send()

    await updateNote(req.user!.id, req.params.id, "text", text)
    res.send()
})

router.put("/:id/color", async (req, res) => {
    const color: unknown = req.body.color

    if (typeof color !== "string" || !/^\s*#[0-9a-f]{6}\s*$/i.test(color))
        return res.status(400).send()

    await updateNote(req.user!.id, req.params.id, "color", color)
    res.send()
})

router.put("/:id/font", async (req, res) => {
    const font: unknown = req.body.font

    if (typeof font !== "string" || !FONTS.map(f => f.slug).includes(font))
        return res.status(400).send()

    await updateNote(req.user!.id, req.params.id, "font", font)
    res.send()
})

export = router
