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

        const observer = new MutationObserver(this._MutationHandler.bind(this))
        observer.observe(document.body, { childList: true, subtree: true })
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
        }, "*")
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
        if (e.source != window.top) return

        switch (e.data.type) {
            case "cmbtnaction": {
                this._fireAction(e.data.id)
                break
            }

            case "err": {
                throw Error(e.data.msg)
            }

            default: {
                console.warn("Unknown message type:", e.data.type)
                break
            }
        }
    }

    private _MutationHandler(mutations: MutationRecord[]) {
        mutations.forEach(mutation => {
            mutation.removedNodes.forEach(node => {
                this.contextMenuEls = this.contextMenuEls.filter(ctxMenuEl => {
                    const el = ctxMenuEl.el
                    return node != el && !node.contains(el)
                })
            })
        })
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

    private parseBtns(btns: CustomContextMenuBtnArg[]) {
        return btns.map(btn => {
            return {
                id: this._findFreeId(),
                ...btn
            }
        })
    }

    private _addGlobalContextMenuBtns(btns: CustomContextMenuBtn[]) {
        this.globalContextMenuBtns = this.globalContextMenuBtns.concat(btns)

        return btns.map(btn => btn.id)
    }

    private _addContextMenuBtns(el: HTMLElement, btns: CustomContextMenuBtn[]) {
        for (let i = 0; i < this.contextMenuEls.length; i++) {
            const contextMenuEl = this.contextMenuEls[i]
            if (el == contextMenuEl.el) {
                this.contextMenuEls[i].btns = contextMenuEl.btns.concat(btns)
                return
            }
        }

        this.contextMenuEls.push({ el, btns })
    }

    addContextMenuBtn(btn: CustomContextMenuBtnArg): number[]
    addContextMenuBtn(btns: CustomContextMenuBtnArg[]): number[]
    addContextMenuBtn(el: HTMLElement, btn: CustomContextMenuBtnArg): number[]
    addContextMenuBtn(el: HTMLElement, btns: CustomContextMenuBtnArg[]): number[]
    addContextMenuBtn(elOrBtns: HTMLElement | CustomContextMenuBtnArg | CustomContextMenuBtnArg[], btns?: CustomContextMenuBtnArg | CustomContextMenuBtnArg[]): number[] {
        let parsedBtns: CustomContextMenuBtn[]

        if (elOrBtns instanceof HTMLElement) { // 3rd & 4th signatures (specifc elements)
            if (!btns) return [] // btns should be defined in this case

            if (Array.isArray(btns)) { // 4th signature (specific element with multiple btns)
                parsedBtns = this.parseBtns(btns)
            } else { // 3rd signature (specific element with one btn)
                parsedBtns = this.parseBtns([btns])
            }

            this._addContextMenuBtns(elOrBtns, parsedBtns)
        } else { // 1st or 2nd signature (global btns)
            if (Array.isArray(elOrBtns)) { // 2nd siganture (multiple global btns)
                parsedBtns = this.parseBtns(elOrBtns)
            } else { // 1st siganture (one global btn)
                parsedBtns = this.parseBtns([elOrBtns])
            }

            this._addGlobalContextMenuBtns(parsedBtns)
        }

        return parsedBtns.map(btn => btn.id)
    }

    private _removeContextMenuBtnByElements(els: HTMLElement[]) {
        this.contextMenuEls = this.contextMenuEls.filter(ctxMenuEl => {
            return !els.includes(ctxMenuEl.el)
        })
    }

    private _removeContextMenuBtnByIds(ids: number[]) {
        this.globalContextMenuBtns = this.globalContextMenuBtns.filter(btn => {
            return !ids.includes(btn.id)
        })

        for (let i = 0; i < this.contextMenuEls.length; i++) {
            const contextMenuEl = this.contextMenuEls[i]
            this.contextMenuEls[i].btns = contextMenuEl.btns.filter(btn => {
                return !ids.includes(btn.id)
            })
        }
    }

    removeContextMenuBtn(idOrEl: number | number[] | HTMLElement | HTMLElement[]) {
        if (Array.isArray(idOrEl)) {
            if (!idOrEl.length) return

            if (typeof idOrEl[0] == "number") {
                this._removeContextMenuBtnByIds(idOrEl as number[])
            } else {
                this._removeContextMenuBtnByElements(idOrEl as HTMLElement[])
            }
        } else {
            if (typeof idOrEl == "number") {
                this._removeContextMenuBtnByIds([idOrEl])
            } else {
                this._removeContextMenuBtnByElements([idOrEl])
            }
        }
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
        }, "*")
    }
}

declare global {
    interface Window { createWidget: () => Widget }
}

window.createWidget = () => new Widget()
export default window.createWidget
