const customCells = [
]

const grid = GridStack.init({
    margin: "5px",
    column: 20,
    cellHeight: 96
})

for (let i = 0; true; i++) {
    let widget = grid.addWidget({ content: i.toString() })
    if (widget.getBoundingClientRect().top > document.body.clientHeight) {
        grid.removeWidget(widget)
        break
    }
}
