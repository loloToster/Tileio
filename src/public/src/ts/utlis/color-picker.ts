import ColorPicker from "simple-color-picker"

interface ColorPickerOptions {
    window?: Window,
    el?: HTMLElement | string,
    background?: string | number,
    widthUnits?: string,
    heightUnits?: string,
    width?: number,
    height?: number,
    color?: string | number,
}

const hexRegex = /^#(?:[0-9a-fA-F]{6})$/

export default class CustomColorPicker extends ColorPicker {
    private _textInput: HTMLInputElement

    constructor(options?: ColorPickerOptions) {
        super(options)

        this._textInput = document.createElement("input")
        this._textInput.style.width = `${this.width}${options?.widthUnits || "px"}`
        this._textInput.classList.add("Scp-text-input")
        this._textInput.maxLength = 6

        this._textInput.oninput = this._textInputHandler.bind(this)

        this.$el.parentElement!.appendChild(this._textInput)

        this.onChange((hex: string) => {
            this._textInput.value = hex
        })
    }

    private _textInputHandler() {
        const input = this._textInput
        let val = input.value

        input.maxLength = val.startsWith("#") ? 7 : 6

        if (val.startsWith("#")) val = val.substring(1)
        val = "#" + val

        if (hexRegex.test(val)) this.setColor(val)
    }
}
