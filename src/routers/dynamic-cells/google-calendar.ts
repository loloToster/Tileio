import express from "express"
import { OAuth2Client } from "google-auth-library"
import { calendar, calendar_v3 } from "@googleapis/calendar"

import User from "../../models/user"
import { CalendarResponse } from "../../types/types"

function getOAuthClient() {
    return new OAuth2Client(
        process.env.GC_CLIENT_ID,
        process.env.GC_CLIENT_SECRET,
        process.env.GC_REDIRECT_URL?.replace("{PORT}", process.env.PORT || "80")
    )
}

const googleAuthApi = getOAuthClient()

const router = express.Router()

router.get("/", (req, res) => {
    const gcData = req.user!.dynamicCells.googleCalendar

    if (gcData)
        res.render("dynamic-cells/google-calendar")
    else
        res.render("dynamic-cells/google-calendar-login")
})

router.get("/login", (req, res) => {
    const url = googleAuthApi.generateAuthUrl({
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/calendar",
        prompt: "select_account"
    })

    res.redirect(url)
})

router.get("/logout", async (req, res) => {
    await User.findByIdAndUpdate(req.user!.id, { $unset: { "dynamicCells.googleCalendar": 1 } })
    res.redirect("/google-calendar/spotify")
})

router.get("/redirect", async (req, res) => {
    if (!req.query.code) return res.status(400).send()

    const { tokens } = await googleAuthApi.getToken(req.query.code.toString())

    await User.findByIdAndUpdate(req.user!.id, {
        "dynamicCells.googleCalendar": tokens
    })

    res.redirect("/")
})

router.get("/calendar", async (req, res) => {
    if (!req.user || !req.user.dynamicCells.googleCalendar)
        return res.status(400).send()

    const auth = getOAuthClient()
    auth.setCredentials(req.user.dynamicCells.googleCalendar)

    // refresh token if necessary
    if (Date.now() > req.user.dynamicCells.googleCalendar.expiry_date) {
        const res = await auth.refreshAccessToken()
        const newTokens = res.credentials

        await User.findByIdAndUpdate(req.user!.id, { "dynamicCells.googleCalendar": newTokens })
    }

    const api = calendar({ version: 'v3', auth })

    const { data: { items: calendars } } = await api.calendarList.list()

    if (!calendars) {
        return res.status(500).send()
    }

    const now = new Date()
    const nowISO = now.toISOString()
    const inTwoWeeks = new Date()
    inTwoWeeks.setDate(now.getDate() + 14)
    const inTwoWeeksISO = inTwoWeeks.toISOString()

    let events: calendar_v3.Schema$Event[] = []

    for (const cal of calendars) {
        if (!cal.id) continue

        const { data } = await api.events.list({
            calendarId: cal.id,
            timeMin: nowISO,
            timeMax: inTwoWeeksISO,
            singleEvents: true
        })

        events = events.concat(data.items || [])
    }

    const resBody: CalendarResponse = { calendars, events }

    res.json(resBody)
})

export = router
