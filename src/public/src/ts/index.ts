import { GridStack } from "gridstack"
import "gridstack/dist/h5/gridstack-dd-native"

async function main() {
    let initialGrid = await fetch("/grid").then(r => r.json())

    const grid = GridStack.init({
        row: initialGrid.row,
        column: initialGrid.col,
        cellHeight: "initial",
        margin: "5px",
        disableOneColumnMode: true,
        removable: "#trash",
        float: true,
        disableDrag: true,
        disableResize: true
    })

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
    const addButton = document.getElementById("add")

    addButton!.style.display = "none"

    let editing = false
    editButton?.addEventListener("click", async () => {
        editing = !editing
        editButton.innerText = editing ? "Save" : "Edit"

        if (editing) {
            grid.enable()
            removeDummies()
            addButton!.style.display = "inline-block"
        } else {
            grid.disable()
            addButton!.style.display = "none"
            await saveGrid()
            fillGridWithDummies()
        }
    })

    addButton?.addEventListener("click", () => {
        if (grid.willItFit({}))
            grid.addWidget()
    })
}

main()
