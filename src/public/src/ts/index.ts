import { GridStack } from "gridstack"
import "gridstack/dist/h5/gridstack-dd-native"

async function main() {
    let initialGrid = await fetch("/grid").then(r => r.json())

    const trashSelector = "#trash"

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

    const trash = document.querySelector(trashSelector)
    grid.on("dragstart", () => trash?.classList.add("active"))
    grid.on("dragstop", () => trash?.classList.remove("active"))

    const dummyClass = "dummy-cell"

    function fillGridWithDummies() {
        for (let i = 0; i < initialGrid.row * initialGrid.col; i++) {
            const widget = { content: "" }
            if (!grid.willItFit(widget)) break

            let widgetEl = grid.addWidget(widget)
            widgetEl.classList.add(dummyClass)
        }
    }

    function removeDummies() {
        const allDummies = grid.getGridItems()

        for (const cell of allDummies) {
            if (cell.classList.contains(dummyClass))
                grid.removeWidget(cell, true, false)
        }
    }

    for (const cell of initialGrid.cells) {
        grid.addWidget(cell)
    }

    fillGridWithDummies()

    async function saveGrid() {
        const cells = grid.save()

        if (!Array.isArray(cells)) return console.error("grid.save returned bad type")

        const newCells = []
        for (const cell of cells) {
            newCells.push({
                w: cell.w,
                h: cell.h,
                x: cell.x,
                y: cell.y
            })
        }

        const res = await fetch("/grid/update", {
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                col: initialGrid.col,
                row: initialGrid.row,
                cells: newCells
            })
        }) // .then(r => r.json())
    }

    const editButton = document.getElementById("edit")
    const addButton = document.getElementById("add-cell")

    let editing = false
    editButton?.addEventListener("click", async () => {
        editing = !editing
        editButton.parentElement?.classList.toggle("active", editing)

        if (editing) {
            grid.enable()
            removeDummies()
        } else {
            grid.disable()
            await saveGrid()
            fillGridWithDummies()
        }
    })

    const createCellModal = document.getElementById("add-cell-modal")

    // TODO: check if cell can fit
    addButton?.addEventListener("click", () => {
        createCellModal?.classList.add("active")
    })

    window.addEventListener("click", e => {
        if (e.target == createCellModal)
            createCellModal?.classList.remove("active")
    })
}

main()
