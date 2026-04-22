import Joi from "joi";
import { ROLES, VENDOR_CATEGORIES, MEMBERSHIP_PLANS } from "../constants.js";

const password = Joi.string().min(6).max(128).required();
const email = Joi.string().email().lowercase().trim().required();
const name = Joi.string().trim().min(2).max(100).required();

export const adminSignupSchema = Joi.object({
    name,
    email,
    password,
});

export const userSignupSchema = Joi.object({
    name,
    email,
    password,
});

export const vendorSignupSchema = Joi.object({
    name,
    email,
    password,
    category: Joi.string()
        .valid(...VENDOR_CATEGORIES)
        .required(),
    plan: Joi.string()
        .valid(...Object.values(MEMBERSHIP_PLANS))
        .default(MEMBERSHIP_PLANS.SIX_MONTHS),
});

export const loginSchema = Joi.object({
    email,
    password: Joi.string().required(),
    role: Joi.string()
        .valid(...Object.values(ROLES))
        .required(),
});

export const refreshSchema = Joi.object({
    refreshToken: Joi.string().optional(),
});

export const forgotPasswordSchema = Joi.object({ email });

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    password,
});

export const verifyEmailSchema = Joi.object({
    token: Joi.string().required(),
});

export const resendVerificationSchema = Joi.object({ email });

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: password,
});
