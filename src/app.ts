import dotenv from "dotenv"
import "express-async-errors"
import express, { ErrorRequestHandler } from "express"
import cookieSession from "cookie-session"
import passport from "passport"
import mongoose from "mongoose"
import fs from "fs"
import path from "path"

import { IUser } from "./models/user"

declare global {
    namespace Express {
        interface User extends IUser {
            id?: string
        }
    }
}

dotenv.config()

const app = express()

app.set("view engine", "ejs")
app.set("views", __dirname + "/public/views")

require(__dirname + "/config/passport-config")

app.use(cookieSession({
    maxAge: parseInt(process.env.COOKIE_AGE || "0") || 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_SECRET!]
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

function loadRouters(app: express.Application, dir: string, prefix = "") {
    let fullPath = path.join(dir, "root.js")
    if (fs.existsSync(fullPath))
        app.use(`${prefix}/`, require(fullPath))
    fullPath = path.join(dir, "root.ts")
    if (fs.existsSync(fullPath))
        app.use(`${prefix}/`, require(fullPath))
    fs.readdirSync(dir).forEach((x) => {
        if (x.startsWith("_")) return
        fullPath = path.join(dir, x)
        if (fs.lstatSync(fullPath).isDirectory()) {
            loadRouters(app, fullPath, `${prefix}/${x}`)
        } else if (x.match(/\.(js|ts)$/)) {
            let name = x.slice(0, -3)
            if (name == "root") return
            app.use(`${prefix}/${name}`, require(fullPath))
        }
    })
}

loadRouters(app, __dirname + "/routers")

app.get("*", (req, res) => {
    res.status(404).render("not-found")
})

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err)
    res.status(500).send()
}

app.use(errorHandler)

const MONGO_URL = process.env.MONGO!
console.log("connecting to mongo:", MONGO_URL)
mongoose.connect(MONGO_URL)

const port = process.env.PORT || 80

mongoose.connection.once("open", () => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`)
    })
})
