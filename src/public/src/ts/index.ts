import { GridStack } from "gridstack"
import "gridstack/dist/h5/gridstack-dd-native"

import { Grid } from "@backend-types/types"
import { onClickOutside } from "./utlis/utils"
import { fillGridWithDummies, createWidgetFromSerializedCell } from "./index/grid-utils"
import setupEditPanel, { trashSelector } from "./index/edit-panel"
import setupSettings from "./index/settings"

async function main() {
    // TODO: on error
    let initialGrid: Grid = await fetch("/grid").then(r => r.json())

    const loading = document.querySelector(".grid__loading")
    loading?.classList.remove("active")

    document.body.style.setProperty("--bg-color", initialGrid.bg || "#212121")
    document.body.style.setProperty("--cell-color", initialGrid.cell || "#343434")

    const gridParent = document.querySelector<HTMLDivElement>(".grid")
    gridParent!.style.width = `${140 * initialGrid.col}px`
    gridParent!.style.height = `${140 * initialGrid.row}px`

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

    setupSettings(grid, initialGrid)
    setupEditPanel(grid)

    /* Update iframe src on cell resize */
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
}

main()
