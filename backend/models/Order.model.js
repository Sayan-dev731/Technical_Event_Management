import mongoose, { Schema } from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS } from "../constants.js";

const orderItemSchema = new Schema(
    {
        item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
        vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false },
);

const orderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: (v) => v.length > 0,
        },
        totalAmount: { type: Number, required: true, min: 0 },

        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PENDING,
            index: true,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PAYMENT_STATUS),
            default: PAYMENT_STATUS.PENDING,
        },
        paymentMethod: {
            type: String,
            enum: ["card", "upi", "netbanking", "cod"],
            default: "card",
        },
        paymentRef: { type: String, default: "" },
        cancelledAt: { type: Date },
        cancelReason: { type: String },
    },
    { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
