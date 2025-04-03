import { Schema, model } from "mongoose";

const TextureSchema = new Schema({
    uniqueId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slim: { type: Boolean, default: false },
    secret: { type: String, required: true },
    textures: { type: Map, of: String }
});

export const Texture = model("Texture", TextureSchema);