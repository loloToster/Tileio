import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: String,
    strategyId: String,
    email: String,
    picture: String
})

export = mongoose.model("user", userSchema)
