let cache: Record<string, string[] | undefined> = {}

/**
 * gets primary color from image
 */
export default async function getLyrics(artist: string, title: string) {
    const songId = artist + title

    if (cache[songId]) return cache[songId]!

    try {
        const res = await fetch(
            `/dynamic-cells/spotify/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`
        )

        const json = await res.json()
        const lyrics: string | undefined = json.lyrics
        const lines = lyrics ? lyrics.split("\n") : []
        cache[songId] = lines

        return lines
    } catch {
        return []
    }
}
