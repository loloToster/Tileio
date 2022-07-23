import express from "express"
import OpenWeatherAPI from "openweather-api-node"
import User from "../../models/user"

const weather = new OpenWeatherAPI({
    key: process.env.WEATHER_KEY!
})

const router = express.Router()

router.get("/", (req, res) => {
    res.render("dynamic-cells/weather", { big: req.query.w == "4" })
})

router.get("/data", async (req, res) => {
    const user = req.user!

    const data = await weather.getEverything({
        coordinates: { lat: user.dynamicCells.weather?.lat || 51.5, lon: user.dynamicCells.weather?.lon || -0.11 },
        units: "metric"
    })

    res.json({ ...data, name: user.dynamicCells.weather?.name || "London, GB" })
})

router.get("/set-location", async (req, res) => {
    let name = req.query.name
    const lat = req.query.lat
    const lon = req.query.lon

    if (typeof name != "string" || typeof lat != "string" || typeof lon != "string")
        return res.status(400).send()

    name = decodeURIComponent(name)
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)

    if (name.length > 128 || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
        return res.status(400).send()

    await User.findByIdAndUpdate(req.user?.id, { "dynamicCells.weather": { lat: latitude, lon: longitude, name } })
    res.send()
})

router.get("/search", async (req, res) => {
    if (typeof req.query.q != "string") return res.status(400).send()

    const data = await weather.getAllLocations(req.query.q)

    res.json(data)
})

export = router
