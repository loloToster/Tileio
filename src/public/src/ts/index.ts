import { GridStack } from "gridstack"

import { Grid } from "@backend-types/types"
import { onClickOutside, setCSSVar } from "./utlis/utils"
import { fillGridWithDummies, createWidgetFromSerializedCell } from "./index/grid-utils"
import setupEditPanel, { trashSelector } from "./index/edit-panel"
import setupSettings from "./index/settings"
import { setupIframeApi } from "./index/iframe-api-handler"
import { createError } from "./index/error"

async function main() {
    let initialGrid: Grid
    try {
        initialGrid = await fetch("/grid").then(r => r.json())
    } catch {
        createError("Failed to load grid")
        return
    }

    const loading = document.querySelector(".grid__loading")
    loading?.classList.remove("active")

    setCSSVar(document.body, "bg-color", initialGrid.bg || "#212121")
    setCSSVar(document.body, "cell-color", initialGrid.cell || "#343434")
    setCSSVar(document.body, "col", initialGrid.col)
    setCSSVar(document.body, "row", initialGrid.row)

    const grid = GridStack.init({
        row: initialGrid.row,
        column: initialGrid.col,
        /* cellHeight: "initial", */
        margin: "5px",
        disableOneColumnMode: true,
        removable: trashSelector,
        float: true,
        disableDrag: true,
        disableResize: true
    })

    for (const cell of initialGrid.cells) {
        createWidgetFromSerializedCell(grid, cell)
    }

    fillGridWithDummies(grid)

    setupSettings(grid, initialGrid)
    setupEditPanel(grid)
    setupIframeApi(grid)

    const profile = document.querySelector(".profile")
    const profileBtn = document.getElementById("grid__menu__profile")

    if (!profile || !profileBtn)
        throw new Error("Profile or ProfileBtn element doesnt exist")

    profileBtn.addEventListener("click",
        () => profile.classList.toggle("active")
    )

    onClickOutside([profile, profileBtn], () => {
        profile.classList.remove("active")
    })

    window.addEventListener("beforeunload", e => {
        if (!grid.el.classList.contains("editing")) return

        const confirmationMessage = "Are you sure you want to leave?"
            + "You have unsaved changes that will be lost if you leave."

        const ev = (e || window.event)
        ev.returnValue = confirmationMessage

        return confirmationMessage
    })
}

main()
