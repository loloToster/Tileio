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
