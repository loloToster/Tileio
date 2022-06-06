import express from "express"
import passport from "passport"

const router = express.Router()

router.get("/", async (req, res) => {
    res.redirect("/auth/login")
})

router.get("/login", passport.authenticate("google", {
    scope: ["profile", "email"]
}))

router.get("/callback", passport.authenticate("google"), (req, res) => {
    res.redirect("/")
})

export = router
