import { IKalenderEvent } from "kalender-events"
import createWidget from "../../ts/iframe-api"

createWidget()

const dayNames = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
]

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

interface jsonIKalenderEvent extends Omit<IKalenderEvent, "eventEnd" | "eventStart"> {
    eventEnd?: string,
    eventStart?: string
}

function addDays(date: Date, days: number) {
    var result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

interface ParsedEvent {
    name: string,
    time?: string
}

interface ParsedDay {
    date: number,
    dayName: string,
    today: boolean,
    events: ParsedEvent[]
}

function getHHMMfromDate(d: Date) {
    return d.toTimeString().split(" ")[0].slice(0, -3)
}

function getOnlyDate(d: Date) {
    let newD = new Date(d)
    newD.setHours(0, 0, 0, 0)
    return newD
}

function parseCalendar(calendar: jsonIKalenderEvent[]) {
    let parsed: ParsedDay[] = []

    const todayOnlyDate = getOnlyDate(new Date())
    let d = getOnlyDate(new Date())

    for (let i = 0; i < 14; i++) {
        const dEnd = new Date(d)
        dEnd.setHours(23, 59, 59, 999)
        let dayEvents: ParsedEvent[] = []

        calendar.forEach(ev => {
            if (!ev.eventStart || !ev.eventEnd || typeof ev.summary != "string") return

            const allDay = ev.allDay || false
            const start = new Date(ev.eventStart)
            const end = new Date(ev.eventEnd)

            if (start >= dEnd || end <= d) return

            let time: string | undefined

            if (!allDay) {
                let startOnlyDate = getOnlyDate(start)
                let endOnlyDate = getOnlyDate(end)
                if (startOnlyDate.getTime() != endOnlyDate.getTime()) {
                    if (startOnlyDate.getTime() == d.getTime()) {
                        time = getHHMMfromDate(start)
                    } else if (endOnlyDate.getTime() == d.getTime()) {
                        time = `To ${getHHMMfromDate(end)}`
                    }
                } else {
                    time = `${getHHMMfromDate(start)} - ${getHHMMfromDate(end)}`
                }
            }

            dayEvents.push({
                name: ev.summary,
                time
            })
        })

        if (dayEvents.length)
            parsed.push({
                date: d.getDate(),
                dayName: dayNames[d.getDay()],
                today: todayOnlyDate.getTime() == d.getTime(),
                events: dayEvents
            })

        d = addDays(d, 1)
    }

    return parsed
}

const daysElement = document.querySelector(".days")!
const eventTemplate = <HTMLTemplateElement>document.getElementById("event-template")!
const dayTemplate = <HTMLTemplateElement>document.getElementById("day-template")!

function generateEvent(ev: ParsedEvent) {
    const clone = <HTMLDivElement>eventTemplate.content.cloneNode(true)

    clone.querySelector<HTMLDivElement>(".days__event-name")!.innerText = ev.name

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
                dayName: dayNames[today.getDay()],
                today: true,
                events: []
            }, true)
        )
    }

    parsedCalendar.forEach(day => {
        daysElement.appendChild(generateDay(day))
    })
}

document.querySelector<HTMLDivElement>(".header__month")!.innerText = months[new Date().getMonth()]

const editIcal = document.querySelector<HTMLButtonElement>(".header__btn--edit-ical")!
const editIcalModal = document.querySelector<HTMLDivElement>(".input-modal")!
const editIcalModalInput = document.querySelector<HTMLInputElement>(".input-modal__input")!
const saveBtn = document.querySelector<HTMLButtonElement>(".input-modal__save")!
const refreshBtn = document.querySelector<HTMLButtonElement>(".header__btn--refresh")!

let refreshing = false

async function updateCalendar() {
    if (refreshing) return

    refreshing = true
    refreshBtn.classList.add("active")

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    try {
        const calendar: jsonIKalenderEvent[] = (await fetch(
            "/dynamic-cells/google-calendar/ical?timezone=" + encodeURIComponent(timezone)
        ).then(r => r.json())).calendar

        const parsedCalendar = parseCalendar(calendar)
        generateCalendar(parsedCalendar)
    } finally {
        refreshBtn.classList.remove("active")
        refreshing = false
    }
}

refreshBtn.addEventListener("click", async () => updateCalendar())

editIcal.addEventListener("click", () => {
    editIcalModal.classList.add("active")
})

editIcalModal.addEventListener("click", e => {
    if (e.target == editIcalModal)
        editIcalModal.classList.remove("active")
})

saveBtn.addEventListener("click", async () => {
    const newUrl = encodeURIComponent(editIcalModalInput.value)
    await fetch("/dynamic-cells/google-calendar/ical?url=" + newUrl, {
        method: "PUT"
    })
    editIcalModal.classList.remove("active")
    updateCalendar()
})

updateCalendar()
setInterval(updateCalendar, 5 * 60 * 1000)
