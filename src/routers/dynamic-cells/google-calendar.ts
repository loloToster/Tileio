import express from "express"
import { KalenderEvents } from "kalender-events"

import User from "../../models/user"

const router = express.Router()

router.get("/", (req, res) => {
    res.render("dynamic-cells/google-calendar")
})

router.get("/ical", async (req, res) => {
    const url = req.user!.dynamicCells.googleCalendar?.url

    if (!url) return res.json({ calendar: null })

    const calendar = await new KalenderEvents({ url }).getEvents({
        type: "ical",
        preview: 14,
        previewUnits: "days",
        pastview: 0,
        pastviewUnits: "days"
    })

    res.json({ calendar })
})

router.put("/ical", async (req, res) => {
    const url = req.query.url?.toString()

    if (!url) return res.status(400).send()

    // check if url is valid
    let urlObject: URL
    try {
        urlObject = new URL(url)
    } catch {
        return res.status(400).send()
    }

    await User.findByIdAndUpdate(req.user!.id, { "dynamicCells.googleCalendar.url": urlObject.href })
    res.send()
})

export = router
