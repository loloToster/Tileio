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

interface parsedEvent {
    name: string,
    time: string
}

type parsedCalendar = Array<{
    date: number,
    dayName: string,
    today: boolean,
    events: parsedEvent[]
}>

function getHHMMfromDate(d: Date) {
    return d.toTimeString().split(" ")[0].slice(0, -3)
}

function getOnlyDate(d: Date) {
    let newD = new Date(d)
    newD.setHours(0, 0, 0, 0)
    return newD
}

function parseCalendar(calendar: jsonIKalenderEvent[]) {
    let parsed: parsedCalendar = []

    const todayOnlyDate = getOnlyDate(new Date())
    let d = getOnlyDate(new Date())

    for (let i = 0; i < 14; i++) {
        const dEnd = new Date(d)
        dEnd.setHours(23, 59, 59, 999)
        let dayEvents: parsedEvent[] = []

        calendar.forEach(ev => {
            if (!ev.eventStart || !ev.eventEnd || typeof ev.summary != "string") return

            const allDay = ev.allDay || false
            const start = new Date(ev.eventStart)
            const end = new Date(ev.eventEnd)

            if (start >= dEnd || end <= d) return

            let time = ""

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

function generateCalendar(parsedCalendar: parsedCalendar) {
    daysElement.innerHTML = ""

    // todo: remove repetetive code
    if (!parsedCalendar[0]?.today) {
        const today = new Date()

        let dayEl = document.createElement("div")
        dayEl.classList.add("days__day")

        let dateWrapper = document.createElement("div")
        dateWrapper.classList.add("days__date-wrapper")

        let date = document.createElement("div")
        date.classList.add("active")
        date.classList.add("days__date")

        let dateNum = document.createElement("div")
        dateNum.classList.add("days__date-num")
        dateNum.innerText = today.getDate().toString()
        date.appendChild(dateNum)

        let dateName = document.createElement("div")
        dateName.classList.add("days__date-name")
        dateName.innerText = dayNames[today.getDay()]
        date.appendChild(dateName)

        dateWrapper.appendChild(date)
        dayEl.appendChild(dateWrapper)

        let eventsEl = document.createElement("div")
        eventsEl.classList.add("days__events")

        let noEvents = document.createElement("div")
        noEvents.classList.add("days__no-events")
        noEvents.innerText = "Nothing today"
        eventsEl.appendChild(noEvents)

        dayEl.appendChild(eventsEl)
        daysElement.appendChild(dayEl)
    }

    parsedCalendar.forEach(day => {
        let dayEl = document.createElement("div")
        dayEl.classList.add("days__day")

        let dateWrapper = document.createElement("div")
        dateWrapper.classList.add("days__date-wrapper")

        let date = document.createElement("div")
        if (day.today) date.classList.add("active")
        date.classList.add("days__date")

        let dateNum = document.createElement("div")
        dateNum.classList.add("days__date-num")
        dateNum.innerText = day.date.toString()
        date.appendChild(dateNum)

        let dateName = document.createElement("div")
        dateName.classList.add("days__date-name")
        dateName.innerText = day.dayName
        date.appendChild(dateName)

        dateWrapper.appendChild(date)
        dayEl.appendChild(dateWrapper)

        let eventsEl = document.createElement("div")
        eventsEl.classList.add("days__events")

        day.events.forEach(event => {
            let eventEl = document.createElement("div")
            eventEl.classList.add("days__event")

            let eventName = document.createElement("div")
            eventName.classList.add("days__event-name")
            eventName.innerText = event.name
            eventEl.appendChild(eventName)

            if (event.time) {
                let eventTime = document.createElement("div")
                eventTime.classList.add("days__event-time")
                eventTime.innerText = event.time
                eventEl.appendChild(eventTime)
            }

            eventsEl.appendChild(eventEl)
        })

        dayEl.appendChild(eventsEl)
        daysElement.appendChild(dayEl)
    })
}

async function updateCalendar() {
    const calendar: jsonIKalenderEvent[] = (await fetch(
        "/dynamic-cells/google-calendar/ical"
    ).then(r => r.json())).calendar

    const parsedCalendar = parseCalendar(calendar)
    generateCalendar(parsedCalendar)
}

document.querySelector<HTMLDivElement>(".header__month")!.innerText = months[new Date().getMonth()]

const refreshBtn = document.querySelector<HTMLButtonElement>(".header__btn--refresh")!
let refreshing = false

refreshBtn.addEventListener("click", async () => {
    refreshing = true
    refreshBtn.classList.add("active")

    try {
        await updateCalendar()
    } finally {
        refreshBtn.classList.remove("active")
        refreshing = false
    }
})

const editIcal = document.querySelector<HTMLButtonElement>(".header__btn--edit-ical")!
const editIcalModal = document.querySelector<HTMLDivElement>(".input-modal")!
const editIcalModalInput = document.querySelector<HTMLInputElement>(".input-modal__input")!
const saveBtn = document.querySelector<HTMLButtonElement>(".input-modal__save")!

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
})

refreshing = true
refreshBtn.classList.add("active")
updateCalendar().finally(() => {
    refreshBtn.classList.remove("active")
    refreshing = false
})
