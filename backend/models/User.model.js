import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, VENDOR_CATEGORIES } from "../constants.js";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: { type: String, required: true, minlength: 6, select: false },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.USER,
            index: true,
        },
        category: {
            type: String,
            enum: VENDOR_CATEGORIES,
            required: function () {
                return this.role === ROLES.VENDOR;
            },
        },
        membership: { type: Schema.Types.ObjectId, ref: "Membership" },
        avatar: { type: String, default: "" },
        avatarPublicId: { type: String, default: "" },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        refreshToken: { type: String, select: false },
        tempTokenHash: { type: String, select: false },
        tempTokenExpiresAt: { type: Date, select: false },
        tempTokenPurpose: {
            type: String,
            enum: ["email_verify", "password_reset"],
            select: false,
        },

        lastLoginAt: { type: Date },
    },
    { timestamps: true },
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    this.password = await bcrypt.hash(this.password, rounds);
    next();
});

userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeJSON = function () {
    const o = this.toObject();
    delete o.password;
    delete o.refreshToken;
    delete o.tempTokenHash;
    delete o.tempTokenExpiresAt;
    delete o.tempTokenPurpose;
    return o;
};

export const User = mongoose.model("User", userSchema);
