import { Schema, model } from "mongoose"

export interface Cell {
    w?: number,
    h?: number,
    x?: number,
    y?: number
}

export interface Grid {
    col: number,
    row: number,
    cells: Array<Cell>
}

export interface IUser {
    name: string,
    strategyId: string,
    email: string,
    picture: string,
    grid: Grid
}

const userSchema = new Schema<IUser>({
    name: String,
    strategyId: String,
    email: String,
    picture: String,
    grid: {
        col: { type: Number, default: 10 },
        row: { type: Number, default: 5 },
        cells: [{
            w: Number,
            h: Number,
            x: Number,
            y: Number
        }]
    }
})

export default model<IUser>("user", userSchema)
