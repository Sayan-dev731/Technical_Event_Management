import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { ITEM_STATUS, VENDOR_CATEGORIES } from "../constants.js";

const itemSchema = new Schema(
    {
        vendor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        name: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, default: "", maxlength: 2000 },
        category: { type: String, enum: VENDOR_CATEGORIES, required: true },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        image: { type: String, default: "" },
        imagePublicId: { type: String, default: "" },
        status: {
            type: String,
            enum: Object.values(ITEM_STATUS),
            default: ITEM_STATUS.AVAILABLE,
        },
    },
    { timestamps: true },
);

itemSchema.plugin(mongooseAggregatePaginate);

export const Item = mongoose.model("Item", itemSchema);
