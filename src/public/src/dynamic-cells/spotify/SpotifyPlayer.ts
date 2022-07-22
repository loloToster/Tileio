/// <reference types="@types/spotify-web-playback-sdk" />

export class SpotifyApi extends Spotify.Player {
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

    async fetchApi(path: string, method = "GET", body: string | undefined = undefined) {
        return await fetch(`https://api.spotify.com/v1${path}`, {
            headers: await this.defaultHeaders(),
            method,
            body
        })
    }

    async getJson(path: string, method = "GET", body: string | undefined = undefined) {
        try {
            return await this.fetchApi(path, method, body).then(r => r.json())
        } catch (err) {
            console.error(err)
            return undefined
        }
    }

    async getUser() {
        return await this.getJson("/me")
    }

    async getUserPlaylists() {
        const data = await this.getJson("/me/playlists")
        return data.items
    }

    async getDevices() {
        const data = await this.getJson("/me/player/devices")
        return data.devices
    }

    async transferPlayback(deviceId: string) {
        return await this.getJson("/me/player", "PUT", JSON.stringify({ device_ids: [deviceId] }))
    }

    async toggleShuffle() {
        const state = await this.getCurrentState()
        if (!state) return
        const shuffle = !state.shuffle
        await this.fetchApi("/me/player/shuffle?state=" + shuffle, "PUT")
    }

    async toggleRepeat() {
        const REPEAT_MODES = ["off", "context", "track"]
        const state = await this.getCurrentState()
        if (!state) return
        const repeatMode = (state.repeat_mode + 1) % 3
        await this.fetchApi("/me/player/repeat?state=" + REPEAT_MODES[repeatMode], "PUT")
    }
}
