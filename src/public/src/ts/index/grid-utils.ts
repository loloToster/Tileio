import { GridStack, GridStackWidget } from "gridstack"

import { hex, SerializedCell, SerializedCellContent, SerializedDynamicCellContent, SerializedLinkCellContent } from "@backend-types/types"

export const dummyClass = "dummy-cell"
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
    const allCells = grid.getGridItems()

    for (const cell of allCells) {
        if (cell.classList.contains(dummyClass))
            grid.removeWidget(cell, true, false)
    }
}

function isLink(c: SerializedCellContent): c is SerializedLinkCellContent {
    return c.type == "l"
}

function isDynamic(c: SerializedCellContent): c is SerializedDynamicCellContent {
    return c.type == "d"
}

/**
 * create string with HTML code based on SerializedCell
 * that can be put in GridStackWidget.content
 */
export function unserializeContent(cell: SerializedCell) {
    const content = cell.content!
    if (isLink(content)) {
        const a = document.createElement("a")

        a.classList.add("grid-stack-item-content__link")
        a.href = content.link
        a.target = "_blank"
        if (content.bgColor)
            a.style.backgroundColor = content.bgColor

        const img = document.createElement("img")
        if (typeof content.bgColor == "undefined" || isDark(content.bgColor))
            img.classList.add("white")
        img.classList.add("grid-stack-item-content__icon")
        img.src = content.iconUrl

        a.appendChild(img)
        a.dataset.serialized = JSON.stringify(content)

        let unserializedContent = a.outerHTML
        a.remove()

        return unserializedContent
    } else if (isDynamic(content)) {
        const editingCover = document.createElement("div")
        editingCover.classList.add("editing-cover")

        const iframe = document.createElement("iframe")
        iframe.src = content.src + `?w=${cell.w || "1"}&h=${cell.h}`
        iframe.dataset.serialized = JSON.stringify(content)

        let unserializedContent = iframe.outerHTML + editingCover.outerHTML

        editingCover.remove()
        iframe.remove()

        return unserializedContent
    } else {
        console.error("Unknown cell type")
    }
}

export function createWidgetFromSerializedCell(grid: GridStack, cell: SerializedCell) {
    let widget: GridStackWidget = {
        x: cell.x,
        y: cell.y,
        w: cell.w,
        h: cell.h
    }

    if (cell.content)
        widget.content = unserializeContent(cell)

    let element = grid.addWidget(widget)

    if (cell.content?.type == "d") element.classList.add("dynamic-cell")

    return element
}
