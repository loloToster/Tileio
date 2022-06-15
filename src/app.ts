import dotenv from "dotenv"
import express from "express"
import cookieSession from "cookie-session"
import passport from "passport"
import mongoose from "mongoose"
import fs from "fs"
import path from "path"

dotenv.config()

const app = express()

app.set("view engine", "ejs")
app.set("views", __dirname + "/views")

require(__dirname + "/config/passport-config")

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_SECRET!]
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())

function loadRouters(dir: string, prefix: string = "") {
    fs.readdirSync(dir)
        .forEach((x) => {
            const fullPath = path.join(dir, x)
            if (fs.lstatSync(fullPath).isDirectory())
                loadRouters(fullPath, `${prefix}/${x}`)
            else if (x.endsWith(".ts")) {
                let name = x.slice(0, -3)
                if (name == "root") name = ""
                app.use(`${prefix}/${name}`, require(fullPath))
            }
        })
}

loadRouters(__dirname + "/routers")

mongoose.connect(process.env.MONGO!)

const port = process.env.PORT

mongoose.connection.once("open", () => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`)
    })
})
