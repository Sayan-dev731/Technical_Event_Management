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

export const shippingAddressSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    phone: Joi.string()
        .trim()
        .pattern(/^[0-9+\-\s()]{7,20}$/)
        .required()
        .messages({ "string.pattern.base": "phone must be a valid number" }),
    email: Joi.string().email().lowercase().trim().required(),
    address: Joi.string().trim().min(1).max(300).required(),
    city: Joi.string().trim().min(1).max(100).required(),
    state: Joi.string().trim().min(1).max(100).required(),
    pinCode: Joi.string()
        .trim()
        .pattern(/^[A-Za-z0-9\- ]{3,12}$/)
        .required()
        .messages({ "string.pattern.base": "pinCode is invalid" }),
});

export const checkoutSchema = Joi.object({
    paymentMethod: Joi.string()
        .valid("cash", "upi", "card", "netbanking", "cod")
        .default("cash"),
    paymentRef: Joi.string().allow(""),
    shippingAddress: shippingAddressSchema.required(),
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
    phone: Joi.string().trim().allow("").max(20),
    contactInfo: Joi.string().trim().allow("").max(500),
}).min(1);

export const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    phone: Joi.string().trim().allow("").max(20),
    contactInfo: Joi.string().trim().allow("").max(500),
    category: Joi.string().valid(...VENDOR_CATEGORIES),
}).min(1);

export const adminCreateUserSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid("user", "vendor").required(),
    category: Joi.when("role", {
        is: "vendor",
        then: Joi.string()
            .valid(...VENDOR_CATEGORIES)
            .required(),
        otherwise: Joi.forbidden(),
    }),
    plan: Joi.when("role", {
        is: "vendor",
        then: Joi.string()
            .valid(...Object.values(MEMBERSHIP_PLANS))
            .default(MEMBERSHIP_PLANS.SIX_MONTHS),
        otherwise: Joi.forbidden(),
    }),
    phone: Joi.string().trim().allow("").max(20),
    contactInfo: Joi.string().trim().allow("").max(500),
});
