/// <reference types="@types/spotify-web-playback-sdk" />

import createWidget from "../../ts/iframe-api"
import { onClickOutside, setCSSVar } from "../../ts/utlis/utils"

import { getClosestToLightness } from "./utils/get-pallete"
import getLyrics from "./utils/get-lyrics"

const DEAFULT_COVER = "/static/assets/dynamic-cells/default-cover.png"

function getBestImage(size: number, images: Spotify.Image[]) {
    images = [...images.reverse()]

    for (const img of images) {
        if ((img.width || img.height || 0) >= size)
            return img.url
    }

    return images.pop()?.url || DEAFULT_COVER
}

function updateSpotifySlider(i: HTMLInputElement) {
    const v = parseInt(i.value)
    const max = parseInt(i.max)
    setCSSVar(i, "percentage", (v / max) * 100)
}

document.querySelectorAll<HTMLInputElement>(".spotify-input").forEach(i => {
    i.addEventListener("input", () => {
        updateSpotifySlider(i)
    })
})

const widget = createWidget()
const SP_BASE_URL = "https://open.spotify.com"

const userButton = document.querySelector<HTMLButtonElement>(".header__user")!
const userArrow = document.querySelector<HTMLDivElement>(".header__user__arrow")!
const userMenu = document.querySelector<HTMLDivElement>(".header__user__menu")!

userButton.addEventListener("click", () => {
    userButton.classList.toggle("active")
    userArrow.classList.toggle("active")
    userMenu.classList.toggle("active")
})

onClickOutside([userButton], () => {
    userButton.classList.remove("active")
    userArrow.classList.remove("active")
    userMenu.classList.remove("active")
})

const playerEl = document.querySelector<HTMLDivElement>(".player")!

const spotifyItemPlaceholderTemplate = <HTMLTemplateElement>document.getElementById("spotify-item-placeholder-template")!
const spotifyItemTemplate = <HTMLTemplateElement>document.getElementById("spotify-item-template")!

interface SpotifyItemProps {
    img: string,
    title: string,
    metadata?: string,
    id?: string,
    playable?: boolean,
    active?: boolean,
    playing?: boolean,
    explicit?: boolean,
    roundedImg?: boolean
}

function createSpotifyItem({
    img,
    title,
    metadata = "",
    id,
    playable = true,
    active,
    playing,
    explicit,
    roundedImg
}: SpotifyItemProps) {
    const helper = document.createElement("div")
    helper.innerHTML = spotifyItemTemplate.innerHTML

    const clone = helper.querySelector("div")!

    if (id) clone.dataset.id = id

    clone.classList.toggle("active", Boolean(active))
    clone.classList.toggle("playing", Boolean(playing))

    const cover = clone.querySelector<HTMLDivElement>(".spotify-item__cover")!
    cover.querySelector("img")!.src = img
    cover.classList.toggle("rounded", Boolean(roundedImg))

    clone.querySelector<HTMLDivElement>(".spotify-item__title")!.innerText = title
    clone.querySelector<HTMLDivElement>(".spotify-item__artists")!.innerText = metadata

    if (!playable)
        clone.querySelector("button")?.remove()

    if (!explicit)
        clone.querySelector<HTMLSpanElement>(".spotify-item__explicit")?.remove()

    return clone
}

function createSpotifyItemPlaceholder(n: number) {
    return spotifyItemPlaceholderTemplate.innerHTML.trim().repeat(n)
}

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

const browseCategoryTemplate = <HTMLTemplateElement>document.getElementById("browse-category-template")
const browseCategoriesContainerWrapper = document.querySelector<HTMLDivElement>(".search__browse-wrapper")!
const browseCategoriesContainer = document.querySelector<HTMLDivElement>(".search__browse")!

const searchInp = document.querySelector<HTMLInputElement>(".search__inp")!
const clearSearchInp = document.querySelector<HTMLButtonElement>(".search__inp-btn--clear")!

