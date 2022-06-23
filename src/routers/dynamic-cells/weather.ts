import express from "express"
import OpenWeatherAPI from "openweather-api-node"
import User from "../../models/user"

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

    const user = req.user!

    let locationName = user.dynamicCells.weather?.name
    const lat = parseFloat(req.query.lat)
    const lon = parseFloat(req.query.lon)

    if (lat != user.dynamicCells.weather?.lat || lon != user.dynamicCells.weather?.lon) {
        const location = await weather.getLocation({
            coordinates: { lat, lon }
        })
        locationName = location?.name
        await User.findByIdAndUpdate(user.id, { "dynamicCells.weather": { lat, lon, name: locationName } })
    }

    const data = await weather.getEverything({
        coordinates: { lat, lon },
        units: "metric"
    })

    res.json({ ...data, name: locationName })
})

export = router
