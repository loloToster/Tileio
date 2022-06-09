import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as DiscordStrategy } from "passport-discord"
import { Strategy as GithubStrategy } from "passport-github2"

import User from "../models/user"

passport.serializeUser((user, done) => {
    // @ts-ignore: Property 'id' does not exist on type 'User'.
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id)
    done(null, user)
})

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback",
    scope: ["profile", "email"]
}, async (aT, rT, profile, done) => {
    const strategyId = "ggl-" + profile.id

    let user = await User.findOne({ strategyId: strategyId })

    if (user) return done(null, user)

    user = await new User({
        name: profile.displayName,
        strategyId: strategyId,
        email: profile._json.email || "",
        picture: profile._json.picture || ""
    }).save()

    done(null, user)
}))

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackURL: "/auth/discord/callback",
    scope: ["identify", "email"]
}, async (aT, rT, profile, done) => {
    const strategyId = "dsc-" + profile.id

    let user = await User.findOne({ strategyId: strategyId })

    if (user) return done(null, user)

    user = await new User({
        name: profile.username,
        strategyId: strategyId,
        email: profile.email || "",
        picture: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : ""
    }).save()

    done(null, user)
}))

passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: "/auth/github/callback",
    scope: ["read:user", "user:email"]
}, async (aT: string, rT: string, profile: any, done: Function) => {
    const strategyId = "git-" + profile.id

    let user = await User.findOne({ strategyId: strategyId })

    if (user) return done(null, user)

    user = await new User({
        name: profile.username || profile.displayName,
        strategyId: strategyId,
        email: profile.emails[0]?.value || "",
        picture: profile._json.avatar_url
    }).save()

    done(null, user)
}))
