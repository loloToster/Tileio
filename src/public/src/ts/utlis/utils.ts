export function onClickOutside(els: (Element | null)[], func: (e?: MouseEvent) => any) {
    window.addEventListener("click", e => {
        for (const el of els) {
            if (!el || e.composedPath().includes(el))
                return
        }
        func(e)
    })
}
