import { GridStack } from "gridstack"
import ColorPicker from "simple-color-picker"

import { hex, SerializedCellContent, Icon } from "@backend-types/types"
import { fillGridWithDummies, removeDummies, createWidgetFromSerializedCell, isDark } from "./grid-utils"

export const trashSelector = "#grid__menu__trash"

export default (grid: GridStack) => {
    const trash = document.querySelector(trashSelector)

    grid.on("dragstart", () => trash?.classList.add("active"))
    grid.on("dragstop", () => trash?.classList.remove("active"))

    async function saveGrid() {
        const cells = grid.save()

        if (!Array.isArray(cells)) return console.error("grid.save returned bad type")

        const newCells = []
        for (const cell of cells) {
            let content: SerializedCellContent | undefined
            if (cell.content) {
                let doc = new DOMParser().parseFromString(cell.content, "text/html")
                const firstEl = doc.querySelector("body > *")
                if (firstEl instanceof HTMLElement && firstEl.dataset.serialized)
                    content = JSON.parse(firstEl.dataset.serialized)
            }

            newCells.push({
                w: cell.w,
                h: cell.h,
                x: cell.x,
                y: cell.y,
                content
            })
        }

        const res = await fetch("/grid/update", {
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                col: grid.opts.column!,
                row: grid.opts.row!,
                cells: newCells
            })
        }) // .then(r => r.json())
    }

    const editButton = document.getElementById("grid__menu__edit")
    const gridBorder = document.querySelector<HTMLElement>(".grid__border")

    let editing = false
    editButton?.addEventListener("click", async () => {
        editing = !editing
        editButton.parentElement?.classList.toggle("active", editing)
        grid.el.classList.toggle("editing", editing)

        if (editing) {
            grid.enable()
            removeDummies(grid)
            editButton.title = "Save Cells"
            gridBorder!.style.opacity = "1"
        } else {
            grid.disable()
            await saveGrid()
            fillGridWithDummies(grid)
            editButton.title = "Edit Cells"
            gridBorder!.style.opacity = "0"
        }
    })

    // Creating Cells
    const menuItems = Array.from(document.getElementsByClassName("add-modal__menu__item"))
    const menuTabs = Array.from(document.getElementsByClassName("add-modal__tab"))

    for (const item of menuItems) {
        item.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"))
            item.classList.add("active")

            menuTabs.forEach(i => i.classList.remove("active"))
            document.getElementById(item.id + "-tab")?.classList.add("active")
        })
    }

    const addModal = document.querySelector(".add-modal")
    const addButton = document.getElementById("grid__menu__add")

    // TODO: check if cell can fit
    addButton?.addEventListener("click", () => {
        addModal?.classList.add("active")
    })

    window.addEventListener("click", e => {
        if (e.target != addModal) return

        addModal?.classList.remove("active")
    })

    // Creating Link Cells
    const searchIconsInput = <HTMLInputElement>document.getElementById("add-modal__icon-inp")
    const iconSearchResultsBox = document.querySelector(".add-modal__icons")
    const suggestedColor = document.getElementById("add-modal__suggested-color")
    const linkInp = <HTMLInputElement>document.getElementById("add-modal__link-inp")
    const linkValidation = document.querySelector(".add-modal__link-validator")
    const linkIconPreview = document.querySelector<HTMLElement>("#add-modal__link-cell-tab .add-modal__preview")
    const linkIconPreviewImg = linkIconPreview?.querySelector<HTMLImageElement>("img")
    const linkCellFinishBtn = document.querySelector<HTMLElement>("#add-modal__link-cell-tab .add-modal__finish")

    const colorPicker = new ColorPicker({
        width: 200,
        el: "#add-modal__color-picker"
    })

    interface FriendlyIcon extends Icon {
        url: string
    }

    async function searchForIcon(q: string, l: number): Promise<Icon[]> {
        return await fetch(`/grid/search_icon?q=${q}&l=${l}`).then(r => r.json())
    }

    function changePreviewColor(color: hex) {
        linkIconPreview!.style.backgroundColor = color
        linkIconPreviewImg?.classList.toggle("white", isDark(color))
    }

    function onIconClick(e: Event, icon: FriendlyIcon) {
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
        iconEl.addEventListener("click", e => onIconClick(e, icon))

        return iconEl
    }

    let searchTimeout: any
    searchIconsInput?.addEventListener("input", () => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(async () => {
            const icons = await searchForIcon(searchIconsInput.value, 30)
            iconSearchResultsBox!.innerHTML = ""
            for (const icon of icons) {
                const iconEl = createIconEl({
                    ...icon,
                    url: `https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/${icon.slug}.svg`,
                    hex: "#" + icon.hex
                })
                iconSearchResultsBox?.appendChild(iconEl)
            }
        }, 500)
    })

    colorPicker.onChange(() => changePreviewColor(colorPicker.getHexString()))

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

    linkCellFinishBtn?.addEventListener("click", () => {
        createWidgetFromSerializedCell(grid, {
            content: {
                type: "l",
                iconUrl: linkIconPreviewImg!.src,
                link: linkInp.value,
                bgColor: colorPicker.getHexString()
            }
        })
        addModal?.classList.remove("active")
    })

    // Creating Dynamic Cells
    const builtInCells = Array.from(document.querySelectorAll<HTMLElement>("#add-modal__dynamic-cell-tab .icon-wrapper"))
    const iframeSrcInput = <HTMLInputElement>document.getElementById("add-modal__iframe-src-inp")
    const dynamicCellPreview = document.querySelector<HTMLIFrameElement>("#add-modal__dynamic-cell-tab .add-modal__preview iframe")
    const dynamicCellFinishBtn = document.querySelector<HTMLElement>("#add-modal__dynamic-cell-tab .add-modal__finish")

    let lastClickedDynIconSrc: string

    function onDynamicIconClick(icon: HTMLElement) {
        iframeSrcInput.value = ""
        lastClickedDynIconSrc = icon.dataset.src!
        dynamicCellPreview!.src = icon.dataset.src!
    }

    for (const icon of builtInCells)
        icon.addEventListener("click", () => onDynamicIconClick(icon))

    iframeSrcInput.addEventListener("input", () => {
        dynamicCellPreview!.src = iframeSrcInput.value
    })

    dynamicCellFinishBtn?.addEventListener("click", () => {
        let src = iframeSrcInput.value
        if (src === "" && lastClickedDynIconSrc)
            src = lastClickedDynIconSrc

        createWidgetFromSerializedCell(grid, {
            w: 2,
            h: 2,
            content: {
                type: "d",
                src
            }
        })
        addModal?.classList.remove("active")
    })
}
