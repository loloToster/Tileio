import express from "express"
import OpenWeatherAPI from "openweather-api-node"

const weather = new OpenWeatherAPI({
    key: process.env.WEATHER_KEY!
})

const router = express.Router()

router.get("/", (req, res) => {
    res.render("dynamic-cells/weather")
})

router.get("/data", async (req, res) => {
    if (typeof req.query.lat != "string" || typeof req.query.lon != "string")
        return res.status(400).send()

    const lat = parseInt(req.query.lat)
    const lon = parseInt(req.query.lon)

    const data = await weather.getEverything({
        coordinates: { lat, lon },
        units: "metric"
    })

    res.json(data)
})

export = router
