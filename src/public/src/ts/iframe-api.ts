// TODO: security (validate origin, limit number of btns, limit number of characters in a btn etc.)

interface CustomContextMenuBtn {
    id: number
    text: string,
    action: () => void
}

type CustomContextMenuBtnArg = Omit<CustomContextMenuBtn, "id">

interface CustomContextMenuObj {
    el: HTMLElement,
    btns: CustomContextMenuBtn[]
}

export class Widget {
    globalContextMenuBtns: CustomContextMenuBtn[]
    contextMenuEls: CustomContextMenuObj[]

    constructor() {
        this.globalContextMenuBtns = []
        this.contextMenuEls = []

        window.addEventListener("contextmenu", this._ContextMenuHandler.bind(this))
        window.addEventListener("message", this._msgHandler.bind(this))
    }

    private _ContextMenuHandler(e: MouseEvent) {
        if (!window.top) throw Error("No top window")
        e.preventDefault()

        window.top.postMessage({
            type: "cm", ev: {
                clientX: e.clientX,
                clientY: e.clientY
            },
            customBtns: this.globalContextMenuBtns.map(btn => {
                return { id: btn.id, text: btn.text }
            })
        })
    }

    private _fireAction(id: number) {
        const btnWithMatchingId = this.globalContextMenuBtns.find(btn => btn.id == id)
        btnWithMatchingId?.action()
    }

    private _msgHandler(e: MessageEvent) {
        switch (e.data.type) {
            case "cmbtnaction": {
                this._fireAction(e.data.id)
                break
            }

            default:
                break
        }
    }

    private _findFreeId() {
        const globalBtnsIds = this.globalContextMenuBtns.map(b => b.id)
        const elBtnsIds = this.contextMenuEls.reduce((acc: number[], val) => {
            return acc.concat(val.btns.map(b => b.id))
        }, [])

        const allIds = globalBtnsIds.concat(elBtnsIds).sort()

        for (let i = 0; i < allIds.length + 1; i++) {
            if (allIds.includes(i)) continue
            return i
        }

        throw Error("No free id found?")
    }

    private _addGlobalContextMenuBtns(btns: CustomContextMenuBtnArg[]) {
        this.globalContextMenuBtns = this.globalContextMenuBtns.concat(
            btns.map(btn => {
                return {
                    id: this._findFreeId(),
                    ...btn
                }
            })
        )
    }

    private _addContextMenuBtns(el: HTMLElement, btns: CustomContextMenuBtnArg[]) {
        this.contextMenuEls.push({
            el, btns: btns.map(btn => {
                return {
                    id: this._findFreeId(),
                    ...btn
                }
            })
        })
    }

    // TODO: on element remove
    addContextMenuBtn(btn: CustomContextMenuBtnArg): void
    addContextMenuBtn(btns: CustomContextMenuBtnArg[]): void
    addContextMenuBtn(el: HTMLElement, btn: CustomContextMenuBtnArg): void
    addContextMenuBtn(el: HTMLElement, btns: CustomContextMenuBtnArg[]): void
    addContextMenuBtn(elOrBtns: HTMLElement | CustomContextMenuBtnArg | CustomContextMenuBtnArg[], btns?: CustomContextMenuBtnArg | CustomContextMenuBtnArg[]): void {
        if (elOrBtns instanceof HTMLElement) { // 3rd & 4th signatures (specifc elements)
            if (!btns) return // btns should be defined in this case

            if (Array.isArray(btns)) { // 4th signature (specific element with multiple btns)
                this._addContextMenuBtns(elOrBtns, btns)
            } else { // 3rd signature (specific element with one btn)
                this._addContextMenuBtns(elOrBtns, [btns])
            }
        } else if (Array.isArray(elOrBtns)) { // 2nd siganture (multiple global btns)
            this._addGlobalContextMenuBtns(elOrBtns)
        } else { // 1st siganture (one global btn)
            this._addGlobalContextMenuBtns([elOrBtns])
        }
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
