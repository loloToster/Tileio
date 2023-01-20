import { CalendarResponse } from "@backend-types/types"
import createWidget from "../../ts/iframe-api"

import * as utils from "./utils"

const widget = createWidget()

widget.addContextMenuBtn({ text: "Open Calendar", action: () => window.open("https://calendar.google.com/") })

interface ParsedEvent {
    name: string | null | undefined,
    time?: string
}

interface ParsedDay {
    date: number,
    dayName: string,
    today: boolean,
    events: ParsedEvent[]
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

            if (ev.start.date) { // all-day event
                const start = new Date(ev.start.date)
                const end = new Date(ev.end!.date!)

                if (start <= day && day < end)
                    parsedEvents.push({ name: ev.summary })

            } else if (ev.start.dateTime) { // not all-day event
                const start = new Date(ev.start.dateTime)
                const end = new Date(ev.end!.dateTime!)

                if (utils.sameDay(start, end)) { // event starts and ends the same day
                    if (!utils.sameDay(start, day)) return

                    parsedEvents.push({
                        name: ev.summary,
                        time: `${utils.getHHMMfromDate(start)} - ${utils.getHHMMfromDate(end)}`
                    })
                } else {
                    if (utils.earilerDay(start, day) && utils.laterDay(end, day)) {
                        parsedEvents.push({ name: ev.summary })
                    } else if (utils.sameDay(start, day) && !utils.sameDay(end, day)) {
                        parsedEvents.push({ name: ev.summary, time: utils.getHHMMfromDate(start) })
                    } else if (utils.sameDay(end, day) && !utils.sameDay(start, day)) {
                        parsedEvents.push({ name: ev.summary, time: `Until ${utils.getHHMMfromDate(end)}` })
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

    return clone
}

function generateDay(day: ParsedDay, noEvents = false) {
    const clone = <HTMLDivElement>dayTemplate.content.cloneNode(true)

    if (day.today)
        clone.querySelector(".days__date")?.classList.add("active")

    clone.querySelector<HTMLDivElement>(".days__date-num")!.innerText = day.date.toString()
    clone.querySelector<HTMLDivElement>(".days__date-name")!.innerText = day.dayName

    if (noEvents) {
        clone.querySelector(".days__no-events")?.classList.add("active")
    } else {
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

let refreshing = false

async function updateCalendar() {
    if (refreshing) return

    refreshing = true
    refreshBtn.classList.add("active")

    try {
        // TODO: handle loading && error
        const res = await fetch("/dynamic-cells/google-calendar/calendar")
        const calRes: CalendarResponse = await res.json()

        const parsedCalendar = parseCalendar(calRes)
        generateCalendar(parsedCalendar)
    } finally {
        refreshBtn.classList.remove("active")
        refreshing = false
    }
}

refreshBtn.addEventListener("click", async () => updateCalendar())

updateCalendar()
setInterval(updateCalendar, 5 * 60 * 1000)
