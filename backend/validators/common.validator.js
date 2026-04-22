import Joi from "joi";
import {
    VENDOR_CATEGORIES,
    ITEM_STATUS,
    ORDER_STATUS,
    PAYMENT_STATUS,
    REQUEST_STATUS,
    MEMBERSHIP_PLANS,
} from "../constants.js";

export const objectId = Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .message("Invalid id");

export const createItemSchema = Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().allow("").max(2000),
    category: Joi.string()
        .valid(...VENDOR_CATEGORIES)
        .required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid(...Object.values(ITEM_STATUS)),
});

export const updateItemSchema = Joi.object({
    name: Joi.string().trim().min(1).max(200),
    description: Joi.string().allow("").max(2000),
    category: Joi.string().valid(...VENDOR_CATEGORIES),
    price: Joi.number().min(0),
    stock: Joi.number().integer().min(0),
    status: Joi.string().valid(...Object.values(ITEM_STATUS)),
}).min(1);

export const addToCartSchema = Joi.object({
    itemId: objectId.required(),
    quantity: Joi.number().integer().min(1).default(1),
});

export const updateCartSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required(),
});

export const checkoutSchema = Joi.object({
    paymentMethod: Joi.string()
        .valid("card", "upi", "netbanking", "cod")
        .default("card"),
    paymentRef: Joi.string().allow(""),
});

export const cancelOrderSchema = Joi.object({
    reason: Joi.string().max(500).allow(""),
});

export const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid(...Object.values(ORDER_STATUS))
        .required(),
    paymentStatus: Joi.string().valid(...Object.values(PAYMENT_STATUS)),
});

export const createGuestListSchema = Joi.object({
    eventName: Joi.string().trim().min(1).max(200).required(),
    eventDate: Joi.date().iso(),
    notes: Joi.string().allow(""),
    guests: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().trim().required(),
                email: Joi.string().email().allow(""),
                phone: Joi.string().allow(""),
                rsvp: Joi.string().valid("pending", "yes", "no", "maybe"),
            }),
        )
        .default([]),
});

export const updateGuestListSchema = createGuestListSchema
    .fork(["eventName"], (s) => s.optional())
    .min(1);

export const createItemRequestSchema = Joi.object({
    vendorId: objectId.required(),
    itemId: objectId.optional(),
    message: Joi.string().allow("").max(1000),
    quantity: Joi.number().integer().min(1).default(1),
});

export const respondItemRequestSchema = Joi.object({
    status: Joi.string()
        .valid(...Object.values(REQUEST_STATUS).filter((s) => s !== "pending"))
        .required(),
    responseNote: Joi.string().allow("").max(1000),
});

export const createMembershipSchema = Joi.object({
    vendorId: objectId.required(),
    plan: Joi.string()
        .valid(...Object.values(MEMBERSHIP_PLANS))
        .default(MEMBERSHIP_PLANS.SIX_MONTHS),
    amountPaid: Joi.number().min(0).default(0),
});

export const updateMembershipSchema = Joi.object({
    membershipNumber: Joi.string().required(),
    action: Joi.string().valid("extend", "cancel").required(),
    plan: Joi.string()
        .valid(...Object.values(MEMBERSHIP_PLANS))
        .default(MEMBERSHIP_PLANS.SIX_MONTHS),
});

export const adminUpdateUserSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    isActive: Joi.boolean(),
    isVerified: Joi.boolean(),
    category: Joi.string().valid(...VENDOR_CATEGORIES),
}).min(1);
