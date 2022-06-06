import passport from "passport"
import { Strategy } from "passport-google-oauth20"

import User from "../models/user"

passport.serializeUser((user, done) => {
    // @ts-ignore: Property 'id' does not exist on type 'User'.
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id)
    done(null, user)
})

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    callbackURL: "/auth/callback"
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ googleId: profile.id })

    if (user) return done(null, user)

    user = await new User({
        name: profile.displayName,
        googleId: profile.id,
        email: profile._json.email || "",
        picture: profile._json.picture || ""
    }).save()

    done(null, user)
}))
