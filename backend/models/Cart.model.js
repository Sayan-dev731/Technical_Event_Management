import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema(
    {
        item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
        vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        priceAtAdd: { type: Number, required: true, min: 0 },
    },
    { _id: true, timestamps: true },
);

const cartSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        items: { type: [cartItemSchema], default: [] },
    },
    { timestamps: true },
);

cartSchema.virtual("totalAmount").get(function () {
    return this.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);
});

cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

export const Cart = mongoose.model("Cart", cartSchema);
