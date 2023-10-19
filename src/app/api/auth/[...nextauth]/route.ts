import NextAuth from "next-auth"

import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import GithubProvider from "next-auth/providers/github"

import db from "@/lib/db"

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET
} = process.env

if (
  !(
    GOOGLE_CLIENT_ID &&
    GOOGLE_CLIENT_SECRET &&
    DISCORD_CLIENT_ID &&
    DISCORD_CLIENT_SECRET &&
    GITHUB_CLIENT_ID &&
    GITHUB_CLIENT_SECRET
  )
)
  throw new Error("Not all providers vars specified")

const handler = NextAuth({
  secret: process.env.COOKIE_SECRET,
  pages: {
    signIn: "/",
    error: "/login",
    signOut: "/home"
  },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET
    }),
    DiscordProvider({
      clientId: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET
    }),
    GithubProvider({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET
    })
  ],
  adapter: db.nextAuthAdapter()
})

export { handler as GET, handler as POST }
