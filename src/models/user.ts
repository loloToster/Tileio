import { Schema, model } from "mongoose"

import { Grid } from "../types/types"

export interface DynamicCellsData {
    mininote: {
        text: string,
        color: string,
        font: string
    },
    weather: {
        lat: number,
        lon: number,
        name: string
    },
    spotify: {
        at: string,
        rt: string,
        expires: number
    },
    googleCalendar: {
        at: string,
        rt: string,
        expires: number
    }
}

export interface IUser {
    name: string,
    strategyId: string,
    email: string,
    hashedPassword?: string,
    picture: string,
    grid: Grid,
    dynamicCells: Partial<DynamicCellsData>
}

const userSchema = new Schema<IUser>({
    name: String,
    strategyId: { type: String, unique: true },
    email: String,
    hashedPassword: String,
    picture: String,
    grid: {
        col: { type: Number, default: 10 },
        row: { type: Number, default: 5 },
        bg: String,
        cell: String,
        cells: [{
            w: Number,
            h: Number,
            x: Number,
            y: Number,
            content: {
                type: { type: String },
                iconUrl: String,
                bgColor: String,
                link: String,
                src: String
            }
        }]
    },
    dynamicCells: {
        mininote: {
            text: String,
            color: String,
            font: String
        },
        weather: {
            lat: Number,
            lon: Number,
            name: String
        },
        spotify: {
            at: String,
            rt: String,
            expires: Number
        },
        googleCalendar: {
            at: String,
            rt: String,
            expires: Number
        }
    }
})

export default model<IUser>("user", userSchema)
