export function onClickOutside(els: (Element | null)[], func: (e?: MouseEvent) => any) {
    window.addEventListener("click", e => {
        for (const el of els) {
            if (!el || e.composedPath().includes(el))
                return
        }
        func(e)
    })
}

export const LUMINANCE_THRESHOLD = 236

export function getLuminance(hex: string) {
    // hexToRgb: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    const color = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null

    if (!color) return -1

    // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
}

export const isDark = (c: string) => getLuminance(c) < LUMINANCE_THRESHOLD

export function setCSSVar(
    el: HTMLElement,
    name: string,
    value: string | number | null,
    priority?: string | undefined
) {
    if (typeof value === "number")
        value = value.toString()

    return el.style.setProperty("--" + name, value, priority)
}

export function getCSSVar(el: HTMLElement, name: string) {
    return el.style.getPropertyValue("--" + name)
}

export function findFreeId(usedIds: number[]) {
    usedIds.sort((a, b) => a - b)

    for (let i = 0; i < usedIds.length; i++) {
        if (!usedIds.includes(i)) return i
    }

    return usedIds.length + 1
}
