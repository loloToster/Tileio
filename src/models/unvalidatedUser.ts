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
    email: { type: String, unique: true },
    hashedPassword: String,
    token: String,
    createdAt: { type: Date, expires: 3600, default: Date.now }
})

export default model<IUnvalidatedUser>("unvalidatedUser", unnvalidatedUserSchema)
