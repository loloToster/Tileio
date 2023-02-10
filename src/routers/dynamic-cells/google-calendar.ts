import { parse as parseUrl } from "url"
import express from "express"
import { OAuth2Client } from "google-auth-library"
import { calendar, calendar_v3 } from "@googleapis/calendar"

import User from "../../models/user"
import { CalendarResponse, ExtendedEvent } from "../../types/types"

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
    const loggedIn = Boolean(req.user!.dynamicCells.googleCalendar?.at)

    if (loggedIn)
        res.render("dynamic-cells/google-calendar", { query: parseUrl(req.url).query })
    else
        res.render("dynamic-cells/google-calendar-login")
})

router.get("/login", (req, res) => {
    const url = googleAuthApi.generateAuthUrl({
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/calendar",
        prompt: "consent"
    })

    res.redirect(url)
})

router.get("/logout", async (req, res) => {
    await User.findByIdAndUpdate(req.user!.id, { $unset: { "dynamicCells.googleCalendar": 1 } })

    res.redirect("/dynamic-cells/google-calendar?" + parseUrl(req.url).query)
})

router.get("/redirect", async (req, res) => {
    if (!req.query.code) return res.status(400).send()

    const currentAuthData = req.user?.dynamicCells.googleCalendar
    const { tokens } = await googleAuthApi.getToken(req.query.code.toString())

    await User.findByIdAndUpdate(req.user!.id, {
        "dynamicCells.googleCalendar": {
            at: tokens.access_token ?? currentAuthData?.at,
            rt: tokens.refresh_token ?? currentAuthData?.rt,
            expires: tokens.expiry_date ?? currentAuthData?.expires
        }
    })

    res.redirect("/")
})

router.get("/calendar", async (req, res) => {
    if (!req.user || !req.user.dynamicCells.googleCalendar)
        return res.status(400).send()

    const authData = req.user.dynamicCells.googleCalendar

    const auth = getOAuthClient()
    auth.setCredentials({
        access_token: authData.at,
        refresh_token: authData.rt
    })

    // refresh token if necessary
    if (Date.now() > authData.expires) {
        const res = await auth.refreshAccessToken()
        const newTokens = res.credentials

        await User.findByIdAndUpdate(req.user!.id, {
            "dynamicCells.googleCalendar": {
                at: newTokens.access_token ?? authData?.at,
                rt: newTokens.refresh_token ?? authData?.rt,
                expires: newTokens.expiry_date ?? authData?.expires
            }
        })
    }

    const api = calendar({ version: "v3", auth })

    const { data: { items: calendars } } = await api.calendarList.list()

    if (!calendars) {
        return res.status(500).send()
    }

    const now = new Date()
    const nowISO = now.toISOString()
    const inTwoWeeks = new Date()
    inTwoWeeks.setDate(now.getDate() + 14)
    const inTwoWeeksISO = inTwoWeeks.toISOString()

    let events: ExtendedEvent[] = []

    for (const cal of calendars) {
        if (!cal.id) continue

        const { data } = await api.events.list({
            calendarId: cal.id,
            timeMin: nowISO,
            timeMax: inTwoWeeksISO,
            singleEvents: true
        })

        events = events.concat(
            data.items?.map<ExtendedEvent>(e => ({calendarId: cal.id! ,...e})) || []
        )
    }

    const { data: colors } = await api.colors.get()

    const resBody: CalendarResponse = { calendars, events, colors }

    res.json(resBody)
})

export = router
