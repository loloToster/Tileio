import createWidget from "../../ts/iframe-api"

const w = createWidget()

const note = <HTMLTextAreaElement>document.getElementById("note")
const saving = document.querySelector<HTMLDivElement>(".saving")

function sendUpdate(field: "text" | "color" | "font", value: string) {
    return fetch("/dynamic-cells/mininote/" + field, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ [field]: value })
    })
}

async function saveNote(text: string) {
    try {
        const res = await sendUpdate("text", text)
        if (!res.ok) throw Error("Response is not ok")
    } catch {
        w.createError("Could not save the note")
    } finally {
        saving?.classList.remove("active")
    }
}

let savingTimeout: any
note?.addEventListener("input", async () => {
    clearTimeout(savingTimeout)
    saving?.classList.add("active")
    savingTimeout = setTimeout(saveNote, 500, note.value)
})

// Settings

const settings = document.querySelector<HTMLDivElement>(".settings")
const closeSettings = document.querySelector<HTMLButtonElement>(".settings__close")
const colors = document.querySelectorAll<HTMLDivElement>(".settings__colors__color")
const choosenColorCheck = document.querySelector<SVGElement>(".settings__colors svg")
const fonts = document.querySelectorAll<HTMLDivElement>(".settings__fonts__font")

w.addContextMenuBtn({
    text: "Change appearance",
    action: () => {
        settings?.classList.add("active")
    }
})

closeSettings?.addEventListener("click", () => {
    settings?.classList.remove("active")
})

colors.forEach(c => {
    c.addEventListener("click", () => {
        const newColor = c.style.getPropertyValue("--color").trim()
        document.body.style.setProperty("--color", newColor)
        colors.forEach(c => c.classList.remove("choosen"))
        c.classList.add("choosen")
        if (choosenColorCheck) c.appendChild(choosenColorCheck)

        sendUpdate("color", newColor).catch(
            () => w.createError("Could not save the color")
        )
    })
})

fonts.forEach(f => {
    f.addEventListener("click", () => {
        note.style.setProperty("--font", f.style.getPropertyValue("--font").trim())
        fonts.forEach(f => f.classList.remove("choosen"))
        f.classList.add("choosen")

        sendUpdate("font", f.dataset.slug!).catch(
            () => w.createError("Could not save the font")
        )
    })
})
