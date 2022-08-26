import bcrypt from "bcrypt"
import passport from "passport"

import { Strategy as LocalStrategy } from "passport-local"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as DiscordStrategy } from "passport-discord"
import { Strategy as GithubStrategy } from "passport-github2"

import User, { IUser } from "../models/user"

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id)
    done(null, user)
})

passport.use(new LocalStrategy(
    {
        usernameField: "email"
    }, async (email, password, done) => {
        const user = await User.findOne({ strategyId: "lcl-" + email })

        if (!user)
            return done(null, false, { message: "Incorrect email or password" })

        try {
            if (await bcrypt.compare(password, user.hashedPassword!))
                done(null, user)
            else
                done(null, false, { message: "Incorrect email or password" })
        } catch (err) {
            done(err)
        }
    }
))

type parserFunc = (profile: any, sId: string) => Omit<IUser, "grid" | "dynamicCells">

async function verify(profile: any, done: Function, strategy: string, parser: parserFunc) {
    const strategyId = `${strategy}-${profile.id}`

    let user = await User.findOne({ strategyId })

    if (user) return done(null, user)

    user = await new User(parser(profile, strategyId)).save()

    done(null, user)
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback",
    scope: ["profile", "email"]
}, async (aT, rT, prof, cb) =>
    verify(prof, cb, "ggl", (p, sId) => {
        return {
            name: p.displayName,
            strategyId: sId,
            email: p._json.email || "",
            picture: p._json.picture || ""
        }
    })
))

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackURL: "/auth/discord/callback",
    scope: ["identify", "email"]
}, async (aT, rT, prof, cb) =>
    verify(prof, cb, "dsc", (p, sId) => {
        return {
            name: p.username,
            strategyId: sId,
            email: p.email || "",
            picture: p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png` : ""
        }
    })
))

passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: (process.env.GITHUB_REDIRECT || "") + "/auth/github/callback",
    scope: ["read:user", "user:email"]
}, async (aT: string, rT: string, prof: any, cb: Function) =>
    verify(prof, cb, "git", (p, sId) => {
        return {
            name: p.username || p.displayName,
            strategyId: sId,
            email: p.emails[0]?.value || "",
            picture: p._json.avatar_url
        }
    })
))
