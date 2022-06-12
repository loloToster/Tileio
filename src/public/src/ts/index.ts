import { GridStack, GridStackWidget } from "gridstack"
import "gridstack/dist/h5/gridstack-dd-native"

function getLuminance(hex: string) {
    // hexToRgb: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    const color = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null

    if (!color) return -1

    // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
}

const LUMINANCE_THRESHOLD = 236

type hex = string
const isDark = (c: hex) => getLuminance(c) < LUMINANCE_THRESHOLD

async function main() {
    let initialGrid = await fetch("/grid").then(r => r.json())

    const trashSelector = "#grid__trash"

    const grid = GridStack.init({
        row: initialGrid.row,
        column: initialGrid.col,
        cellHeight: "initial",
        margin: "5px",
        disableOneColumnMode: true,
        removable: trashSelector,
        float: true,
        disableDrag: true,
        disableResize: true
    })

    const trash = document.querySelector(trashSelector)
    grid.on("dragstart", () => trash?.classList.add("active"))
    grid.on("dragstop", () => trash?.classList.remove("active"))

    const dummyClass = "dummy-cell"

    function fillGridWithDummies() {
        for (let i = 0; i < initialGrid.row * initialGrid.col; i++) {
            const widget = { content: "" }
            if (!grid.willItFit(widget)) break

            let widgetEl = grid.addWidget(widget)
            widgetEl.classList.add(dummyClass)
        }
    }

    function removeDummies() {
        const allDummies = grid.getGridItems()

        for (const cell of allDummies) {
            if (cell.classList.contains(dummyClass))
                grid.removeWidget(cell, true, false)
        }
    }

    interface SerializedCellContent {
        iconUrl: string,
        bgColor?: hex,
        link: string
    }

    interface SerializedCell {
        x?: number,
        y?: number,
        w?: number,
        h?: number,
        content?: SerializedCellContent
    }

    function unserializeContent(c: SerializedCellContent) {
        const a = document.createElement("a")

        a.classList.add("grid-stack-item-content__link")
        a.href = c.link
        a.target = "_blank"
        if (c.bgColor)
            a.style.backgroundColor = c.bgColor

        const img = document.createElement("img")
        if (typeof c.bgColor == "undefined" || isDark(c.bgColor))
            img.classList.add("white")
        img.classList.add("grid-stack-item-content__icon")
        img.src = c.iconUrl

        a.appendChild(img)
        a.dataset.serialized = JSON.stringify(c)

        let content = a.outerHTML
        a.remove()
        return content
    }

    function createWidgetFromSerializedCell(cell: SerializedCell) {
        let widget: GridStackWidget = {
            x: cell.x,
            y: cell.y,
            w: cell.w,
            h: cell.h
        }

        if (cell.content)
            widget.content = unserializeContent(cell.content)

        return grid.addWidget(widget)
    }

    for (const cell of initialGrid.cells) {
        createWidgetFromSerializedCell(cell)
    }

    fillGridWithDummies()

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
                col: initialGrid.col,
                row: initialGrid.row,
                cells: newCells
            })
        }) // .then(r => r.json())
    }

    const editButton = document.getElementById("grid__edit")

    let editing = false
    editButton?.addEventListener("click", async () => {
        editing = !editing
        editButton.parentElement?.classList.toggle("active", editing)

        if (editing) {
            grid.enable()
            removeDummies()
        } else {
            grid.disable()
            await saveGrid()
            fillGridWithDummies()
        }
    })

    // Creating Cells
    const addButton = document.getElementById("grid__add")
    const createCellModal = document.querySelector(".add-modal")
    const searchIconsInput = <HTMLInputElement>document.getElementById("add-modal__icon-inp")
    const iconSearchResultsBox = document.querySelector(".add-modal__icons")
    const suggestedColor = document.querySelector<HTMLElement>(".add-modal__suggested-color")
    const colorPicker = <HTMLInputElement>document.getElementById("add-modal__color-picker")
    const linkInp = <HTMLInputElement>document.getElementById("add-modal__link-inp")
    const linkValidation = document.querySelector(".add-modal__link-validator")
    const preview = document.querySelector<HTMLElement>(".add-modal__preview")
    const previewImg = preview?.querySelector("img")
    const finishBtn = document.querySelector<HTMLElement>(".add-modal__finish")

    const defaultStateOfCell = (): SerializedCellContent => JSON.parse(JSON.stringify({
        iconUrl: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
        link: "/"
    }))

    let stateOfCell: SerializedCellContent = defaultStateOfCell()

    // TODO: check if cell can fit
    addButton?.addEventListener("click", () => {
        createCellModal?.classList.add("active")
    })

    window.addEventListener("click", e => {
        if (e.target != createCellModal) return

        createCellModal?.classList.remove("active")
    })

    interface Icon {
        title: string,
        slug: string,
        source: string,
        hex: hex
    }

    interface FriendlyIcon extends Icon {
        url: string
    }

    async function searchForIcon(q: string, l: number): Promise<Icon[]> {
        return await fetch(`/grid/search_icon?q=${q}&l=${l}`).then(r => r.json())
    }

    function changePreviewColor(color: hex) {
        preview!.style.backgroundColor = color
        previewImg?.classList.toggle("white", isDark(color))
        stateOfCell.bgColor = color
    }

    function onIconClick(e: Event, icon: FriendlyIcon) {
        previewImg!.src = icon.url
        suggestedColor!.style.backgroundColor = icon.hex
        suggestedColor!.dataset.hex = icon.hex
        stateOfCell.iconUrl = icon.url
        changePreviewColor(icon.hex)
    }

    suggestedColor?.addEventListener("click", () => {
        const color = suggestedColor.dataset.hex
        if (color) changePreviewColor(color)
    })

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

    colorPicker.addEventListener("click", () => {
        changePreviewColor(colorPicker.value)
    })

    colorPicker?.addEventListener("input", () => {
        changePreviewColor(colorPicker.value)
    })

    const validUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    linkInp.addEventListener("input", () => {
        const valid = linkInp.value == "" || validUrl.test(linkInp.value)
        linkValidation?.classList.toggle("active", !valid)
        stateOfCell.link = linkInp.value
    })

    finishBtn?.addEventListener("click", () => {
        createWidgetFromSerializedCell({ content: stateOfCell })
        stateOfCell = defaultStateOfCell()
        createCellModal?.classList.remove("active")
    })
}

main()
