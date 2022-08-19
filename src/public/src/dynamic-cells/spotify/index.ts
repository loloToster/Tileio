/// <reference types="@types/spotify-web-playback-sdk" />
import createWidget from "../../ts/iframe-api"

function setCookie(name: string, value: string, expire = 365) {
    const d = new Date()
    d.setTime(d.getTime() + (expire * 24 * 60 * 60 * 1000))
    let expires = "expires=" + d.toUTCString()
    document.cookie = name + "=" + value + ";" + expires + ";path=/"
}

function getCookie(name: string) {
    name = name + "="
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(";")
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == " ")
            c = c.substring(1)
        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length)
    }
    return ""
}

function getBestImage(size: number, images: Spotify.Image[]) {
    images = images.reverse()

    for (const img of images) {
        if ((img.width || img.height || 0) >= size)
            return img.url
    }

    return images.pop()!.url
}

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

const widget = createWidget()
const SP_BASE_URL = "https://open.spotify.com"

const playerEl = document.querySelector<HTMLDivElement>(".player")!

const libraryTab = document.querySelector<HTMLDivElement>(".menu__tab--library")!
const searchTab = document.querySelector<HTMLDivElement>(".menu__tab--search")!

const switchToLibrary = document.querySelector<HTMLButtonElement>(".nav__btn--library")!
const switchToSearch = document.querySelector<HTMLButtonElement>(".nav__btn--search")!
const switchToPlayer = document.querySelector<HTMLButtonElement>(".nav__btn--player")!
const switchToMenu = document.querySelector<HTMLButtonElement>(".player__back")!

switchToLibrary.addEventListener("click", () => {
    libraryTab.classList.add("active")
    searchTab.classList.remove("active")
    switchToLibrary.classList.add("active")
    switchToSearch.classList.remove("active")
})

switchToSearch.addEventListener("click", () => {
    libraryTab.classList.remove("active")
    searchTab.classList.add("active")
    switchToLibrary.classList.remove("active")
    switchToSearch.classList.add("active")
})

switchToPlayer.addEventListener("click", () => {
    playerEl.classList.add("active")
})

switchToMenu.addEventListener("click", () => {
    playerEl.classList.remove("active")
})

const searchInp = document.querySelector<HTMLInputElement>(".search__inp")!
const clearSearchInp = document.querySelector<HTMLButtonElement>(".search__inp-btn--clear")!
const searchResults = document.querySelector<HTMLDivElement>(".search__results")!

searchInp.addEventListener("input", () => {
    clearSearchInp.classList.toggle("active", Boolean(searchInp.value))
})

clearSearchInp.addEventListener("click", () => {
    searchInp.value = ""
    clearSearchInp.classList.remove("active")
})

