import mongoose, { Schema } from "mongoose";

const guestSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        rsvp: {
            type: String,
            enum: ["pending", "yes", "no", "maybe"],
            default: "pending",
        },
    },
    { _id: true, timestamps: true },
);

const guestListSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        eventName: { type: String, required: true, trim: true },
        eventDate: { type: Date },
        notes: { type: String, default: "" },
        guests: { type: [guestSchema], default: [] },
    },
    { timestamps: true },
);

export const GuestList = mongoose.model("GuestList", guestListSchema);
