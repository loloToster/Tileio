const playerEl = document.querySelector<HTMLDivElement>(".player")!

const switchToPlayer = document.querySelector<HTMLButtonElement>(".nav__player")!
const switchToMenu = document.querySelector<HTMLButtonElement>(".player__back")!

document.querySelectorAll<HTMLInputElement>(".spotify-input").forEach(i => {
    i.addEventListener("input", () => {
        const v = parseInt(i.value)
        const max = parseInt(i.max)
        i.style.setProperty("--percentage", ((v / max) * 100).toString())
    })
})

switchToPlayer.addEventListener("click", () => {
    playerEl.classList.add("active")
})

switchToMenu.addEventListener("click", () => {
    playerEl.classList.remove("active")
})
