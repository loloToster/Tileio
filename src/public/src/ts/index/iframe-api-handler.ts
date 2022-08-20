import { hex } from "@backend-types/types"
import { GridItemHTMLElement, GridStack } from "gridstack"
import { createError } from "./error"
import { ContextMenuBtn, customContextMenu } from "./grid-utils"

type iframeOptions = Partial<{
    w: number,
    h: number,
    bgColor: hex,
    cellColor: hex,
    preview: boolean,
    [key: string]: any
}>

export function generateIframeUrl(url: string, options: iframeOptions) {
    let result: URL
    try {
        result = new URL(url)
    } catch {
        let dummyParams = "?"
        for (const key in options)
            dummyParams += `${key}=${encodeURIComponent(options[key].toString())}&`
        return url + dummyParams.slice(0, -1) // remove last char becasue it is either '?' or '&'
    }

    result.searchParams.set("preview", (options.preview || false).toString())
    if (options.preview) return result.href

    if (options.w) result.searchParams.set("w", options.w.toString())
    if (options.h) result.searchParams.set("h", options.h.toString())
    if (options.bgColor) result.searchParams.set("bgColor", options.bgColor)
    if (options.cellColor) result.searchParams.set("cellColor", options.cellColor)

    return result.href
}

interface CustomContextMenuBtn {
    text: string, id: number
}

export function setupIframeApi(grid: GridStack) {
    // Update iframe src on cell resize
    grid.on("resizestop", (e, el) => {
        if (!(el instanceof HTMLElement)) return
        if (!el.classList.contains("dynamic-cell")) return

        const width = parseInt(el.getAttribute("gs-w") || "0")
        const height = parseInt(el.getAttribute("gs-h") || "0")

        const serializedCell = JSON.parse(el.querySelector<HTMLElement>("[data-serialized]")!.dataset.serialized!)
        const iframe = el.querySelector("iframe")!

        const newSrc = serializedCell.src + `?w=${width}&h=${height}`

        if (newSrc != iframe.src)
            iframe.src = newSrc
    })

    function validateMsg(iframe: HTMLIFrameElement) {
        // check if mouse is above iframe
        if (
            Array.from(document.querySelectorAll("iframe:hover")).includes(iframe)
        ) return true

        iframe.contentWindow?.postMessage({ type: "err", msg: "Illegal message (Mouse outside of iframe)" }, "*")
        return false
    }

    // iframe API handler
    window.addEventListener("message", e => {
        let iframe: HTMLIFrameElement | undefined
        for (const ifr of Array.from(document.getElementsByTagName("iframe"))) {
            if (ifr.contentWindow === e.source) {
                iframe = ifr
                break
            }
        }

        if (!iframe) return

        const serializedCell = JSON.parse(iframe.dataset.serialized || "{}")
        if (serializedCell.type !== "d") return

        switch (e.data.type) {
            case "ce": {
                createError(e.data.msg)
                break
            }

            case "cm": {
                if (!validateMsg(iframe)) return

                let cellElement: GridItemHTMLElement | undefined

                for (const cell of grid.getGridItems()) {
                    const cellIframe = cell.querySelector("iframe")
                    if (!cellIframe || cellIframe != iframe) continue

                    cellElement = cell
                    break
                }

                if (!cellElement) return

                const iframeDimensions = iframe.getBoundingClientRect()
                const x = iframeDimensions.left + e.data.ev.clientX
                const y = iframeDimensions.top + e.data.ev.clientY

                let customBtns: ContextMenuBtn[] = []

                if (Array.isArray(e.data.customBtns)) {
                    if (e.data.customBtns.length > 8)
                        iframe.contentWindow?.postMessage({ type: "err", msg: "Numer of btns is too big" }, "*")
                    else
                        e.data.customBtns.forEach((btn: CustomContextMenuBtn) => {
                            if (!Number.isInteger(btn.id))
                                return iframe!.contentWindow?.postMessage({ type: "err", msg: "Bad id in custom btn" }, "*")

                            if (typeof btn.text != "string")
                                return iframe!.contentWindow?.postMessage({ type: "err", msg: "Bad text in custom btn" }, "*")

                            if (btn.text.length > 32)
                                return iframe!.contentWindow?.postMessage({ type: "err", msg: "Text in custom btn is too long" }, "*")

                            customBtns.push({
                                innerText: btn.text,
                                onclick: () => {
                                    iframe?.contentWindow?.postMessage({
                                        type: "cmbtnaction",
                                        id: btn.id
                                    }, "*")
                                }
                            })
                        })
                } else
                    iframe.contentWindow?.postMessage({ type: "err", msg: "Bad type of custom btns" }, "*")

                customContextMenu({ x, y }, grid, cellElement, serializedCell, customBtns)

                break
            }

            case "hcm": {
                if (!validateMsg(iframe)) return
                document.querySelector(".rmenu")?.remove()
                break
            }

            default: {
                console.warn("Unknown message type:", e.data.type)
                break
            }
        }
    })
}
