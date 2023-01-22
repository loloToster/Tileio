import { extractColors } from "extract-colors"
import { FinalColor } from "extract-colors/lib/types/Color"

let cache: Record<string, FinalColor[] | undefined> = {}

/**
 * gets primary color from image
 */
export default async function getPallete(url: string) {
    if (cache[url]) return cache[url]!

    const colors = await extractColors(url, { crossOrigin: "anonymous" })
    cache[url] = colors

    return colors
}
