import { CurrentWeather, DailyWeather, Location } from "openweather-api-node"

import createWidget from "../../ts/iframe-api"
import { setCSSVar } from "../../ts/utlis/utils"

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

const weatherIcon = document.querySelector<HTMLImageElement>(".weather__icon img")!
const temp = document.querySelector<HTMLSpanElement>(".weather__temp .data")!
const min = document.querySelector<HTMLSpanElement>(".weather__min .data")!
const max = document.querySelector<HTMLSpanElement>(".weather__max .data")!

const snowChart = document.querySelector<HTMLDivElement>(".weather__charts__wrapper--snow")!
const rainChart = document.querySelector<HTMLDivElement>(".weather__charts__wrapper--rain")!
const humidityChart = document.querySelector<HTMLDivElement>(".weather__charts__wrapper--humidity")!
const windChart = document.querySelector<HTMLDivElement>(".weather__charts__wrapper--wind")!

const snowChartIndicator = document.querySelector<HTMLSpanElement>(".weather__charts__wrapper--snow .data")!
const rainChartIndicator = document.querySelector<HTMLSpanElement>(".weather__charts__wrapper--rain .data")!
const humidityChartIndicator = document.querySelector<HTMLSpanElement>(".weather__charts__wrapper--humidity .data")!
const windChartIndicator = document.querySelector<HTMLSpanElement>(".weather__charts__wrapper--wind .data")!

const precipitationLabel = document.querySelector<HTMLSpanElement>(".weather__rain .label")!
const precipitation = document.querySelector<HTMLSpanElement>(".weather__rain .data")!
const humidity = document.querySelector<HTMLSpanElement>(".weather__humidity .data")!
const wind = document.querySelector<HTMLSpanElement>(".weather__wind .data")!
const pressure = document.querySelector<HTMLSpanElement>(".weather__pressure .data")!

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
    if (weatherIcon.src != icon) weatherIcon.src = icon
    temp.innerText = Math.round(data.cur).toString()
    min.innerText = Math.round(data.min).toString()
    max.innerText = Math.round(data.max).toString()

    if (data.rain && data.snow) {
        precipitationLabel.innerText = "Rain/Snow"
        precipitation.innerText = data.rain.toString() + "/" + data.snow.toString()
        rainChart.classList.remove("hide")
        snowChart.classList.remove("hide")
    } else if (data.snow && !data.rain) {
        precipitationLabel.innerText = "Snow"
        precipitation.innerText = data.snow.toString()
        rainChart.classList.add("hide")
        snowChart.classList.remove("hide")
    } else {
        precipitationLabel.innerText = "Rain"
        precipitation.innerText = data.rain.toString()
        rainChart.classList.remove("hide")
        snowChart.classList.add("hide")
    }

    const elToVal = [
        [snowChart, (data.snow / 15) * 100],
        [rainChart, (data.rain / 15) * 100],
        [humidityChart, data.humidity],
        [windChart, (data.windSpeed / 30) * 100]
    ] as const

    elToVal.forEach(
        ([el, val]) => setCSSVar(el, "percentage", val < 4 ? val + 4 : val)
    )

    snowChartIndicator.innerText = data.snow.toString()
    rainChartIndicator.innerText = data.rain.toString()
    humidityChartIndicator.innerText = data.humidity.toString()
    windChartIndicator.innerText = data.windSpeed.toString()

    humidity.innerText = data.humidity.toString()
    wind.innerText = data.windSpeed.toString()
    pressure.innerText = data.pressure.toString()
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
