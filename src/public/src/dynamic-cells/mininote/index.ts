const note = document.getElementById("note")

note?.addEventListener("input", () => {
    const text = note.innerText.replace(/\n/g, "<br>")
    fetch("/dynamic-cells/mininote/update", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    })
})

note?.addEventListener("paste", e => {
    e.preventDefault()
    var text = e.clipboardData?.getData("text/plain")
    text = text?.replace(/\n/g, "<br>")
    document.execCommand("insertHTML", false, text)
})
