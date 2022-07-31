import { Grid, hex } from "@backend-types/types"
import { GridStack } from "gridstack"
import ColorPicker from "simple-color-picker"
import { onClickOutside } from "../utlis/utils"
import { createError } from "./error"
import { dummyClass, removeDummies, fillGridWithDummies } from "./grid-utils"

export default (grid: GridStack, initialGrid: Grid) => {
    const settings = document.querySelector(".settings")
    const settingsBtn = document.getElementById("grid__menu__settings")

    settingsBtn?.addEventListener("click",
        () => settings?.classList.toggle("active")
    )

    onClickOutside([settings, settingsBtn], () => {
        settings?.classList.remove("active")
    })

    /* Grid colors */
    const bgColorBtn = document.querySelector<HTMLDivElement>(".settings__bg-color .settings__color")
    const bgColorBox = document.querySelector(".settings__bg-color .settings__color-box")
    const cellColorBtn = document.querySelector<HTMLDivElement>(".settings__cell-color .settings__color")
    const cellColorBox = document.querySelector(".settings__cell-color .settings__color-box")

    const bgColorPicker = new ColorPicker({
        el: "#settings__bg-color-picker",
        color: initialGrid.bg || "#212121",
        width: 170,
        height: 130
    })

    bgColorPicker.onChange((c: hex) => {
        bgColorBtn!.style.backgroundColor = c
    })

    bgColorBtn?.addEventListener("click", () => {
        bgColorBox?.classList.toggle("active")
    })

    onClickOutside([bgColorBtn, bgColorBox], () => {
        bgColorBox?.classList.remove("active")
    })

    const cellColorPicker = new ColorPicker({
        el: "#settings__cell-color-picker",
        color: initialGrid.cell || "#343434",
        width: 170,
        height: 130
    })

    cellColorPicker.onChange((c: hex) => {
        cellColorBtn!.style.backgroundColor = c
    })

    cellColorBtn?.addEventListener("click", () => {
        cellColorBox?.classList.toggle("active")
    })

    onClickOutside([cellColorBtn, cellColorBox], () => {
        cellColorBox?.classList.remove("active")
    })

    /* Grid dimensions */
    const gridWidthInp = <HTMLInputElement>document.getElementById("settings__grid-w")
    const gridWidthMin = parseInt(gridWidthInp.min)
    const gridWidthDiff = parseInt(gridWidthInp.max) - gridWidthMin
    const gridWidthSpan = <HTMLSpanElement>document.getElementById("settings__grid-w-value")
    const gridHeightInp = <HTMLInputElement>document.getElementById("settings__grid-h")
    const gridHeightMin = parseInt(gridHeightInp.min)
    const gridHeightDiff = parseInt(gridHeightInp.max) - gridHeightMin
    const gridHeightSpan = <HTMLSpanElement>document.getElementById("settings__grid-h-value")

    const setWidthInpBg = () => gridWidthInp.style.setProperty("--val", (((parseInt(gridWidthInp.value) - gridWidthMin) / gridWidthDiff) * 100).toString())
    const setHeightInpBg = () => gridHeightInp.style.setProperty("--val", (((parseInt(gridHeightInp.value) - gridHeightMin) / gridHeightDiff) * 100).toString())

    gridWidthInp.value = initialGrid.col.toString()
    gridHeightInp.value = initialGrid.row.toString()
    gridWidthSpan.innerText = initialGrid.col.toString()
    gridHeightSpan.innerText = initialGrid.row.toString()
    setWidthInpBg()
    setHeightInpBg()

    gridWidthInp.addEventListener("input", () => {
        gridWidthSpan.innerText = gridWidthInp.value
        setWidthInpBg()
    })

    gridHeightInp.addEventListener("input", () => {
        gridHeightSpan.innerText = gridHeightInp.value
        setHeightInpBg()
    })

    /* Saving */
    const saveBtn = document.querySelector<HTMLButtonElement>(".settings__save")

    saveBtn?.addEventListener("click", async () => {
        const values = {
            bgColor: bgColorPicker.getHexString(),
            cellColor: cellColorPicker.getHexString(),
            col: parseInt(gridWidthInp.value),
            row: parseInt(gridHeightInp.value)
        }

        let cellsCollide = false
        if (values.col < grid.opts.column! || values.row < grid.opts.maxRow!) {
            for (const cell of grid.getGridItems()) {
                if (cell.classList.contains(dummyClass))
                    continue

                const x = parseInt(cell.getAttribute("gs-x") || "0")
                const y = parseInt(cell.getAttribute("gs-y") || "0")
                const w = parseInt(cell.getAttribute("gs-w") || "0")
                const h = parseInt(cell.getAttribute("gs-h") || "0")

                if (x + w > values.col || y + h > values.row) {
                    cellsCollide = true
                    const content = cell.querySelector<HTMLDivElement>(".grid-stack-item-content")
                    content?.classList.remove("red-outline")
                    // neccessary for the animation to work (https://stackoverflow.com/questions/22093141/adding-class-via-js-wont-trigger-css-animation)
                    void content?.offsetWidth
                    content?.classList.add("red-outline")
                }
            }
        }

        if (cellsCollide) {
            createError("Some cells does not fit in new size")
            settings?.classList.remove("active")
            return
        }

        await fetch("/grid/update-settings", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(values)
        })

        document.body.style.setProperty("--bg-color", values.bgColor)
        document.body.style.setProperty("--cell-color", values.cellColor)
        removeDummies(grid)
        grid.column(values.col, "none")
        grid.opts.maxRow = values.col
        grid.engine.maxRow = values.row
        grid.el.parentElement!.style.width = `${140 * values.col}px`
        grid.el.parentElement!.style.height = `${140 * values.row}px`
        if (!grid.el.classList.contains("editing")) fillGridWithDummies(grid)
        settings?.classList.remove("active")
    })
}
