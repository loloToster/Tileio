import { GridStack, GridStackWidget } from "gridstack"

export type hex = string

export interface SerializedCellContent {
    iconUrl: string,
    bgColor?: hex,
    link: string
}

export interface SerializedCell {
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    content?: SerializedCellContent
}


const dummyClass = "dummy-cell"
const LUMINANCE_THRESHOLD = 236

function getLuminance(hex: hex) {
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

export const isDark = (c: hex) => getLuminance(c) < LUMINANCE_THRESHOLD

export function fillGridWithDummies(grid: GridStack) {
    while (grid.willItFit({})) {
        let widgetEl = grid.addWidget({ content: "" })
        widgetEl.classList.add(dummyClass)
    }
}

export function removeDummies(grid: GridStack) {
    const allDummies = grid.getGridItems()

    for (const cell of allDummies) {
        if (cell.classList.contains(dummyClass))
            grid.removeWidget(cell, true, false)
    }
}

export function unserializeContent(c: SerializedCellContent) {
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

export function createWidgetFromSerializedCell(grid: GridStack, cell: SerializedCell) {
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
