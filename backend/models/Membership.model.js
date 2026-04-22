import mongoose, { Schema } from "mongoose";
import {
    MEMBERSHIP_PLANS,
    MEMBERSHIP_STATUS,
    MEMBERSHIP_DURATION_DAYS,
} from "../constants.js";

const membershipSchema = new Schema(
    {
        vendor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        membershipNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        plan: {
            type: String,
            enum: Object.values(MEMBERSHIP_PLANS),
            required: true,
            default: MEMBERSHIP_PLANS.SIX_MONTHS,
        },
        startDate: { type: Date, required: true, default: Date.now },
        endDate: { type: Date, required: true },
        status: {
            type: String,
            enum: Object.values(MEMBERSHIP_STATUS),
            default: MEMBERSHIP_STATUS.ACTIVE,
        },
        amountPaid: { type: Number, default: 0 },
        history: [
            {
                action: String, // created | extended | cancelled
                plan: String,
                at: { type: Date, default: Date.now },
                by: { type: Schema.Types.ObjectId, ref: "User" },
            },
        ],
    },
    { timestamps: true },
);

membershipSchema.statics.computeEndDate = function (startDate, plan) {
    const days = MEMBERSHIP_DURATION_DAYS[plan];
    if (!days) throw new Error(`Unknown membership plan: ${plan}`);
    const end = new Date(startDate);
    end.setDate(end.getDate() + days);
    return end;
};

membershipSchema.methods.isActive = function () {
    return (
        this.status === MEMBERSHIP_STATUS.ACTIVE && this.endDate > new Date()
    );
};

export const Membership = mongoose.model("Membership", membershipSchema);
