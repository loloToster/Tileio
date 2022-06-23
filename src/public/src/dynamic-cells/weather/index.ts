import { CurrentWeather, DailyWeather } from "openweather-api-node/typings"

const dayNames = [
    { long: "Currently", short: "Today" },
    { long: "Monday", short: "Mon" },
    { long: "Tuesday", short: "Tue" },
    { long: "Wednesday", short: "Wed" },
    { long: "Thursday", short: "Thu" },
    { long: "Friday", short: "Fri" },
    { long: "Saturday", short: "Sat" },
    { long: "Sunday", short: "Sun" },
]

const locationCity = document.querySelector<HTMLSpanElement>(".location__city")
const locationDay = document.querySelector<HTMLSpanElement>(".location__day")

const weatherIcon = document.querySelector<HTMLImageElement>(".weather__icon img")
const temp = document.querySelector<HTMLSpanElement>(".weather__temp .data")
const min = document.querySelector<HTMLSpanElement>(".weather__min .data")
const max = document.querySelector<HTMLSpanElement>(".weather__max .data")
const rain = document.querySelector<HTMLSpanElement>(".weather__rain .data")
const humditiy = document.querySelector<HTMLSpanElement>(".weather__humidity .data")
const wind = document.querySelector<HTMLSpanElement>(".weather__wind .data")
const pressure = document.querySelector<HTMLSpanElement>(".weather__pressure .data")

const days = document.querySelectorAll(".days__day")

const getIcon = (i: string) => `https://cdn.jsdelivr.net/npm/@bybas/weather-icons@2.0.0/production/fill/openweathermap/${i}.svg`

function drawWeather(tab: number, data: any) {
    locationCity!.innerText = data.name || "Your Location"
    const currentDay = new Date().getDay()

    days.forEach((day, i) => {
        if (i == 0) return

        const name = day.querySelector<HTMLDivElement>(".days__day__name")
        name!.innerText = dayNames[i + currentDay > 7 ? i + currentDay - 7 : i + currentDay].short
    })

    locationDay!.innerText = dayNames[tab == 0 ? tab : currentDay + tab > 7 ? currentDay + tab - 7 : currentDay + tab].long

    const current: CurrentWeather = data.current
    const daily: DailyWeather[] = data.daily

    if (tab == 0) {
        weatherIcon!.src = getIcon(current.weather.icon.raw)
        temp!.innerText = Math.round(current.weather.temp.cur).toString()
        min!.innerText = Math.round(daily[0].weather.temp.min).toString()
        max!.innerText = Math.round(daily[0].weather.temp.max).toString()
        rain!.innerText = current.weather.rain.toString()
        humditiy!.innerText = current.weather.humidity.toString()
        wind!.innerText = current.weather.wind.speed.toString()
        pressure!.innerText = current.weather.pressure.toString()
    } else {
        weatherIcon!.src = getIcon(daily[tab].weather.icon.raw)
        temp!.innerText = Math.round(daily[tab].weather.temp.day).toString()
        min!.innerText = Math.round(daily[tab].weather.temp.min).toString()
        max!.innerText = Math.round(daily[tab].weather.temp.max).toString()
        rain!.innerText = daily[tab].weather.rain.toString()
        humditiy!.innerText = daily[tab].weather.humidity.toString()
        wind!.innerText = daily[tab].weather.wind.speed.toString()
        pressure!.innerText = daily[tab].weather.pressure.toString()
    }

    days.forEach((day, i) => {
        const icon = day.querySelector("img")
        icon!.src = getIcon(daily[i].weather.icon.raw)
    })
}

function getWeather(): Promise<any> {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const data = await fetch(
                `/dynamic-cells/weather/data?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
            ).then(r => r.json())

            resolve(data)
        })
    })
}

let curTab = 0
async function main() {
    let weather = await getWeather()
    drawWeather(curTab, weather)

    days.forEach((day, i) => {
        day.addEventListener("click", () => {
            days.forEach(d => d.classList.remove("active"))
            day.classList.add("active")
            drawWeather(i, weather)
        })
    })

    setInterval(async () => {
        weather = await getWeather()
        drawWeather(curTab, weather)
    }, 5 * 60 * 1000)
}

main()
