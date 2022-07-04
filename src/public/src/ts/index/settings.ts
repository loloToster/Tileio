import { GridStack } from "gridstack"
import ColorPicker from "simple-color-picker"
import { onClickOutside } from "../utlis/utils"

export default (grid: GridStack) => {
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
        width: 170,
        height: 130
    })

    bgColorPicker.onChange(() => {
        bgColorBtn!.style.backgroundColor = bgColorPicker.getHexString()
    })

    bgColorBtn?.addEventListener("click", () => {
        bgColorBox?.classList.toggle("active")
    })

    onClickOutside([bgColorBtn, bgColorBox], () => {
        bgColorBox?.classList.remove("active")
    })

    const cellColorPicker = new ColorPicker({
        el: "#settings__cell-color-picker",
        width: 170,
        height: 130
    })

    cellColorPicker.onChange(() => {
        cellColorBtn!.style.backgroundColor = cellColorPicker.getHexString()
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

    gridWidthInp.addEventListener("input", () => {
        gridWidthSpan.innerText = gridWidthInp.value
        gridWidthInp.style.setProperty("--val", (((parseInt(gridWidthInp.value) - gridWidthMin) / gridWidthDiff) * 100).toString())
    })

    gridHeightInp.addEventListener("input", () => {
        gridHeightSpan.innerText = gridHeightInp.value
        gridHeightInp.style.setProperty("--val", (((parseInt(gridHeightInp.value) - gridHeightMin) / gridHeightDiff) * 100).toString())
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

        await fetch("/grid/update-settings", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(values)
        })

        document.body.style.setProperty("--bg-color", values.bgColor)
        document.body.style.setProperty("--cell-color", values.cellColor)
    })
}
