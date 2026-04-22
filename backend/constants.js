export const DBName = "EventManagement";

export const ROLES = Object.freeze({
    ADMIN: "admin",
    VENDOR: "vendor",
    USER: "user",
});

export const VENDOR_CATEGORIES = Object.freeze([
    "Catering",
    "Florist",
    "Decoration",
    "Lighting",
]);

export const MEMBERSHIP_PLANS = Object.freeze({
    SIX_MONTHS: "6_months",
    ONE_YEAR: "1_year",
    TWO_YEARS: "2_years",
});

export const MEMBERSHIP_DURATION_DAYS = Object.freeze({
    "6_months": 182,
    "1_year": 365,
    "2_years": 730,
});

export const MEMBERSHIP_STATUS = Object.freeze({
    ACTIVE: "active",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
});

export const ITEM_STATUS = Object.freeze({
    AVAILABLE: "available",
    OUT_OF_STOCK: "out_of_stock",
    DISCONTINUED: "discontinued",
});

export const ORDER_STATUS = Object.freeze({
    PENDING: "pending",
    CONFIRMED: "confirmed",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
});

export const PAYMENT_STATUS = Object.freeze({
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
});

export const REQUEST_STATUS = Object.freeze({
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    FULFILLED: "fulfilled",
});

export const TOKEN_TYPES = Object.freeze({
    ACCESS: "access",
    REFRESH: "refresh",
    TEMP: "temp",
});

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};
