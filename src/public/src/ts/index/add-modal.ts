import ColorPicker from "../utlis/color-picker"
import { isDark } from "../utlis/utils"
import { hex, IconResponse, SerializedCellContent } from "@backend-types/types"
import { generateIframeUrl } from "./iframe-api-handler"

const defaultColor = "#3e3e3e"

const addModal = document.querySelector<HTMLDivElement>(".add-modal")!

// Changing tabs
const menuItems = Array.from(document.getElementsByClassName("add-modal__menu__item"))
const addModalTabs = Array.from(document.getElementsByClassName("add-modal__tab"))

/**
 * by clicking menuItem with id '[name]' a tab with id '[name]-tab' will show
 */
for (const item of menuItems) {
    item.addEventListener("click", () => {
        menuItems.forEach(i => i.classList.remove("active"))
        item.classList.add("active")

        addModalTabs.forEach(i => i.classList.remove("active"))
        document.getElementById(item.id + "-tab")?.classList.add("active")
    })
}

// Creating Link Cells
const searchIconsInp = <HTMLInputElement>document.getElementById("add-modal__icon-inp")
const iconsLoading = document.querySelector<HTMLDivElement>(".add-modal__loading")!
const iconSearchResultsSiHeader = document.querySelector<HTMLElement>(".add-modal__icons-header--brand")
const iconSearchResultsSi = document.querySelector(".add-modal__icons--brand")
const iconSearchResultsFaHeader = document.querySelector<HTMLElement>(".add-modal__icons-header--normal")
const iconSearchResultsFa = document.querySelector(".add-modal__icons--normal")
const noIconsResult = document.querySelector<HTMLDivElement>(".add-modal__no-icons")
const suggestedColor = document.getElementById("add-modal__suggested-color")
const linkInp = <HTMLInputElement>document.getElementById("add-modal__link-inp")
const linkValidation = document.querySelector(".add-modal__link-validator")
const linkIconPreview = document.querySelector<HTMLElement>("#add-modal__link-cell-tab .add-modal__preview")
const linkIconPreviewImg = linkIconPreview?.querySelector<HTMLImageElement>("img")
const linkCellFinishBtn = document.querySelector<HTMLElement>("#add-modal__link-cell-tab .add-modal__finish")!
const closeBtn = document.querySelector<HTMLButtonElement>(".add-modal__close")!

const colorPicker = new ColorPicker({
    width: 200,
    el: "#add-modal__color-picker",
    color: defaultColor
})

interface FriendlyIcon {
    title: string,
    url: string,
    hex: hex
}

async function searchForIcon(q: string, l: number): Promise<IconResponse> {
    return await fetch(`/grid/search_icon?q=${q}&l=${l}`).then(r => r.json())
}

function changePreviewColor(color: hex) {
    linkIconPreview!.style.backgroundColor = color
    linkIconPreviewImg?.classList.toggle("white", isDark(color))
}

function onIconClick(icon: FriendlyIcon) {
    suggestedColor!.style.backgroundColor = icon.hex
    suggestedColor!.dataset.hex = icon.hex
    colorPicker.setColor(icon.hex)
    linkIconPreviewImg!.src = icon.url
    changePreviewColor(icon.hex)
}

function createIconEl(icon: FriendlyIcon) {
    let iconEl = document.createElement("div")
    iconEl.classList.add("icon-wrapper")
    iconEl.style.backgroundColor = icon.hex

    let img = document.createElement("img")
    img.src = icon.url
    img.title = icon.title

    if (isDark(icon.hex))
        img.classList.add("white")

    iconEl.appendChild(img)
    iconEl.addEventListener("click", () => onIconClick(icon))

    return iconEl
}

let searchTimeout: any
searchIconsInp?.addEventListener("input", () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
        noIconsResult?.classList.remove("active")

        iconSearchResultsSi!.innerHTML = ""
        iconSearchResultsFa!.innerHTML = ""

        iconSearchResultsFaHeader?.classList.remove("active")
        iconSearchResultsSiHeader?.classList.remove("active")

        iconsLoading.classList.add("active")

        const res = await searchForIcon(searchIconsInp.value, 15)

        iconsLoading.classList.remove("active")

        if (!res.si.length && !res.fa.length) {
            noIconsResult?.classList.add("active")
            return
        }

        if (res.si.length) {
            iconSearchResultsSiHeader?.classList.add("active")
            for (const icon of res.si) {
                const iconEl = createIconEl({
                    title: icon.title,
                    url: `https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/${icon.slug}.svg`,
                    hex: "#" + icon.hex
                })
                iconSearchResultsSi?.appendChild(iconEl)
            }
        }

        if (res.fa.length) {
            iconSearchResultsFaHeader?.classList.add("active")
            for (const icon of res.fa) {
                const iconEl = createIconEl({
                    title: icon.name,
                    url: `https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@6.1.1/svgs/solid/${icon.name}.svg`,
                    hex: defaultColor
                })
                iconSearchResultsFa?.appendChild(iconEl)
            }
        }

    }, 500)
})

