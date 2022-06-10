import { Schema, model } from "mongoose"

export interface IGrid {
    col: number,
    row: number,
    cells: Array<{
        w?: number,
        h?: number
    }>
}

export interface IUser {
    name: string,
    strategyId: string,
    email: string,
    picture: string,
    grid?: IGrid
}

const gridSchema = new Schema<IGrid>({
    col: Number,
    row: Number,
    cells: [{
        w: Number,
        h: Number
    }]
})

const userSchema = new Schema<IUser>({
    name: String,
    strategyId: String,
    email: String,
    picture: String,
    grid: gridSchema
})

export default model<IUser>("user", userSchema)
