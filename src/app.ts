import dotenv from "dotenv"
import express from "express"
import sslRedirect from "heroku-ssl-redirect"
import cookieSession from "cookie-session"
import passport from "passport"
import mongoose from "mongoose"
import axios from "axios"
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

app.use(sslRedirect())

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

mongoose.connect(process.env.MONGO!)

const port = process.env.PORT

mongoose.connection.once("open", () => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`)

        // keep heroku awake
        const url = process.env.HEROKU_URL
        if (!url) return
        console.log(`Keeping ${url} awake.`)
        setInterval(() => {
            axios.get(url).catch(console.error)
        }, 10 * 60 * 1000)
    })
})
