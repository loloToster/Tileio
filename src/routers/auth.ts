import express from "express"
import passport from "passport"
import bcrypt from "bcrypt"
import { randomBytes } from "crypto"

import UnvalidatedUser from "../models/unvalidatedUser"

const router = express.Router()

router.get("/", async (req, res) => {
    res.render("login")
})

router.get("/logout", (req, res) => {
    req.logout()
    res.redirect("/")
})

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

router.post("/create-account", async (req, res) => {
    const username = req.body.username
    const email = req.body.email?.toLowerCase()
    const password = req.body.password

    if (typeof username != "string" ||
        typeof email != "string" ||
        typeof password != "string")
        return res.status(400).send()

    if (username.length > 32)
        return res.status(400).json({
            field: "username",
            msg: "The username is too long (max 32 characters)"
        })

    if (!email.match(emailRegex))
        return res.status(400).json({
            field: "email",
            msg: "The email is invalid"
        })

    if (password.length < 8)
        return res.status(400).json({
            field: "password",
            msg: "The password must contain at least 8 characters"
        })

    if (await UnvalidatedUser.exists({ email }))
        return res.status(400).json({
            field: "email",
            msg: "This email is already waiting for validation"
        })

    const u = await new UnvalidatedUser({
        name: username ? username : undefined,
        email,
        hashedPassword: await bcrypt.hash(password, 10),
        token: encodeURIComponent(randomBytes(32).toString("hex") + email)
    }).save()

    console.log(u)
})

router.get("/google", passport.authenticate("google"))

router.get("/google/callback", passport.authenticate("google"), (req, res) => {
    res.redirect("/")
})

router.get("/discord", passport.authenticate("discord"))

router.get("/discord/callback", passport.authenticate("discord"), (req, res) => {
    res.redirect("/")
})

router.get("/github", passport.authenticate("github"))

router.get("/github/callback", passport.authenticate("github"), (req, res) => {
    res.redirect("/")
})

export = router
