import { extractColors } from "extract-colors"
import { FinalColor } from "extract-colors/lib/types/Color"

let cache: Record<string, FinalColor[] | undefined> = {}

/**
 * gets primary color from image
 */
export async function getPallete(urlOrImg: string | HTMLImageElement) {
    if (typeof urlOrImg === "string"){
        const url  = urlOrImg
        if (cache[url]) return cache[url]!

        const colors = await extractColors(url, { crossOrigin: "anonymous" })
        cache[url] = colors

        return colors
    } else {
        return await extractColors(urlOrImg, { crossOrigin: "anonymous" })
    }
}

export async function getClosestToLightness(urlOrImg: string | HTMLImageElement, lightness: number) {
    const pallete = await getPallete(urlOrImg)

    const bestColor = pallete.reduce((prev, cur) => {
        return Math.abs(prev.lightness - lightness) < Math.abs(cur.lightness - lightness) ?
            prev : cur
    })

    return bestColor
}
