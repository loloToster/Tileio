import { CurrentWeather, DailyWeather, Location } from "openweather-api-node/typings"

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
        if (rain) rain.innerText = current.weather.rain.toString()
        if (humditiy) humditiy.innerText = current.weather.humidity.toString()
        if (wind) wind.innerText = current.weather.wind.speed.toString()
        if (pressure) pressure.innerText = current.weather.pressure.toString()
    } else {
        weatherIcon!.src = getIcon(daily[tab].weather.icon.raw)
        temp!.innerText = Math.round(daily[tab].weather.temp.day).toString()
        min!.innerText = Math.round(daily[tab].weather.temp.min).toString()
        max!.innerText = Math.round(daily[tab].weather.temp.max).toString()
        if (rain) rain.innerText = daily[tab].weather.rain.toString()
        if (humditiy) humditiy.innerText = daily[tab].weather.humidity.toString()
        if (wind) wind.innerText = daily[tab].weather.wind.speed.toString()
        if (pressure) pressure.innerText = daily[tab].weather.pressure.toString()
    }

    days.forEach((day, i) => {
        const icon = day.querySelector("img")
        icon!.src = getIcon(daily[i].weather.icon.raw)
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
            drawWeather(i, weather)
        })
    })

    setInterval(async () => {
        weather = await getWeather()
        drawWeather(curTab, weather)
    }, 5 * 60 * 1000)
}

main()
