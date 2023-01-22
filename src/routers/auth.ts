import express from "express"
import flash from "express-flash"
import passport from "passport"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import { randomBytes } from "crypto"
import useragent from "express-useragent"

import User from "../models/user"
import UnvalidatedUser from "../models/unvalidatedUser"

const router = express.Router()

router.use(flash())

router.use(useragent.express(), (req, res, next) => {
    if (req.useragent?.isMobile)
        res.render("mobile-login")
    else
        next()
})

router.get("/", async (req, res) => {
    res.render("login")
})

router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/")
    })
})

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASSWORD
    }
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
            msg: "Account with this email is already waiting for validation"
        })

    if (await User.exists({ strategyId: "lcl-" + email }))
        return res.status(400).json({
            field: "email",
            msg: "There already exists a user with this email"
        })

    const u = await new UnvalidatedUser({
        name: username ? username : undefined,
        email,
        hashedPassword: await bcrypt.hash(password, 10),
        token: randomBytes(32).toString("hex") + email
    }).save()

    await emailTransporter.sendMail({
        from: `Tileio <${process.env.APP_EMAIL}>`,
        to: u.email,
        subject: "Verify your account",
        html: `Verify your account by clicking <a href="${req.protocol}://${req.headers.host}/auth/validate-email/${encodeURIComponent(u.token)}">here</a>. `
    })

    res.send()
})

router.get("/validate-email/:token", async (req, res) => {
    const token = req.params.token

    if (!token)
        return res.status(400).render("email-verified", { msg: "No token in requset" })

    const validatedUser = await UnvalidatedUser.findOneAndDelete({ token })

    if (!validatedUser)
        return res.status(400).render("email-verified", { msg: "No user with specified token" })

    await new User({
        name: validatedUser.name,
        strategyId: "lcl-" + validatedUser.email,
        email: validatedUser.email,
        hashedPassword: validatedUser.hashedPassword,
        picture: ""
    }).save()

    res.render("email-verified", { msg: "Successfully verified account" })
})

router.post("/local",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/auth",
        failureFlash: true
    })
)

router.get("/google", passport.authenticate("google"))

router.get("/google/callback",
    passport.authenticate("google", {
        successRedirect: "/"
    })
)

router.get("/discord", passport.authenticate("discord"))

router.get("/discord/callback",
    passport.authenticate("discord", {
        successRedirect: "/"
    })
)

router.get("/github", passport.authenticate("github"))

router.get("/github/callback",
    passport.authenticate("github", {
        successRedirect: "/"
    })
)

export = router
