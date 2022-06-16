import { GridStack } from "gridstack"
import "gridstack/dist/h5/gridstack-dd-native"

import { fillGridWithDummies, createWidgetFromSerializedCell } from "./index/grid-utils"
import setupEditPanel, { trashSelector } from "./index/edit-panel"

async function main() {
    // TODO: on error
    let initialGrid = await fetch("/grid").then(r => r.json())

    const loading = document.querySelector(".grid__loading")
    loading?.classList.remove("active")

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

    for (const cell of initialGrid.cells) {
        createWidgetFromSerializedCell(grid, cell)
    }

    fillGridWithDummies(grid)

    setupEditPanel(grid)

    const profile = document.querySelector(".profile")
    const profileBtn = document.getElementById("grid__menu__profile")

    if (!profile || !profileBtn)
        throw new Error("Profile or ProfileBtn element doesnt exist")

    profileBtn.addEventListener("click",
        () => profile.classList.toggle("active")
    )

    /**
     * if user clicked anywhere outside of the profile or profile button
     * remove active class
     */
    window.addEventListener("click", e => {
        if (e.composedPath().includes(profile) || e.composedPath().includes(profileBtn)) return
        profile.classList.remove("active")
    })
}

main()
