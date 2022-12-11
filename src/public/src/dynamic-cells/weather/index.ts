import { CurrentWeather, DailyWeather, Location } from "openweather-api-node/typings"
import createWidget from "../../ts/iframe-api"

createWidget()

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

const location = document.querySelector<HTMLElement>(".location")
const locationCity = document.querySelector<HTMLSpanElement>(".location__city")
const searchLocation = document.querySelector<HTMLImageElement>(".location__search")
const searchLocationInp = document.querySelector<HTMLInputElement>(".location__search-input")
const searchSuggestions = document.querySelector<HTMLDivElement>(".location__suggestions")
const locationDay = document.querySelector<HTMLSpanElement>(".location__day")

const weatherIcon = document.querySelector<HTMLImageElement>(".weather__icon img")
const temp = document.querySelector<HTMLSpanElement>(".weather__temp .data")
const min = document.querySelector<HTMLSpanElement>(".weather__min .data")
const max = document.querySelector<HTMLSpanElement>(".weather__max .data")
const precipitationLabel = document.querySelector<HTMLSpanElement>(".weather__rain .label")
const precipitation = document.querySelector<HTMLSpanElement>(".weather__rain .data")
const humditiy = document.querySelector<HTMLSpanElement>(".weather__humidity .data")
const wind = document.querySelector<HTMLSpanElement>(".weather__wind .data")
const pressure = document.querySelector<HTMLSpanElement>(".weather__pressure .data")

const days = document.querySelectorAll(".days__day")

const getIcon = (i: string) => `https://cdn.jsdelivr.net/npm/@bybas/weather-icons@2.0.0/production/fill/openweathermap/${i}.svg`

interface TabData {
    icon: string,
    cur: number,
    min: number,
    max: number,
    rain: number,
    snow: number,
    humidity: number,
    windSpeed: number,
    pressure: number
}

function drawTabData(data: TabData) {
    const icon = getIcon(data.icon)
    if (weatherIcon!.src != icon) weatherIcon!.src = icon
    temp!.innerText = Math.round(data.cur).toString()
    min!.innerText = Math.round(data.min).toString()
    max!.innerText = Math.round(data.max).toString()

    if (precipitation && precipitationLabel) {
        if (data.rain && data.snow) {
            precipitationLabel.innerText = "Rain/Snow"
            precipitation.innerText = data.rain.toString() + "/" + data.snow.toString()
        } else if (data.snow && !data.rain) {
            precipitationLabel.innerText = "Snow"
            precipitation.innerText = data.snow.toString()
        } else {
            precipitationLabel.innerText = "Rain"
            precipitation.innerText = data.rain.toString()
        }

    }

    if (humditiy) humditiy.innerText = data.humidity.toString()
    if (wind) wind.innerText = data.windSpeed.toString()
    if (pressure) pressure.innerText = data.pressure.toString()
}

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
        drawTabData({
            icon: current.weather.icon.raw,
            cur: current.weather.temp.cur,
            min: daily[0].weather.temp.min,
            max: daily[0].weather.temp.max,
            rain: current.weather.rain,
            snow: current.weather.snow,
            humidity: current.weather.humidity,
            windSpeed: current.weather.wind.speed,
            pressure: current.weather.pressure
        })
    } else {
        drawTabData({
            icon: daily[tab].weather.icon.raw,
            cur: daily[tab].weather.temp.day,
            min: daily[tab].weather.temp.min,
            max: daily[tab].weather.temp.max,
            rain: daily[tab].weather.rain,
            snow: daily[tab].weather.snow,
            humidity: daily[tab].weather.humidity,
            windSpeed: daily[tab].weather.wind.speed,
            pressure: daily[tab].weather.pressure
        })
    }

    days.forEach((day, i) => {
        const icon = day.querySelector("img")
        const iconUrl = getIcon(daily[i].weather.icon.raw)
        if (icon!.src != iconUrl) icon!.src = iconUrl
    })
}

async function getWeather() {
    const data = await fetch(
        `/dynamic-cells/weather/data`
    ).then(r => r.json())

    return data
}

async function main() {
    let curTab = 0
    let weather = await getWeather()

    searchLocation?.addEventListener("click", () => {
        location?.classList.toggle("searching")
    })

    searchLocationInp?.addEventListener("input", async () => {
        if (searchLocationInp.value == "") {
            searchSuggestions!.innerHTML = ""
            return
        }
        const res = await fetch("/dynamic-cells/weather/search?q=" + encodeURIComponent(searchLocationInp!.value))
        const data: Location[] = await res.json()

        searchSuggestions!.innerHTML = ""
        data.forEach(l => {
            let suggestion = document.createElement("div")
            suggestion.classList.add("location__suggestion")
            const name = `${l.name}, ${l.country}`
            suggestion.innerText = name
            suggestion.addEventListener("click", async () => {
                location?.classList.remove("searching")
                await fetch(`/dynamic-cells/weather/set-location?name=${encodeURIComponent(name)}&lat=${l.lat}&lon=${l.lon}`)
                weather = await getWeather()
                drawWeather(curTab, weather)
            })
            searchSuggestions?.appendChild(suggestion)
        })
    })

    drawWeather(curTab, weather)

    days.forEach((day, i) => {
        day.addEventListener("click", () => {
            days.forEach(d => d.classList.remove("active"))
            day.classList.add("active")
            curTab = i
            drawWeather(i, weather)
        })
    })

    setInterval(async () => {
        weather = await getWeather()
        drawWeather(curTab, weather)
    }, 5 * 60 * 1000)
}

main()
