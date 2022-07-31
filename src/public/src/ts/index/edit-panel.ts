import { GridStack } from "gridstack"

import { createWidgetFromSerializedCell, toggleGridEditing } from "./grid-utils"
import { openAddModal } from "./add-modal"

export const trashSelector = "#grid__menu__trash"

export default (grid: GridStack) => {
    const trash = document.querySelector(trashSelector)

    grid.on("dragstart", () => trash?.classList.add("active"))
    grid.on("dragstop", () => trash?.classList.remove("active"))

    const editButton = document.getElementById("grid__menu__edit")
    editButton?.addEventListener("click", () => toggleGridEditing(grid))

    // Creating Cells
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

    const addButton = document.getElementById("grid__menu__add")

    // TODO: check if cell can fit
    addButton?.addEventListener("click", async () => {
        let content = await openAddModal()
        if (!content) return
        const size = content.type == "d" ? { w: 2, h: 2 } : {}
        createWidgetFromSerializedCell(grid, { ...size, content })
    })
}
