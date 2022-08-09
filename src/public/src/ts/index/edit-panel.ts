import { GridStack } from "gridstack"

import { createWidgetFromSerializedCell, serializeGridCells, toggleGridEditing } from "./grid-utils"
import { openAddModal } from "./add-modal"
import { createError } from "./error"
import { SerializedCell } from "@backend-types/types"

export const trashSelector = "#grid__menu__trash"

export default (grid: GridStack) => {
    const trash = document.querySelector(trashSelector)

    grid.on("dragstart", () => trash?.classList.add("active"))
    grid.on("dragstop", () => trash?.classList.remove("active"))

    let prevGridCells: SerializedCell[] = []

    const editButton = document.getElementById("grid__menu__edit")!
    editButton.addEventListener("click", () => {
        toggleGridEditing(grid)
        prevGridCells = serializeGridCells(grid)
    })

    // Reverting changes
    const revertButton = document.getElementById("grid__menu__revert")!

    revertButton.addEventListener("click", () => {
        grid.removeAll()
        for (const cell of prevGridCells) {
            createWidgetFromSerializedCell(grid, cell)
        }
    })

    // Creating Cells
    const addButton = document.getElementById("grid__menu__add")!

    addButton.addEventListener("click", async () => {
        if (!grid.willItFit({}))
            return createError("There is no space for more cells")

        let content = await openAddModal()
        if (!content) return
        const size = content.type == "d" && grid.willItFit({ w: 2, h: 2 }) ? { w: 2, h: 2 } : {}
        createWidgetFromSerializedCell(grid, { ...size, content })
    })
}
