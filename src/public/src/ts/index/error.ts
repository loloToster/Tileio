const error = document.querySelector<HTMLDivElement>(".error")!
const errorMsg = document.querySelector<HTMLDivElement>(".error__msg")!

document.querySelector(".error__close")
    ?.addEventListener("click", () => hideError())

let errorTimeout: any
function hideError() {
    clearTimeout(errorTimeout)
    error.classList.remove("active")
}

export function createError(msg: string) {
    errorMsg.innerText = msg
    error.classList.remove("active")
    error.offsetHeight // neccessary for the animation to restart
    error.classList.add("active")

    errorTimeout = setTimeout(() => {
        hideError()
    }, 3000)
}
