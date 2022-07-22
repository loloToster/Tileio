/// <reference types="@types/spotify-web-playback-sdk" />

const playerEl = document.querySelector<HTMLDivElement>(".player")!

const switchToPlayer = document.querySelector<HTMLButtonElement>(".nav__player")!
const switchToMenu = document.querySelector<HTMLButtonElement>(".player__back")!

function updateSpotifySlider(i: HTMLInputElement) {
    const v = parseInt(i.value)
    const max = parseInt(i.max)
    i.style.setProperty("--percentage", ((v / max) * 100).toString())
}

document.querySelectorAll<HTMLInputElement>(".spotify-input").forEach(i => {
    i.addEventListener("input", () => {
        updateSpotifySlider(i)
    })
})

switchToPlayer.addEventListener("click", () => {
    playerEl.classList.add("active")
})

switchToMenu.addEventListener("click", () => {
    playerEl.classList.remove("active")
})
// @ts-ignore
window.onSpotifyWebPlaybackSDKReady = async () => {
    const { SpotifyApi } = await import("./SpotifyPlayer")

    const spotifyApi = new SpotifyApi({
        getOAuthToken: async cb => {
            const at = await fetch("/dynamic-cells/spotify/access-token").then(r => r.text())
            cb(at)
        },
        name: "Widgetblocks",
        volume: 0.5
    })

    spotifyApi.getUser().then(u => {
        document.querySelector<HTMLDivElement>(".header__name")!.innerText = u.display_name
        document.querySelector<HTMLImageElement>(".header__avatar")!.src = u.images[0].url
    })

    const playlistsList = document.querySelector<HTMLUListElement>(".playlists")!

    const playlists: any[] = await spotifyApi.getUserPlaylists()

    playlists.forEach(playlist => {
        let li = document.createElement("li")
        li.classList.add("playlists__playlist")

        let img = document.createElement("img")
        img.classList.add("playlists__playlist-img")
        img.src = playlist.images[0].url
        li.appendChild(img)

        let nameDiv = document.createElement("div")
        nameDiv.classList.add("playlists__playlist-name")
        nameDiv.innerText = playlist.name
        li.appendChild(nameDiv)

        playlistsList.appendChild(li)
    })

    spotifyApi.addListener("ready", async ({ device_id }) => {
        console.log(device_id)
        const allDevices: any[] = await spotifyApi.getDevices()
        if (!allDevices.some(d => d.id == device_id ? false : d.is_active)) {
            console.log("transfering")
            // todo: make retries on device not found error
            await new Promise(r => setTimeout(r, 1000))
            await spotifyApi.transferPlayback(device_id)
        }
    })

    spotifyApi.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id)
    })

    spotifyApi.addListener("initialization_error", ({ message }) => {
        console.error("initialization_error", message)
    })

    spotifyApi.addListener("authentication_error", ({ message }) => {
        console.error("authentication_error", message)
    })

    spotifyApi.addListener("account_error", ({ message }) => {
        console.error("account_error", message)
    })

    const playerEl = document.querySelector<HTMLDivElement>(".player")!
    const titleDiv = document.querySelector<HTMLDivElement>(".player__title")!
    const artistDiv = document.querySelector<HTMLDivElement>(".player__artist")!

    const shuffleBtn = document.querySelector<HTMLButtonElement>(".player__shuffle")!
    const prevBtn = document.querySelector<HTMLButtonElement>(".player__prev")!
    const pauseplay = document.querySelector<HTMLDivElement>(".player__playpause")!
    const nextBtn = document.querySelector<HTMLButtonElement>(".player__next")!
    const loopBtn = document.querySelector<HTMLButtonElement>(".player__loop")!

    shuffleBtn.addEventListener("click", () => {
        spotifyApi.toggleShuffle()
    })

    prevBtn.addEventListener("click", () => {
        spotifyApi.previousTrack()
    })

    pauseplay.addEventListener("click", () => {
        spotifyApi.togglePlay()
    })

    nextBtn.addEventListener("click", () => {
        spotifyApi.nextTrack()
    })

    loopBtn.addEventListener("click", () => {
        spotifyApi.toggleRepeat()
    })

    spotifyApi.addListener("player_state_changed", async state => {
        if (!state) return

        playerEl.style.setProperty(
            "--image", `url("${state.track_window.current_track.album.images[0].url}")`
        )

        titleDiv.innerText = state.track_window.current_track.name
        artistDiv.innerText = state.track_window.current_track.artists
            .map(e => e.name).join(", ")

        shuffleBtn.classList.toggle("active", state.shuffle)
        pauseplay.classList.toggle("playing", !state.paused)

        switch (state.repeat_mode) {
            case 0:
                loopBtn.classList.remove("active")
                loopBtn.classList.remove("loop-1")
                break

            case 1:
                loopBtn.classList.add("active")
                loopBtn.classList.remove("loop-1")
                break

            case 2:
                loopBtn.classList.add("active")
                loopBtn.classList.add("loop-1")
                break

            default:
                break
        }

        updateDuration(state.position, state.duration, state.paused)
    })

    const durationInput = document.querySelector<HTMLInputElement>(".player__progress-bar")!
    const durationCurTime = document.querySelector<HTMLDivElement>(".player__cur-time")!
    const fullDuration = document.querySelector<HTMLDivElement>(".player__duration")!

    let inputingDuration = false
    durationInput.addEventListener("mousedown", () => inputingDuration = true)

    durationInput.addEventListener("input", () => {
        drawDuration(parseInt(durationInput.value) * 1000, parseInt(durationInput.max) * 1000)
    })

    durationInput.addEventListener("mouseup", () => {
        inputingDuration = false
        const ms = parseInt(durationInput.value) * 1000
        spotifyApi.seek(ms)
    })

    let durationTimeout: any
    function updateDuration(position: number, duration: number, paused: boolean) {
        clearTimeout(durationTimeout)
        if (paused) {
            drawDuration(position, duration)
            return
        }
        if (!inputingDuration)
            drawDuration(position, duration)
        position += 1000
        durationTimeout = setTimeout(updateDuration, 1000, position, duration, paused)
    }

    function zeroFill(number: number, width = 2) {
        width -= number.toString().length
        if (width > 0)
            return new Array(width + (/\./.test(number.toString()) ? 2 : 1)).join("0") + number
        return number + ""
    }

    function drawDuration(position: number, duration: number) {
        if (position > duration) position = 0

        position = Math.floor(position / 1000)
        duration = Math.floor(duration / 1000)

        durationInput.value = position.toString()
        durationInput.max = duration.toString()

        updateSpotifySlider(durationInput)

        let minutes = Math.floor(position / 60)
        let seconds = position % 60
        durationCurTime.innerText = `${minutes}:${zeroFill(seconds)}`

        minutes = Math.floor(duration / 60)
        seconds = duration % 60
        fullDuration.innerText = `${minutes}:${zeroFill(seconds)}`
    }

    spotifyApi.connect()
}
