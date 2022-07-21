const playerEl = document.querySelector<HTMLDivElement>(".player")!

const switchToPlayer = document.querySelector<HTMLButtonElement>(".nav__player")!

switchToPlayer.addEventListener("click", () => {
    playerEl.classList.add("active")
})
