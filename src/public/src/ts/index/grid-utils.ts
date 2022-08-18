import { GridItemHTMLElement, GridStack, GridStackWidget } from "gridstack"

import { SerializedCell, SerializedCellContent, SerializedDynamicCellContent, SerializedLinkCellContent } from "@backend-types/types"
import { onClickOutside, isDark } from "../utlis/utils"
import { openAddModal } from "./add-modal"
import { createError } from "./error"

export const dummyClass = "dummy-cell"

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

export function serializeGridCells(grid: GridStack): SerializedCell[] {
    const cells = grid.getGridItems()

    const serializedCells: SerializedCell[] = []
    for (const cell of cells) {
        if (cell.classList.contains(dummyClass)) continue

        let content: SerializedCellContent | undefined
        // find element that contains serialized data of the cell
        const elementWithSerializedData = cell.querySelector("[data-serialized]")
        if (elementWithSerializedData instanceof HTMLElement && elementWithSerializedData.dataset.serialized)
            content = JSON.parse(elementWithSerializedData.dataset.serialized)

        serializedCells.push({
            w: parseInt(cell.getAttribute("gs-w") || "1"),
            h: parseInt(cell.getAttribute("gs-h") || "1"),
            x: parseInt(cell.getAttribute("gs-x") || "0"),
            y: parseInt(cell.getAttribute("gs-y") || "0"),
            content
        })
    }

    return serializedCells
}

export async function saveGrid(grid: GridStack) {
    const newCells = serializeGridCells(grid)

    try {
        const res = await fetch("/grid/update", {
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(newCells)
        })
        if (res.status != 200) throw Error("Bad status")
    } catch {
        createError("Could not save the grid")
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

type contextMenuFunc = (e: MouseEvent, grid: GridStack, el: GridItemHTMLElement, cell: SerializedCell) => void

const contextMenuBtns: Array<{
    class: string,
    innerText: string,
    onclick: contextMenuFunc
}> = [
        {
            class: "edit", innerText: "Edit",
            onclick: async (e, grid, el, cell) => {
                const content = await openAddModal(cell.content)
                if (!content) return

                const editing = grid.el.classList.contains("editing")

                cell.content = content
                cell.w = parseInt(el.getAttribute("gs-w") || "1")
                cell.h = parseInt(el.getAttribute("gs-h") || "1")

                if (editing) {
                    const gsX = el.getAttribute("gs-x")
                    const gsY = el.getAttribute("gs-y")
                    if (gsX) cell.x = parseInt(gsX)
                    if (gsY) cell.y = parseInt(gsY)
                }

                grid.removeWidget(el)
                createWidgetFromSerializedCell(grid, cell)

                if (!editing) saveGrid(grid)
            }
        },
        {
            class: "resize", innerText: "Resize",
            onclick: (e, grid, el, cell) => {
                toggleGridEditing(grid, true)
            }
        },
        {
            class: "delete", innerText: "Delete",
            onclick: (e, grid, el, cell) => {
                grid.removeWidget(el)

                if (grid.el.classList.contains("editing"))
                    return

                fillGridWithDummies(grid)
                saveGrid(grid)
            }
        }
    ]

interface customContextMenuMouseEvent {
    x: Number,
    y: Number,
    originalEvent?: MouseEvent
}

// TODO: add custom context menu on dummy cells
function customContextMenu(
    e: customContextMenuMouseEvent,
    grid: GridStack,
    widgetEl: GridItemHTMLElement,
    cell: SerializedCell,
    customBtns: Array<{ text: string, id: number }> = [],
    iframe?: HTMLIFrameElement
) {
    e.originalEvent?.preventDefault()

    document.querySelectorAll(".rmenu").forEach(x => x.remove())

    let rmenu = document.createElement("div")
    rmenu.classList.add("rmenu")
    rmenu.style.left = `${e.x}px`
    rmenu.style.top = `${e.y}px`

    onClickOutside([rmenu], () => {
        rmenu.remove()
    })

    // iframe api btns
    customBtns.forEach(btn => {
        let btnEl = document.createElement("button")
        btnEl.classList.add("rmenu__btn")
        btnEl.innerText = btn.text
        btnEl.addEventListener("click", e => {
            iframe?.contentWindow?.postMessage({
                type: "cmbtnaction",
                id: btn.id
            })
        })
        rmenu.appendChild(btnEl)
    })

    // default btns
    contextMenuBtns.forEach(btn => {
        let btnEl = document.createElement("button")
        btnEl.classList.add("rmenu__btn", `rmenu__${btn.class}`)
        btnEl.innerText = btn.innerText
        btnEl.addEventListener("click", e => {
            btn.onclick(e, grid, widgetEl, cell)
            rmenu.remove()
        })
        rmenu.appendChild(btnEl)
    })

    document.body.appendChild(rmenu)
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

    element.querySelector<HTMLDivElement>(".grid-stack-item-content")!
        .addEventListener("contextmenu", e => {
            customContextMenu(
                { x: e.pageX, y: e.pageY, originalEvent: e },
                grid, element, cell
            )
        })

    return element
}

const editButton = document.getElementById("grid__menu__edit")!
const gridBorder = document.querySelector<HTMLElement>(".grid__border")
export async function toggleGridEditing(grid: GridStack, force?: boolean) {
    let editing: boolean
    if (typeof force === "undefined") {
        editing = editButton.parentElement!.classList.toggle("active")
    } else {
        editing = force
        editButton.parentElement?.classList.toggle("active", force)
    }

    grid.el.classList.toggle("editing", editing)

    if (editing) {
        grid.enable()
        removeDummies(grid)
        editButton.title = "Save Cells"
        gridBorder!.style.opacity = "1"
    } else {
        grid.disable()
        await saveGrid(grid)
        fillGridWithDummies(grid)
        editButton.title = "Edit Cells"
        gridBorder!.style.opacity = "0"
    }
}

export function setupIframeApi(grid: GridStack) {
    // Update iframe src on cell resize
    grid.on("resizestop", (e, el) => {
        if (!(el instanceof HTMLElement)) return
        if (!el.classList.contains("dynamic-cell")) return

        const width = parseInt(el.getAttribute("gs-w") || "0")
        const height = parseInt(el.getAttribute("gs-h") || "0")

        const serializedCell = JSON.parse(el.querySelector<HTMLElement>("[data-serialized]")!.dataset.serialized!)
        const iframe = el.querySelector("iframe")!

        const newSrc = serializedCell.src + `?w=${width}&h=${height}`

        if (newSrc != iframe.src)
            iframe.src = newSrc
    })

    // iframe API handler
    window.addEventListener("message", e => {
        // @ts-ignore
        const iframe: HTMLIFrameElement | null = e.source?.frameElement
        if (!iframe) return

        const serializedCell = JSON.parse(iframe.dataset.serialized || "{}")
        if (serializedCell.type !== "d") return

        switch (e.data.type) {
            case "ce": {
                createError(e.data.msg)
            }

            case "cm": {
                let cellElement: GridItemHTMLElement | undefined

                for (const cell of grid.getGridItems()) {
                    const cellIframe = cell.querySelector("iframe")
                    if (!cellIframe || cellIframe != iframe) continue

                    cellElement = cell
                    break
                }

                if (!cellElement) return

                const iframeDimensions = iframe.getBoundingClientRect()
                const x = iframeDimensions.left + e.data.ev.clientX
                const y = iframeDimensions.top + e.data.ev.clientY

                customContextMenu({ x, y }, grid, cellElement, serializedCell, e.data.customBtns || [], iframe)
            }
        }
    })
}
