import express from "express"
import SpotifyApiNode from "spotify-web-api-node"

import User from "../../models/user"

const scopes = [
    "ugc-image-upload",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
    "app-remote-control",
    "user-read-email",
    "user-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-read-private",
    "playlist-modify-private",
    "user-library-modify",
    "user-library-read",
    "user-top-read",
    "user-read-playback-position",
    "user-read-recently-played",
    "user-follow-read",
    "user-follow-modify"
]


const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

const spotifyApi = new SpotifyApiNode({
    clientId,
    clientSecret,
    redirectUri: process.env.SPOTIFY_CALLBACK?.replace("{PORT}", process.env.PORT || "80")
})

const router = express.Router()

// TODO: move to db
let users: {
    [id: string]: { at: string, rt: string, expires: number }
} = {}

router.get("/", (req, res) => {
    const spotifyUser = req.user!.dynamicCells.spotify?.at

    if (spotifyUser)
        res.render("dynamic-cells/spotify")
    else
        res.render("dynamic-cells/spotify-login")
})

router.get("/login", (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes, "some status", true))
})

router.get("/logout", async (req, res) => {
    await User.findByIdAndUpdate(req.user!.id, { $unset: { "dynamicCells.spotify": 1 } })

    res.redirect("/dynamic-cells/spotify")
})

router.get("/redirect", async (req, res) => {
    const code = req.query.code
    if (!code) return console.log("No code in callback")

    const data = await spotifyApi.authorizationCodeGrant(code.toString())

    await User.findByIdAndUpdate(req.user!.id, {
        "dynamicCells.spotify": {
            at: data.body.access_token,
            rt: data.body.refresh_token,
            expires: Date.now() + data.body.expires_in * 1000
        }
    })

    res.redirect("/")
})

router.get("/access-token", async (req, res) => {
    const spotifyData = req.user!.dynamicCells.spotify
    if (!spotifyData) return res.status(403).send()

    if (Date.now() > spotifyData.expires) {
        console.log("refreshing token")

        let refresher = new SpotifyApiNode({
            clientId,
            clientSecret,
            refreshToken: spotifyData.rt
        })

        const atResponse = await new Promise<{
            access_token: string,
            expires_in: number
        } | null>((resolve, reject) => {
            refresher.refreshAccessToken((err, at) => {
                if (err) return reject(err)

                resolve(at.body)
            })
        })

        if (!atResponse) return console.log("error", atResponse)

        spotifyData.at = atResponse.access_token
        spotifyData.expires = Date.now() + atResponse.expires_in * 1000

        await User.findByIdAndUpdate(req.user!.id, { "dynamicCells.spotify": spotifyData })
    }

    res.send(spotifyData.at)
})

export = router
