import { onClickOutside } from "./utlis/utils"

const nav = document.querySelector<HTMLElement>(".nav")
const burgerBtn = document.querySelector<HTMLButtonElement>(".header__open-mobile-menu")

burgerBtn?.addEventListener("click", () => {
    nav?.classList.toggle("active")
})

onClickOutside([nav, burgerBtn], () => {
    nav?.classList.remove("active")
})