window.onSpotifyWebPlaybackSDKReady = async () => {
    const { SpotifyApi } = await import("./SpotifyPlayer")

    const volumeInput = document.querySelector<HTMLInputElement>(".player__volume input")!
    const transferPlaybackBtn = document.querySelector<HTMLButtonElement>(".player__transfer-playback")!

    const titleDiv = document.querySelector<HTMLDivElement>(".player__title")!
    const artistDiv = document.querySelector<HTMLDivElement>(".player__artist")!

    const shuffleBtn = document.querySelector<HTMLButtonElement>(".player__shuffle")!
    const prevBtn = document.querySelector<HTMLButtonElement>(".player__prev")!
    const pauseplay = document.querySelector<HTMLDivElement>(".player__playpause")!
    const nextBtn = document.querySelector<HTMLButtonElement>(".player__next")!
    const loopBtn = document.querySelector<HTMLButtonElement>(".player__loop")!

    let userCountry: string

    let lastAt = ""
    let atExpires = new Date()
    const spotifyApi = new SpotifyApi({
        name: "Widgetblocks",
        getOAuthToken: async cb => {
            let at: string
            try {
                if (!lastAt || new Date() >= atExpires) {
                    const res = await fetch("/dynamic-cells/spotify/access-token").then(r => r.json())
                    atExpires = new Date(res.expires)
                    at = res.at
                } else {
                    at = lastAt
                }
            } catch {
                at = lastAt
            }
            lastAt = at
            cb(at)
        }
    })

    spotifyApi.addListener("ready", async ({ device_id }) => {
        // set volume
        let vol = getCookie("spotify-cell-vol")
        if (!vol) {
            vol = "0.5"
            setCookie("spotify-cell-vol", vol)
        }

        let volFloat = parseFloat(vol)
        spotifyApi.setVolume(volFloat)
        volumeInput.value = (volFloat * 100).toString()
        updateSpotifySlider(volumeInput)

        // update user info
        const user = await spotifyApi.getUser()
        userCountry = user.country
        document.querySelector<HTMLDivElement>(".header__name")!.innerText = user.display_name
        document.querySelector<HTMLImageElement>(".header__avatar")!.src = user.images[0].url

        // update playlists
        const playlistsList = document.querySelector<HTMLUListElement>(".playlists")!

        const likedSongs = document.querySelector<HTMLElement>(".playlists__playlist")!
        widget.addContextMenuBtn(likedSongs, {
            text: "Open on Spotify",
            action: () => {
                window.open(`${SP_BASE_URL}/collection/tracks`)
            }
        })
        likedSongs.addEventListener("click", () => {
            spotifyApi.play(`spotify:user:${user.id}:collection`)
            playerEl.classList.add("active")
        })

        const playlists: any[] = await spotifyApi.getUserPlaylists()

        playlists.forEach(playlist => {
            let li = document.createElement("li")
            li.classList.add("playlists__playlist")

            let img = document.createElement("img")
            img.classList.add("playlists__playlist-img")
            img.src = getBestImage(72, playlist.images)
            li.appendChild(img)

            let nameDiv = document.createElement("div")
            nameDiv.classList.add("playlists__playlist-name")
            nameDiv.innerText = playlist.name
            li.appendChild(nameDiv)

            widget.addContextMenuBtn(li, {
                text: "Open on Spotify",
                action: () => {
                    window.open(`${SP_BASE_URL}/playlist/${playlist.id}`)
                }
            })

            li.addEventListener("click", () => {
                spotifyApi.play("spotify:playlist:" + playlist.id)
                playerEl.classList.add("active")
            })

            playlistsList.appendChild(li)
        })

        document.querySelector(".loading")?.remove()
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

    let searchTimeout: any
    searchInp.addEventListener("input", () => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(async () => {
            if (!searchInp.value) {
                searchResults.innerHTML = ""
                return
            }

            const categories = [
                "track",
                "playlist",
                "album",
                "show",
                "episode"
            ]

            const results = await spotifyApi.search(searchInp.value, categories, userCountry)

            searchResults.innerHTML = ""

            categories.forEach(cat => {
                const category = cat + "s"

                let categoryEl = document.createElement("details")
                categoryEl.classList.add("search__result-category")
                categoryEl.open = true

                let summary = document.createElement("summary")
                summary.classList.add("search__result-category__name")
                summary.innerText = category
                categoryEl.appendChild(summary)

                results[category].items.forEach((item: any) => {
                    let resultEl = document.createElement("div")
                    resultEl.classList.add("search__result")

                    widget.addContextMenuBtn(resultEl, {
                        text: "Open on Spotify",
                        action: () => {
                            window.open(`${SP_BASE_URL}/${cat}/${item.id}`)
                        }
                    })

                    resultEl.addEventListener("click", () => {
                        playerEl.classList.add("active")
                        spotifyApi.play(item.uri)
                    })

                    let img = document.createElement("img")
                    const images = item.images || item.album.images
                    img.src = getBestImage(60, images)
                    resultEl.appendChild(img)

                    let titleAuthorWrapper = document.createElement("div")
                    titleAuthorWrapper.classList.add("search__result-title-author")

                    let titleEl = document.createElement("div")
                    titleEl.classList.add("search__result-title")
                    titleEl.innerText = item.name
                    titleAuthorWrapper.appendChild(titleEl)

                    let authorEl = document.createElement("div")
                    authorEl.classList.add("search__result-author")

                    let author: string

                    if (item.artists) {
                        author = item.artists.map((e: any) => e.name).join(", ")
                    } else if (item.owner) {
                        author = item.owner.display_name
                    } else if (item.publisher) {
                        author = item.publisher
                    } else {
                        author = ""
                    }

                    authorEl.innerText = author
                    titleAuthorWrapper.appendChild(authorEl)

                    resultEl.appendChild(titleAuthorWrapper)

                    categoryEl.appendChild(resultEl)
                })

                searchResults.appendChild(categoryEl)
            })
        }, 500)
    })

    volumeInput.addEventListener("input", () => {
        const newVol = parseInt(volumeInput.value) / 100
        spotifyApi.setVolume(newVol)
        setCookie("spotify-cell-vol", newVol.toString())
    })

    transferPlaybackBtn.addEventListener("click", async () => {
        if (!spotifyApi.deviceId) return
        await spotifyApi.transferPlayback(spotifyApi.deviceId)
        transferPlaybackBtn.classList.remove("active")
    })

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

    const playerDeviceEl = document.querySelector<HTMLDivElement>(".player__device")!

    spotifyApi.onGlobalStateChange(state => {
        if (!state && spotifyApi.deviceId) {
            return spotifyApi.transferPlayback(spotifyApi.deviceId)
        }

        playerDeviceEl.classList.add("active")
        playerDeviceEl.innerText = `Listening on ${state.device.name}`

        updateState({
            currentTrack: {
                id: state.item.id,
                img: getBestImage(300, state.item.album.images),
                name: state.item.name,
                artist: state.item.artists
                    .map((e: any) => e.name).join(", "),
                position: state.progress_ms,
                duration: state.item.duration_ms
            },
            shuffle: state.shuffle_state,
            paused: state.actions.disallows.pausing,
            repeatMode: ["off", "context", "track"].indexOf(state.repeat_state)
        })
    })

    spotifyApi.addListener("player_state_changed", async state => {
        if (!state) return

        playerDeviceEl.classList.remove("active")

        updateState({
            currentTrack: {
                id: state.track_window.current_track.id || "",
                img: getBestImage(300, state.track_window.current_track.album.images),
                name: state.track_window.current_track.name,
                artist: state.track_window.current_track.artists
                    .map(e => e.name).join(", "),
                position: state.position,
                duration: state.duration
            },
            shuffle: state.shuffle,
            paused: state.paused,
            repeatMode: state.repeat_mode
        })
    })

    interface CustomState {
        currentTrack: {
            id: string,
            img: string,
            name: string,
            artist: string,
            position: number,
            duration: number
        },
        shuffle: boolean,
        paused: boolean,
        repeatMode: number
    }

    function updateState(state: CustomState) {
        transferPlaybackBtn.classList.toggle("active", !spotifyApi.playingHere)

        playerEl.style.setProperty(
            "--image", `url("${state.currentTrack.img}")`
        )

        titleDiv.innerText = state.currentTrack.name
        artistDiv.innerText = state.currentTrack.artist

        shuffleBtn.classList.toggle("active", state.shuffle)
        pauseplay.classList.toggle("playing", !state.paused)

        switch (state.repeatMode) {
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

        widget.removeContextMenuBtn(playerEl)
        widget.addContextMenuBtn(playerEl, {
            text: "Open on Spotify",
            action: () => {
                window.open(`${SP_BASE_URL}/track/${state.currentTrack.id}`)
            }
        })

        updateDuration(state.currentTrack.position, state.currentTrack.duration, state.paused)
    }

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