const searchCategoriesArrWrapper = document.querySelector<HTMLDivElement>(".search__categories-arrow-wrapper")!
const searchCategoriesWrapper = document.querySelector<HTMLDivElement>(".search__categories-wrapper")!
const searchCategoriesContainer = document.querySelector<HTMLDivElement>(".search__categories")!
const searchCategories = document.querySelectorAll<HTMLDivElement>(".search__categories__cat")!
const searchArrLeft = document.querySelector<HTMLButtonElement>(".search__categories-arrow-wrapper__arrow--left")!
const searchArrRight = document.querySelector<HTMLButtonElement>(".search__categories-arrow-wrapper__arrow--right")!
const searchCatButtons = document.querySelectorAll<HTMLButtonElement>(".search__categories__cat")
const searchCatContainers = document.querySelectorAll<HTMLDivElement>(".search__results__cat")
const searchAllCatButton = searchCatButtons[0]
const searchAllCatContainer = searchCatContainers[0]
const searchResults = document.querySelector<HTMLDivElement>(".search__results")!

searchInp.addEventListener("input", () => {
    clearSearchInp.classList.toggle("active", Boolean(searchInp.value))
})

clearSearchInp.addEventListener("click", () => {
    searchInp.value = ""
    clearSearchInp.classList.remove("active")
    searchInp.dispatchEvent(new Event("input"))
})

let curCatIdx = 0
function setCatIdx(idx: number) {
    curCatIdx = idx

    const maxLeft = curCatIdx === 0
    const maxRight = curCatIdx === searchCategories.length - 1

    searchArrLeft.disabled = maxLeft
    searchArrRight.disabled = maxRight

    searchCategoriesWrapper.classList.toggle("active-left", !maxLeft)
    searchCategoriesWrapper.classList.toggle("active-right", !maxRight)

    const curCat = searchCategories[curCatIdx]

    const computedGap = window.getComputedStyle(searchCategoriesContainer).gap
    const arrOffset = searchArrLeft.getBoundingClientRect().width + parseInt(computedGap.substring(0, computedGap.length - 2))

    setCSSVar(
        searchCategoriesContainer,
        "offset",
        curCat.getBoundingClientRect().x - searchCategoriesContainer.getBoundingClientRect().x - (curCatIdx ? arrOffset : 0)
    )
}

searchArrLeft.addEventListener("click", () => {
    setCatIdx(curCatIdx - 1)
})

searchArrRight.addEventListener("click", () => {
    setCatIdx(curCatIdx + 1)
})

searchCatButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".search__categories__cat.active")?.classList.remove("active")
        document.querySelector(".search__results__cat.active")?.classList.remove("active")

        btn.classList.add("active")
        Array.from(searchCatContainers).find(c => c.dataset.cat === btn.dataset.cat)?.classList.add("active")
        searchResults.scrollTo(0, 0)
    })
})

