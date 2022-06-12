import { GridStack } from "gridstack"
import "gridstack/dist/h5/gridstack-dd-native"

import { fillGridWithDummies, createWidgetFromSerializedCell } from "./index/grid-utils"
import setupEditPanel, { trashSelector } from "./index/edit-panel"

async function main() {
    // TODO: on error
    let initialGrid = await fetch("/grid").then(r => r.json())

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
}

main()
