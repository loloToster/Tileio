/// <reference types="@types/spotify-web-playback-sdk" />

type globalStateListener = (state: any) => void

export class SpotifyApi extends Spotify.Player {
    playingHere: boolean
    deviceId: string | null
    private globalStateListeners: globalStateListener[]

    cachedGlobalState: any

    constructor(options: Spotify.PlayerInit) {
        super(options)

        this.playingHere = false
        this.deviceId = null

        this.addListener("ready", ({ device_id }) => {
            this.deviceId = device_id
        })

        this.on("player_state_changed", () => this.playingHere = true)

        this.globalStateListeners = []
        this.cachedGlobalState = null
    }

    getAccessToken() {
        return new Promise<string>(res => {
            this._options.getOAuthToken(aT => {
                res(aT)
            })
        })
    }

    async defaultHeaders() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${await this.getAccessToken()}`
        }
    }

    async fetchApi(path: string, method = "GET", body?: string) {
        return await fetch(`https://api.spotify.com/v1${path}`, {
            headers: await this.defaultHeaders(),
            method,
            body
        })
    }

    async getJson(path: string, method = "GET", body?: string) {
        const res = await this.fetchApi(path, method, body)

        if (!res.ok) throw new Error(await res.text())

        try {
            return await res.json()
        } catch {
            return null
        }
    }

    onGlobalStateChange(func: globalStateListener) {
        this.globalStateListeners.push(func)

        if (this.globalStateListeners.length == 1) {
            setInterval(async () => {
                const curState = await this.getGlobalState()
                this.cachedGlobalState = curState
                this.playingHere = curState?.device?.id == this.deviceId
                if (this.playingHere) return
                this.globalStateListeners.forEach(l => l(curState))
            }, 1000)
        }
    }

    async getUser(id?: string) {
        return await this.getJson(id ? `/users/${id}` : "/me")
    }

    async getUserPlaylists() {
        const data = await this.getJson("/me/playlists")
        return data.items
    }

    async getTracks(id?: string, limit = 20, offset = 0) {
        const data = await this.getJson(
            (id ? `/playlists/${id}/tracks` : "/me/tracks") + `?limit=${limit}&offset=${offset}`
        )

        return data.items
    }

    async getDevices() {
        const data = await this.getJson("/me/player/devices")
        return data.devices
    }

    async getGlobalState() {
        try {
            return await this.getJson("/me/player")
        } catch {
            return this.cachedGlobalState
        }
    }

    async transferPlayback(deviceId: string) {
        return await this.getJson("/me/player", "PUT", JSON.stringify({ device_ids: [deviceId] }))
    }

    async play(spotify_uri: string) {
        let context_uri: string | undefined = undefined
        let uris: string[] | undefined = undefined

        if (spotify_uri.startsWith("spotify:track:"))
            uris = [spotify_uri]
        else
            context_uri = spotify_uri

        this.fetchApi("/me/player/play", "PUT", JSON.stringify({
            context_uri, uris
        }))
    }

    async togglePlay() {
        if (this.playingHere) return await super.togglePlay()

        const state = await this.getGlobalState()
        const paused = Boolean(state?.actions.disallows.pausing)
        const query = paused ? "play" : "pause"

        await this.fetchApi("/me/player/" + query, "PUT")
    }

    async previousTrack() {
        if (this.playingHere) return await super.previousTrack()

        await this.fetchApi("/me/player/previous", "POST")
    }

    async nextTrack() {
        if (this.playingHere) return await super.nextTrack()

        await this.fetchApi("/me/player/next", "POST")
    }

    async toggleShuffle() {
        let shuffle: boolean | undefined

        if (this.playingHere) {
            const localState = await this.getCurrentState()
            shuffle = localState?.shuffle
        }

        if (shuffle === undefined) {
            const globalState = await this.getGlobalState()
            shuffle = globalState.shuffle_state
        }

        await this.fetchApi("/me/player/shuffle?state=" + !shuffle, "PUT")
    }

    async toggleRepeat() {
        const REPEAT_MODES = ["off", "context", "track"]
        let currentRepeatMode: number | undefined

        if (this.playingHere) {
            const localState = await this.getCurrentState()
            currentRepeatMode = localState?.repeat_mode
        }

        if (currentRepeatMode === undefined) {
            const globalState = await this.getGlobalState()
            currentRepeatMode = REPEAT_MODES.indexOf(globalState.repeat_state)
        }

        if (currentRepeatMode === undefined) return

        const newRepeatMode = (currentRepeatMode + 1) % 3
        await this.fetchApi("/me/player/repeat?state=" + REPEAT_MODES[newRepeatMode], "PUT")
    }

    async seek(pos: number) {
        if (this.playingHere) return await super.seek(pos)

        await this.fetchApi("/me/player/seek?position_ms=" + pos, "PUT")
    }

    async search(query: string, types: string[], limit = 5) {
        return await this.getJson(
            `/search?q=${encodeURIComponent(query)}&type=${types.join(",")}&limit=${limit}`
        )
    }
}
