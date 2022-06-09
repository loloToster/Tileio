import express from "express"
import passport from "passport"

const router = express.Router()

router.get("/", async (req, res) => {
    res.render("login")
})

router.get("/logout", (req, res) => {
    req.logout()
    res.redirect("/")
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
