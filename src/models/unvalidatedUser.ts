import { Schema, model } from "mongoose"

interface IUnvalidatedUser {
    name?: string,
    email: string,
    hashedPassword: string,
    token: string,
    createdAt: Date
}

const unnvalidatedUserSchema = new Schema<IUnvalidatedUser>({
    name: String,
    email: String,
    hashedPassword: String,
    token: String,
    createdAt: { type: Date, expires: 3600, default: Date.now }
})

export default model<IUnvalidatedUser>("unvalidatedUser", unnvalidatedUserSchema)
