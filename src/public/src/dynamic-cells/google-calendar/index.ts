import { calendar_v3 } from "@googleapis/calendar"
import { CalendarResponse } from "@backend-types/types"
import createWidget from "../../ts/iframe-api"

import * as utils from "./utils"

const widget = createWidget()

widget.addContextMenuBtn({ text: "Open Calendar", action: () => window.open("https://calendar.google.com/") })

const DARK_COLORS_MAP: Record<string, string | undefined> = {
    "#a4bdfc": "#324191",
    "#7ae7bf": "#299261",
    "#dbadff": "#721d88",
    "#ff887c": "#7f1f17",
    "#fbd75b": "#866406",
    "#ffb878": "#b83309",
    "#46d6db": "#027cb7",
    "#e1e1e1": "#494f52",
    "#5484ed": "#2d3975",
    "#51b749": "#096636",
    "#dc2127": "#aa0000"
}

interface ParsedEvent {
    name: string | null | undefined,
    time?: string,
    color?: string
}

interface ParsedDay {
    date: number,
    dayName: string,
    today: boolean,
    events: ParsedEvent[]
}

/**
 * Gets color of the event, maps it to dark mode equivalent and returns it
 */
function getColors(colors: calendar_v3.Schema$Colors, ev: calendar_v3.Schema$Event) {
    const bg = colors.event && ev.colorId ?
        colors.event[ev.colorId].background :
        null

    if (!bg) return undefined

    return DARK_COLORS_MAP[bg] ?? bg
}

function parseCalendar(calRes: CalendarResponse) {
    let parsed: ParsedDay[] = []

    calRes.events.sort((a, b) => {
        const aStart = new Date(a.start?.dateTime || a.start?.date || 0).getTime()
        const bStart = new Date(b.start?.dateTime || b.start?.date || 0).getTime()

        return aStart - bStart
    })

    for (let d = 0; d < 14; d++) {
        const day = utils.addDays(new Date(), d)
        const date = day.getDate()

        let parsedEvents: ParsedEvent[] = []

        calRes.events.forEach(ev => {
            if (!ev.start) return

            const color = getColors(calRes.colors, ev)

            if (ev.start.date) { // all-day event
                const start = new Date(ev.start.date)
                const end = new Date(ev.end!.date!)

                if (start <= day && day < end)
                    parsedEvents.push({ name: ev.summary, color })

            } else if (ev.start.dateTime) { // not all-day event
                const start = new Date(ev.start.dateTime)
                const end = new Date(ev.end!.dateTime!)

                if (utils.sameDay(start, end)) { // event starts and ends the same day
                    if (!utils.sameDay(start, day)) return

                    parsedEvents.push({
                        name: ev.summary,
                        time: `${utils.getHHMMfromDate(start)} - ${utils.getHHMMfromDate(end)}`,
                        color
                    })
                } else {
                    if (utils.earilerDay(start, day) && utils.laterDay(end, day)) {
                        parsedEvents.push({ name: ev.summary, color })
                    } else if (utils.sameDay(start, day) && !utils.sameDay(end, day)) {
                        parsedEvents.push({ name: ev.summary, time: utils.getHHMMfromDate(start), color })
                    } else if (utils.sameDay(end, day) && !utils.sameDay(start, day)) {
                        parsedEvents.push({ name: ev.summary, time: `Until ${utils.getHHMMfromDate(end)}`, color })
                    }
                }
            }
        })

        if (parsedEvents.length) {
            parsed.push({
                date,
                dayName: utils.DAY_NAMES[day.getDay()],
                events: parsedEvents,
                today: d === 0
            })
        }
    }

    return parsed
}

const daysElement = document.querySelector(".days")!
const eventTemplate = <HTMLTemplateElement>document.getElementById("event-template")!
const dayTemplate = <HTMLTemplateElement>document.getElementById("day-template")!

function generateEvent(ev: ParsedEvent) {
    const clone = <HTMLDivElement>eventTemplate.content.cloneNode(true)

    clone.querySelector<HTMLDivElement>(".days__event-name")!.innerText = ev.name || "No title"

    if (ev.time)
        clone.querySelector<HTMLDivElement>(".days__event-time")!.innerText = ev.time

    if (ev.color)
        clone.querySelector<HTMLDivElement>(".days__event")!.style.backgroundColor = ev.color

    return clone
}

function generateDay(day: ParsedDay, noEvents = false) {
    const clone = <HTMLDivElement>dayTemplate.content.cloneNode(true)

    if (day.today)
        clone.querySelector(".days__date")?.classList.add("active")

    clone.querySelector<HTMLDivElement>(".days__date-num")!.innerText = day.date.toString()
    clone.querySelector<HTMLDivElement>(".days__date-name")!.innerText = day.dayName

    if (!noEvents) {
        clone.querySelector(".days__no-events")?.remove()
        const eventsWrapper = clone.querySelector(".days__events")!
        day.events.forEach(ev => {
            eventsWrapper.appendChild(generateEvent(ev))
        })
    }

    return clone
}

function generateCalendar(parsedCalendar: ParsedDay[]) {
    daysElement.innerHTML = ""

    if (!parsedCalendar[0]?.today) {
        const today = new Date()

        daysElement.appendChild(
            generateDay({
                date: today.getDate(),
                dayName: utils.DAY_NAMES[today.getDay()],
                today: true,
                events: []
            }, true)
        )
    }

    parsedCalendar.forEach(day => {
        daysElement.appendChild(generateDay(day))
    })
}

document.querySelector<HTMLDivElement>(".header__month")!.innerText = utils.MONTH_NAMES[new Date().getMonth()]

const refreshBtn = document.querySelector<HTMLButtonElement>(".header__btn--refresh")!
const placeholder = document.querySelector<HTMLDivElement>(".placeholder")!
const bigErr = document.querySelector<HTMLDivElement>(".error")!

let refreshing = false
let dataWasFetched = false

async function updateCalendar() {
    if (refreshing) return

    refreshing = true

    bigErr.classList.remove("active")
    refreshBtn.classList.remove("err")
    refreshBtn.classList.add("active")
    if (!dataWasFetched) placeholder.classList.add("active")

    try {
        const res = await fetch("/dynamic-cells/google-calendar/calendar")

        if (!res.ok) throw Error() // go to catch block

        const calRes: CalendarResponse = await res.json()

        const parsedCalendar = parseCalendar(calRes)
        generateCalendar(parsedCalendar)
        dataWasFetched = true
    } catch {
        if (dataWasFetched) {
            widget.createError("Could not get the calendar")
        } else {
            daysElement.innerHTML = ""
            bigErr.classList.add("active")
        }

        refreshBtn.classList.add("err")
    } finally {
        placeholder.classList.remove("active")
        refreshBtn.classList.remove("active")
        refreshing = false
    }
}

refreshBtn.addEventListener("click", async () => updateCalendar())

updateCalendar()
setInterval(updateCalendar, 5 * 60 * 1000)
