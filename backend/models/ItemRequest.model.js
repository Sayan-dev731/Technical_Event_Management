import mongoose, { Schema } from "mongoose";
import { REQUEST_STATUS } from "../constants.js";

const itemRequestSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        vendor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        item: { type: Schema.Types.ObjectId, ref: "Item" },
        message: { type: String, default: "", maxlength: 1000 },
        quantity: { type: Number, default: 1, min: 1 },
        status: {
            type: String,
            enum: Object.values(REQUEST_STATUS),
            default: REQUEST_STATUS.PENDING,
            index: true,
        },
        respondedAt: { type: Date },
        responseNote: { type: String },
    },
    { timestamps: true },
);

export const ItemRequest = mongoose.model("ItemRequest", itemRequestSchema);
