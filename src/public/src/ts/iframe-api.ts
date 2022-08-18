// TODO: security (validate origin, limit number of btns, limit number of characters in a btn etc.)

interface CustomContextMenuBtn {
    id: number,
    text: string,
    action: () => void
}

type CustomContextMenuBtnArg = Omit<CustomContextMenuBtn, "id">

interface CustomContextMenuObj {
    el: HTMLElement,
    btns: CustomContextMenuBtn[]
}

export class Widget {
    private globalContextMenuBtns: CustomContextMenuBtn[]
    private contextMenuEls: CustomContextMenuObj[]

    constructor() {
        this.globalContextMenuBtns = []
        this.contextMenuEls = []

        window.addEventListener("contextmenu", this._ContextMenuHandler.bind(this))
        window.addEventListener("message", this._msgHandler.bind(this))
        window.addEventListener("click", () => this.hideContextMenu())
    }

    private _ContextMenuHandler(e: MouseEvent) {
        if (!window.top) throw Error("No top window")
        e.preventDefault()

        let globalCustomBtns = this.globalContextMenuBtns.map(btn => {
            return { id: btn.id, text: btn.text }
        })

        let customBtns: {
            id: number,
            text: string
        }[] = []

        for (const el of e.composedPath()) {
            let matchingEl = this.contextMenuEls.find(obj => obj.el == el)

            if (matchingEl) {
                customBtns = matchingEl.btns.map(btn => {
                    return { id: btn.id, text: btn.text }
                })
                break
            }
        }

        window.top.postMessage({
            type: "cm", ev: {
                clientX: e.clientX,
                clientY: e.clientY
            },
            customBtns: globalCustomBtns.concat(customBtns)
        })
    }

    private _fireAction(id: number) {
        const btns = this.globalContextMenuBtns.concat(
            this.contextMenuEls.reduce((acc: CustomContextMenuBtn[], prev) => {
                return acc.concat(prev.btns)
            }, [])
        )

        const btnWithMatchingId = btns.find(btn => btn.id == id)
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

    // TODO: optimize to reuse the same obj if elements are the same 
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

    // todo: do this automatically
    clearContextMenuBtns(el?: HTMLElement, clearNonExisting = true) {
        this.contextMenuEls = this.contextMenuEls.filter((obj, i) => {
            if (obj.el == el) return false
            if (!document.body.contains(obj.el) && clearNonExisting) return false
            return true
        })
    }

    createError(msg: string) {
        if (!window.top) throw Error("No top window")
        window.top.postMessage({
            type: "ce", msg
        })
    }

    hideContextMenu() {
        if (!window.top) throw Error("No top window")
        window.top.postMessage({
            type: "hcm"
        })
    }
}

declare global {
    interface Window { createWidget: () => Widget }
}

window.createWidget = () => new Widget()
export default window.createWidget
