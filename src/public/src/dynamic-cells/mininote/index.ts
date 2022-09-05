import createWidget from "../../ts/iframe-api"

const w = createWidget()

const note = <HTMLTextAreaElement>document.getElementById("note")
const saving = document.querySelector<HTMLDivElement>(".saving")

let savingTimeout: any

note?.addEventListener("input", async () => {
    clearTimeout(savingTimeout)
    saving?.classList.add("active")
    savingTimeout = setTimeout(saveNote, 500, note.value)
})

async function saveNote(text: string) {
    try {
        const res = await fetch("/dynamic-cells/mininote/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        })

        if (!res.ok)
            throw Error("Response is not ok")
    } catch {
        w.createError("Could not save the note")
    }

    saving?.classList.remove("active")
}
