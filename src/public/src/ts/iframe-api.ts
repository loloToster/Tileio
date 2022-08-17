export class Widget {
    constructor() {
        window.addEventListener("contextmenu", e => {
            if (!window.top) throw Error("No top window")
            e.preventDefault()
            window.top.postMessage({
                type: "cm", ev: {
                    clientX: e.clientX,
                    clientY: e.clientY
                }
            })
        })
    }

    createError(msg: string) {
        if (!window.top) throw Error("No top window")
        window.top.postMessage({
            type: "ce", msg
        })
    }
}

declare global {
    interface Window { createWidget: () => Widget }
}

window.createWidget = () => new Widget()
export default window.createWidget
