export default class GridEmulator {
    w: number
    h: number
    grid: boolean[][]

    constructor(w: number, h: number) {
        if (w < 1 || h < 1) throw Error("Too low value")

        this.w = w
        this.h = h

        this.grid = []

        for (let y = 0; y < h; y++) {
            let row: boolean[] = []
            for (let x = 0; x < w; x++) {
                row.push(false)
            }
            this.grid.push(row)
        }
    }

    findSpot() {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                if (!this.grid[y][x]) return { x, y }
            }
        }

        throw Error("No space")
    }

    addWidget(widgetX?: number, widgetY?: number, widgetW: number = 1, widgetH: number = 1) {
        if (widgetX === undefined || widgetY === undefined) {
            const spot = this.findSpot()
            this.addWidget(spot.x, spot.y, widgetW, widgetH)
            return
        }

        const endX = widgetX + widgetW
        const endY = widgetY + widgetH

        for (let y = widgetY; y < endY; y++) {
            for (let x = widgetX; x < endX; x++) {
                this.addSingleCell(x, y)
            }
        }
    }

    addSingleCell(x: number, y: number) {
        if (this.grid[y][x]) throw Error(`Coordinates in use x:${x} y:${y}`)
        if (x < 0 || y < 0) throw Error("Value too low")
        if (x >= this.w || y >= this.h) throw Error("Value too high")

        this.grid[y][x] = true
    }

    print() {
        this.grid.forEach(row => {
            console.log(row.map(c => c ? "⬜" : "⬛").join(""))
        })
    }
}
