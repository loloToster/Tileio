import { GridItemHTMLElement, GridStack, GridStackWidget } from "gridstack"

import { Grid, SerializedCell, SerializedCellContent, SerializedDynamicCellContent, SerializedLinkCellContent } from "@backend-types/types"
import { onClickOutside, isDark } from "../utlis/utils"
import { openAddModal } from "./add-modal"

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

export async function saveGrid(grid: GridStack) {
    const cells = grid.getGridItems()

    const newCells = []
    for (const cell of cells) {
        if (cell.classList.contains(dummyClass)) continue

        let content: SerializedCellContent | undefined
        // find element that contains serialized data of the cell
        const elementWithSerializedData = cell.querySelector("[data-serialized]")
        if (elementWithSerializedData instanceof HTMLElement && elementWithSerializedData.dataset.serialized)
            content = JSON.parse(elementWithSerializedData.dataset.serialized)

        newCells.push({
            w: parseInt(cell.getAttribute("gs-w") || "1"),
            h: parseInt(cell.getAttribute("gs-h") || "1"),
            x: parseInt(cell.getAttribute("gs-x") || "0"),
            y: parseInt(cell.getAttribute("gs-y") || "0"),
            content
        })
    }

    const newGrid: Grid = {
        col: grid.opts.column! as number,
        row: grid.opts.row!,
        cells: newCells
    }

    // TODO: onerror
    const res = await fetch("/grid/update", {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(newGrid)
    }) // .then(r => r.json())
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
            onclick: (e, grid, el, cell) => {
                console.log("edit")
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
                fillGridWithDummies(grid)
                saveGrid(grid)
            }
        }
    ]

function customContextmenu(e: MouseEvent, grid: GridStack, widgetEl: GridItemHTMLElement, cell: SerializedCell) {
    e.preventDefault()
    document.querySelectorAll(".rmenu").forEach(x => x.remove())

    let rmenu = document.createElement("div")
    rmenu.classList.add("rmenu")
    rmenu.style.left = `${e.pageX}px`
    rmenu.style.top = `${e.pageY}px`

    onClickOutside([rmenu], () => {
        rmenu.remove()
    })

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
            if (grid.el.classList.contains("editing")) return
            customContextmenu(e, grid, element, cell)
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
