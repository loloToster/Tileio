import express from "express"
import cookieSession from "express-session"
import dotenv from "dotenv"
import passport from "passport"
import mongoose from "mongoose"

dotenv.config()

const app = express()

app.set("view engine", "ejs")
app.set("views", __dirname + "/views")

require(__dirname + "/config/passport-config")

app.use(cookieSession({
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET!,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use("/", require(__dirname + "/routers/root"))
app.use("/auth", require(__dirname + "/routers/auth"))

app.use("/static", express.static(__dirname + "/public/static"))

mongoose.connect(process.env.MONGO!)

const port = process.env.PORT

mongoose.connection.once("open", () => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`)
    })
})