colorPicker.onChange((c: hex) => changePreviewColor(c))

suggestedColor?.addEventListener("click", () => {
    const color = suggestedColor.dataset.hex
    if (color) {
        colorPicker.setColor(color)
        changePreviewColor(color)
    }
})

const validUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
linkInp.addEventListener("input", () => {
    const valid = linkInp.value == "" || validUrl.test(linkInp.value)
    linkValidation?.classList.toggle("active", !valid)
})

// Creating Dynamic Cells
const builtInCells = Array.from(document.querySelectorAll<HTMLElement>("#add-modal__dynamic-cell-tab .icon-wrapper"))
const iframeSrcInp = <HTMLInputElement>document.getElementById("add-modal__iframe-src-inp")
const dynamicCellPreview = document.querySelector<HTMLIFrameElement>("#add-modal__dynamic-cell-tab .add-modal__preview iframe")
const dynamicCellFinishBtn = document.querySelector<HTMLElement>("#add-modal__dynamic-cell-tab .add-modal__finish")!

let lastClickedDynIconSrc: string

function onDynamicIconClick(icon: HTMLElement) {
    iframeSrcInp.value = ""
    lastClickedDynIconSrc = icon.dataset.src!
    dynamicCellPreview!.src = generateIframeUrl(icon.dataset.src!, { preview: true })
}

for (const icon of builtInCells)
    icon.addEventListener("click", () => onDynamicIconClick(icon))

// update dynamic cell preview
iframeSrcInp.addEventListener("input", () => {
    dynamicCellPreview!.src = generateIframeUrl(iframeSrcInp.value, { preview: true })
})

function loadPreview(preview: SerializedCellContent) {
    if (preview.type == "d") {
        iframeSrcInp.src = preview.src.startsWith("/dynamic-cells/") ? "" : preview.src
    } else {
        onIconClick({
            hex: preview.bgColor || defaultColor,
            title: "",
            url: preview.iconUrl
        })
        linkInp.value = preview.link
    }
}

function resetModal() {
    // reset inputs
    searchIconsInp.value = ""
    iconSearchResultsSi!.innerHTML = ""
    iconSearchResultsFa!.innerHTML = ""
    iconSearchResultsFaHeader?.classList.remove("active")
    iconSearchResultsSiHeader?.classList.remove("active")

    colorPicker.setColor(defaultColor)
    suggestedColor!.style.backgroundColor = defaultColor
    linkInp!.value = ""
    iframeSrcInp.value = ""
    linkValidation?.classList.remove("active")

    // reset previews
    linkIconPreview!.style.backgroundColor = defaultColor
    linkIconPreviewImg!.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
    dynamicCellPreview!.src = ""
}

export function openAddModal(preview?: SerializedCellContent) {
    if (preview) loadPreview(preview)

    return new Promise<null | SerializedCellContent>(res => {
        addModal.classList.add("active")

        const onClose = (e: MouseEvent) => {
            res(null)
            addModal.classList.remove("active")
        }

        closeBtn.onclick = onClose
        addModal.onclick = e => {
            if (e.target != addModal) return
            onClose(e)
        }

        linkCellFinishBtn.onclick = () => {
            res({
                type: "l",
                iconUrl: linkIconPreviewImg!.src,
                link: linkInp.value,
                bgColor: colorPicker.getHexString()
            })
            addModal.classList.remove("active")
            resetModal()
        }

        dynamicCellFinishBtn.onclick = () => {
            let src = iframeSrcInp.value
            if (src === "" && lastClickedDynIconSrc)
                src = lastClickedDynIconSrc

            res({
                type: "d",
                src
            })
            addModal.classList.remove("active")
            resetModal()
        }
    })
}