window.onSpotifyWebPlaybackSDKReady = async () => {
    const { SpotifyApi } = await import("./utils/SpotifyPlayer")

    const volumeInput = document.querySelector<HTMLInputElement>(".player__volume input")!
    const transferPlaybackBtn = document.querySelector<HTMLButtonElement>(".player__transfer-playback")!
    const openLyricsBtn = document.querySelector<HTMLButtonElement>(".player__open-lyrics")!
    const closeLyricsBtn = document.querySelector<SVGElement>(".player__lyrics__close")!
    const lyricsBox = document.querySelector<HTMLDivElement>(".player__lyrics")!
    const lyricsLinesWrapper = document.querySelector<HTMLDivElement>(".player__lyrics__lines")!

    const titleDiv = document.querySelector<HTMLDivElement>(".player__title")!
    const artistDiv = document.querySelector<HTMLDivElement>(".player__artist")!

    const shuffleBtn = document.querySelector<HTMLButtonElement>(".player__shuffle")!
    const prevBtn = document.querySelector<HTMLButtonElement>(".player__prev")!
    const pauseplay = document.querySelector<HTMLDivElement>(".player__playpause")!
    const nextBtn = document.querySelector<HTMLButtonElement>(".player__next")!
    const loopBtn = document.querySelector<HTMLButtonElement>(".player__loop")!

    let lastAt = ""
    let atExpires = new Date()
    const spotifyApi = new SpotifyApi({
        name: "Tileio",
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

    interface Playlist {
        id: string
        img: string,
        name: string,
        playUri: string,
        url: string,
        numOfTracks: number | null,
        creator: {
            id: string,
            name: string,
            img: string | null
        },
        isAlbum?: boolean
    }

    interface CustomState {
        context: {
            uri: string | null
        },
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

    let openedPlaylist: Playlist | null = null
    let curPlayerState: CustomState | null = null

    const playlistTab = document.querySelector<HTMLDivElement>(".playlist")!
    const playlistContent = document.querySelector<HTMLDivElement>(".playlist__content")!
    const playlistBackBtn = document.querySelector<HTMLButtonElement>(".playlist__back")!
    const playlistPlayBtn = document.querySelector<HTMLButtonElement>(".playlist__play")!
    const playlistImg = document.querySelector<HTMLImageElement>(".playlist__img img")!
    const playlistName = document.querySelector<HTMLDivElement>(".playlist__name")!
    const playlistHeaderName = document.querySelector<HTMLDivElement>(".playlist__header__name")!
    const playlistCreatorImg = document.querySelector<HTMLDivElement>(".playlist__creator__img")!
    const playlistCreatorName = document.querySelector<HTMLSpanElement>(".playlist__creator span")!
    const playlistSongsContainer = document.querySelector<HTMLDivElement>(".playlist__songs")!

    playlistBackBtn.addEventListener("click", () => {
        playlistTab.classList.remove("active")
    })

    function playFromPlaylist(uri: string, context?: string) {
        spotifyApi.play(uri, context)
        playerEl.classList.add("active")
        playlistTab.classList.remove("active")
    }

    playlistPlayBtn.addEventListener("click", () => {
        if (!openedPlaylist) return

        if (curPlayerState?.context.uri === openedPlaylist.playUri) {
            spotifyApi.togglePlay()
        } else {
            playFromPlaylist(openedPlaylist.playUri)
        }
    })

    // handle header fading
    playlistContent.addEventListener("scroll", e => {
        const target = <HTMLDivElement>e.target
        const scrollPos = target.scrollTop

        const imgRect = playlistImg.getBoundingClientRect()

        const startThreshold = scrollPos + imgRect.y
        const endThreshold = scrollPos + imgRect.y + imgRect.height

        let opacity: number

        if (scrollPos < startThreshold) {
            opacity = 0
        } else if (scrollPos > endThreshold) {
            opacity = 1
        } else {
            opacity = (scrollPos - startThreshold) / (endThreshold - startThreshold)
        }

        setCSSVar(playlistTab, "opacity", opacity)
    })

    function createSong(track: any, playlist: Playlist) {
        const helper = document.createElement("div")
        helper.innerHTML = spotifyItemTemplate.innerHTML

        let active = false
        let playing = false

        if (playlist.playUri === curPlayerState?.context.uri && curPlayerState?.currentTrack.id === track.id) {
            active = true
            playing = !curPlayerState?.paused
        }

        const spotifyItem = createSpotifyItem({
            id: track.id,
            img: track.album ? getBestImage(40, track.album.images) : playlist.img,
            title: track.name,
            metadata: track.artists.map((e: any) => e.name).join(", "),
            active,
            playing,
            explicit: track.explicit
        })

        spotifyItem.querySelector<HTMLButtonElement>(".spotify-item__cover button")
            ?.addEventListener("click", () => {
                if (!openedPlaylist) return

                if (
                    curPlayerState?.context.uri === openedPlaylist.playUri &&
                    curPlayerState.currentTrack.id === track.id
                ) {
                    spotifyApi.togglePlay()
                } else {
                    playFromPlaylist(track.uri, playlist.playUri)
                }
            })

        const placeholder = document.querySelector<HTMLDivElement>(".playlist .spotify-item--placeholder")

        if (placeholder)
            placeholder.replaceWith(spotifyItem)
        else
            playlistSongsContainer.appendChild(spotifyItem)
    }

    let ownerImgCache: Record<string, string | undefined> = {}
    let fetchController = 0

    function createSongPlaceholders(n: number) {
        playlistSongsContainer.innerHTML = playlistSongsContainer.innerHTML + createSpotifyItemPlaceholder(n)
    }

    function updatePlaylistPlayState() {
        playlistPlayBtn.classList.toggle(
            "playing",
            curPlayerState?.context.uri === openedPlaylist?.playUri && !curPlayerState?.paused
        )

        if (!curPlayerState || !openedPlaylist) return

        document.querySelectorAll(
            ".playlist .spotify-item.active, .playlist .spotify-item.playing"
        ).forEach(s => s.classList.remove("active", "playing"))

        if (openedPlaylist.playUri !== curPlayerState.context.uri) return

        document.querySelectorAll(
            `.playlist .spotify-item[data-id="${curPlayerState.currentTrack.id}"]`
        ).forEach(s => {
            s.classList.add("active")
            s.classList.toggle("playing", !curPlayerState?.paused)
        })
    }

    async function openPlaylist(playlist: Playlist) {
        playlistTab.classList.add("active")

        if (playlist.id !== openedPlaylist?.id) {
            fetchController += 1
            playlistContent.scrollTo(0, 0)
        } else {
            return
        }

        const curFetchController = fetchController
        openedPlaylist = playlist

        playlistCreatorImg.classList.add("loading")
        setCSSVar(playlistCreatorImg, "img", null)

        playlistImg.src = playlist.img

        getClosestToLightness(playlistImg, 0.3).then(color => {
            if (fetchController !== curFetchController) return

            setCSSVar(playlistTab, "r", color.red)
            setCSSVar(playlistTab, "g", color.green)
            setCSSVar(playlistTab, "b", color.blue)
        })

        playlistName.innerText = playlist.name
        playlistHeaderName.innerText = playlist.name
        playlistCreatorName.innerText = playlist.creator.name

        updatePlaylistPlayState()

        playlistCreatorImg.classList.toggle("hidden", Boolean(playlist.isAlbum))
        if (!playlist.isAlbum) {
            const loader = new Image()

            loader.onload = async () => {
                if (fetchController !== curFetchController) return

                playlistCreatorImg.classList.remove("loading")
                setCSSVar(
                    playlistCreatorImg,
                    "img",
                    `url("${loader.src}")`
                )
            }

            const cachedImg = ownerImgCache[playlist.creator.id]

            if (playlist.creator.img) {
                loader.src = playlist.creator.img
            } else if (cachedImg) {
                loader.src = cachedImg
            } else {
                spotifyApi.getUser(playlist.creator.id).then(user => {
                    const img = user.images[0].url
                    ownerImgCache[user.id] = img
                    if (fetchController !== curFetchController) return
                    loader.src = img
                })
            }
        }

        const tracksPerFetch = 50
        playlistSongsContainer.innerHTML = ""

        createSongPlaceholders(playlist.numOfTracks === null ? 10 : playlist.numOfTracks)

        for (let i = 0; true; i += tracksPerFetch) {
            let res: any

            if (playlist.isAlbum) {
                res = await spotifyApi.getAlbumTracks(playlist.id, tracksPerFetch, i)
            } else if (playlist.id === "usercollection") {
                res = await spotifyApi.getUserTracks(tracksPerFetch, i)
            } else {
                res = await spotifyApi.getPlaylistTracks(playlist.id, tracksPerFetch, i)
            }

            const { items, total } = res

            if (fetchController !== curFetchController) break

            if (i == 0 && playlist.numOfTracks === null) {
                playlistSongsContainer.innerHTML = ""
                createSongPlaceholders(total)
            }

            items.forEach((i: any) => createSong(i.track || i, playlist))

            if (items.length < tracksPerFetch) {
                document.querySelectorAll(".playlist .spotify-item--placeholder").forEach(e => e.remove())
                break
            }
        }
    }

    spotifyApi.addListener("ready", async ({ device_id }) => {
        // set volume
        let vol = localStorage.getItem("spotify-cell-vol")
        if (!vol) {
            vol = "0.5"
            localStorage.setItem("spotify-cell-vol", vol)
        }

        let volFloat = parseFloat(vol)
        spotifyApi.setVolume(volFloat)
        volumeInput.value = (volFloat * 100).toString()
        updateSpotifySlider(volumeInput)

        // update user info
        const user = await spotifyApi.getUser()

        document.querySelector<HTMLDivElement>(".header__user__name")!.innerText = user.display_name
        const userAvatar = document.querySelector<HTMLImageElement>(".header__user__avatar")!

        const userImg = user.images[0].url

        const loader = new Image()

        loader.onload = () => {
            userAvatar.classList.remove("loading")
            setCSSVar(
                userAvatar,
                "img",
                `url("${userImg}")`
            )
        }

        loader.src = userImg

        // update playlists
        const playlistTemplate = <HTMLTemplateElement>document.getElementById("playlist-template")
        const playlistsList = document.querySelector<HTMLUListElement>(".playlists")!

        const createPlaylist = (playlist: Playlist) => {
            const helper = document.createElement("div")
            helper.innerHTML = playlistTemplate.innerHTML

            const clone = helper.querySelector("li")!

            const img = clone.querySelector("img")!
            img.src = playlist.img

            const nameDiv = clone.querySelector<HTMLDivElement>(".playlists__playlist-name")!
            nameDiv.innerText = playlist.name

            clone.addEventListener("click", () => {
                openPlaylist(playlist)
            })

            widget.addContextMenuBtn(clone, {
                text: "Open on Spotify",
                action: () => {
                    window.open(playlist.url)
                }
            })

            playlistsList.appendChild(clone)
        }

        const playlists: any[] = await spotifyApi.getUserPlaylists()

        playlistsList.innerHTML = ""

        createPlaylist({
            id: "usercollection",
            img: "https://t.scdn.co/images/3099b3803ad9496896c43f22fe9be8c4.png",
            name: "Liked Songs",
            playUri: `spotify:user:${user.id}:collection`,
            url: `${SP_BASE_URL}/collection/tracks`,
            numOfTracks: null,
            creator: {
                id: user.id,
                name: user.display_name,
                img: user.images[0].url
            }
        })

        playlists.forEach(
            playlist => createPlaylist({
                id: playlist.id,
                img: getBestImage(200, playlist.images),
                name: playlist.name,
                playUri: "spotify:playlist:" + playlist.id,
                url: `${SP_BASE_URL}/playlist/${playlist.id}`,
                numOfTracks: playlist.tracks.total,
                creator: {
                    id: playlist.owner.id,
                    name: playlist.owner.display_name,
                    img: playlist.owner.id === user.id ? userImg : null
                }
            })
        )

        const { categories: { items: browseCats } } = await spotifyApi.getBrowseCategories(50)

        browseCats.forEach((cat: any) => {
            const helper = document.createElement("div")
            helper.innerHTML = browseCategoryTemplate.innerHTML

            const clone = helper.querySelector("a")!

            clone.href = `${SP_BASE_URL}/genre/${cat.id}`
            const img = clone.querySelector("img")!
            img.src = getBestImage(64, cat.icons)
            clone.querySelector("span")!.innerText = cat.name

            browseCategoriesContainer.appendChild(clone)
        })
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

    let availableSearchCategories: string[] = []

    searchCatButtons.forEach(btn => {
        if (btn.dataset.cat) availableSearchCategories.push(btn.dataset.cat)
    })

    let searchTimeout: any
    searchInp.addEventListener("input", () => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(async () => {
            if (!searchInp.value) {
                browseCategoriesContainerWrapper.classList.add("active")
                searchCategoriesArrWrapper.classList.remove("active")
                searchResults.classList.remove("active")
                return
            }

            const results = await spotifyApi.search(searchInp.value, availableSearchCategories)

            searchCatContainers.forEach(c => c.innerHTML = "")

            availableSearchCategories.forEach(cat => {
                const category = cat + "s"

                results[category].items.forEach((i: any) => {
                    const categoryContainer = Array.from(searchCatContainers).find(c => c.dataset.cat === cat)

                    const images = i.images || i.album.images
                    let author = ""

                    if (i.artists) {
                        author = i.artists.map((e: any) => e.name).join(", ")
                    } else if (i.owner) {
                        author = i.owner.display_name
                    } else if (i.publisher) {
                        author = i.publisher
                    }

                    let itemData: SpotifyItemProps = {
                        img: getBestImage(60, images),
                        title: i.name,
                        metadata: author,
                        explicit: i.explicit,
                        playable: cat === "track",
                        roundedImg: cat === "artist"
                    }

                    const contextMenuData = {
                        text: "Open on Spotify",
                        action: () => {
                            window.open(`${SP_BASE_URL}/${cat}/${i.id}`)
                        }
                    }

                    const catToDisplayName: Record<string, string> = {
                        "track": "Song",
                        "album": "Album",
                        "playlist": "Playlist",
                        "artist": "Artist"
                    }

                    const allItem = createSpotifyItem({
                        ...itemData,
                        metadata: cat === "artist" ? catToDisplayName[cat] : `${catToDisplayName[cat]} • ${itemData.metadata}`
                    })
                    const catItem = createSpotifyItem(itemData)

                    widget.addContextMenuBtn(allItem, contextMenuData)
                    widget.addContextMenuBtn(catItem, contextMenuData)

                    if (cat === "playlist") {
                        const cb = () => {
                            openPlaylist({
                                id: i.id,
                                img: getBestImage(200, i.images),
                                name: i.name,
                                playUri: "spotify:playlist:" + i.id,
                                url: `${SP_BASE_URL}/playlist/${i.id}`,
                                numOfTracks: i.tracks.total,
                                creator: {
                                    id: i.owner.id,
                                    name: i.owner.display_name,
                                    img: null
                                }
                            })
                        }

                        allItem.addEventListener("click", cb)
                        catItem.addEventListener("click", cb)
                    } else if (cat === "album") {
                        const cb = () => {
                            openPlaylist({
                                id: i.id,
                                img: getBestImage(200, i.images),
                                name: i.name,
                                playUri: i.uri,
                                url: `${SP_BASE_URL}/album/${i.id}`,
                                numOfTracks: i.total_tracks,
                                isAlbum: true,
                                creator: {
                                    id: "",
                                    name: i.artists.map((e: any) => e.name).join(" • "),
                                    img: null
                                }
                            })
                        }

                        allItem.addEventListener("click", cb)
                        catItem.addEventListener("click", cb)
                    } else if (cat === "track") {
                        const cb = () => {
                            spotifyApi.play(i.uri)
                            playerEl.classList.add("active")
                        }

                        allItem.querySelector("button")?.addEventListener("click", cb)
                        catItem.querySelector("button")?.addEventListener("click", cb)
                    } else if (cat === "artist") {
                        const cb = contextMenuData.action

                        allItem.addEventListener("click", cb)
                        catItem.addEventListener("click", cb)
                    }

                    searchAllCatContainer.appendChild(allItem)
                    categoryContainer?.appendChild(catItem)
                })

                browseCategoriesContainerWrapper.classList.remove("active")
                searchCategoriesArrWrapper.classList.add("active")
                searchResults.classList.add("active")
                searchResults.scrollTo(0, 0)
                searchAllCatButton.click()
                setCatIdx(0)
            })
        }, 500)
    })

    volumeInput.addEventListener("input", () => {
        const newVol = parseInt(volumeInput.value) / 100
        spotifyApi.setVolume(newVol)
        localStorage.setItem("spotify-cell-vol", newVol.toString())
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

        if (!state.item) return

        updateState({
            context: {
                uri: state.context?.uri || null
            },
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

        if (!state.track_window.current_track) return

        updateState({
            context: {
                uri: state.context.uri
            },
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

    let lastLyrics = ""

    openLyricsBtn.addEventListener("click", () => {
        lyricsBox.classList.add("active")
    })

    closeLyricsBtn.addEventListener("click", () => {
        lyricsBox.classList.remove("active")
    })

    async function updateLyrics(state: CustomState) {
        if (lastLyrics === state.currentTrack.id) return
        lastLyrics = state.currentTrack.id

        const colorPromise = getClosestToLightness(state.currentTrack.img, 0.5)
        const lyricsPromise = getLyrics(state.currentTrack.artist, state.currentTrack.name)

        const [color, lyrics] = await Promise.all([colorPromise, lyricsPromise])

        if (!lyrics.length) {
            lyricsBox.classList.remove("active")
            openLyricsBtn.disabled = true
            openLyricsBtn.title = "Could not find the lyrics"
            return
        } else {
            openLyricsBtn.disabled = false
            openLyricsBtn.title = "Lyrics"
        }

        lyricsLinesWrapper.innerHTML = ""

        setCSSVar(
            lyricsBox,
            "lyrics-color-background",
            color.hex
        )

        lyrics.forEach(line => {
            const div = document.createElement("div")
            div.classList.add("player__lyrics__line")
            div.innerText = line
            lyricsLinesWrapper.appendChild(div)
        })
    }

    function updateState(state: CustomState) {
        curPlayerState = state
        updatePlaylistPlayState()

        transferPlaybackBtn.classList.toggle("active", !spotifyApi.playingHere)

        setCSSVar(playerEl, "image", `url("${state.currentTrack.img}")`)

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
        updateLyrics(state)
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

    window.addEventListener("beforeunload", () => {
        spotifyApi.disconnect()
    })

    spotifyApi.connect()
}
