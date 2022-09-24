import BigEval from "./Evaluator"
import createWidget from "../../ts/iframe-api"

createWidget()

const input = document.querySelector<HTMLInputElement>(".calc__input")!
const clearInput = document.querySelector<HTMLElement>(".calc__clear")!
const resultBox = document.querySelector<HTMLDivElement>(".calc__result")!

function toggleClearBtn() {
    clearInput.classList.toggle("active", Boolean(input.value))
}

const evaluator = new BigEval()

function onInput() {
    toggleClearBtn()

    let result: string

    let expression = input.value.replace(/π/g, ` PI `)
    let evaluation: unknown = evaluator.exec(expression)

    if (typeof evaluation === "object")
        result = "= " + evaluation?.toString()
    else
        result = "Invalid Syntax"

    resultBox.innerText = result
}

input.addEventListener("input", () => onInput())

clearInput.addEventListener("click", () => {
    input.value = ""
    toggleClearBtn()
    onInput()
    input.focus()
})

const operators = [
    {
        class: "ce", action: () => {
            input.value = input.value.slice(0, -1)
            toggleClearBtn()
            onInput()
        }
    },
    { class: "root", action: () => { } },
    {
        class: "pi", action: () => {
            input.value += "π"
            onInput()
            input.focus()
        }
    },
    { class: "pow", action: () => { } }
]

operators.forEach(op => {
    document.querySelector<HTMLButtonElement>(`.calc__${op.class}`)
        ?.addEventListener("click", () => op.action())
})
