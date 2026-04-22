import jwt from "jsonwebtoken";
import crypto from "crypto";
import { TOKEN_TYPES } from "../constants.js";

export const signToken = (payload, type = TOKEN_TYPES.ACCESS) => {
    let secret;
    let expiresIn;
    switch (type) {
        case TOKEN_TYPES.ACCESS:
            secret = process.env.ACCESS_TOKEN_SECRET;
            expiresIn = process.env.ACCESS_TOKEN_EXPIRY || "15m";
            break;
        case TOKEN_TYPES.REFRESH:
            secret = process.env.REFRESH_TOKEN_SECRET;
            expiresIn = process.env.REFRESH_TOKEN_EXPIRY || "7d";
            break;
        case TOKEN_TYPES.TEMP:
            secret = process.env.TEMP_TOKEN_SECRET;
            expiresIn = process.env.TEMP_TOKEN_EXPIRY || "15m";
            break;
        default:
            throw new Error(`Unknown token type: ${type}`);
    }
    if (!secret) {
        throw new Error(`Missing JWT secret for token type: ${type}`);
    }
    return jwt.sign({ ...payload, tokenType: type }, secret, { expiresIn });
};

export const verifyToken = (token, type = TOKEN_TYPES.ACCESS) => {
    let secret;
    switch (type) {
        case TOKEN_TYPES.ACCESS:
            secret = process.env.ACCESS_TOKEN_SECRET;
            break;
        case TOKEN_TYPES.REFRESH:
            secret = process.env.REFRESH_TOKEN_SECRET;
            break;
        case TOKEN_TYPES.TEMP:
            secret = process.env.TEMP_TOKEN_SECRET;
            break;
        default:
            throw new Error(`Unknown token type: ${type}`);
    }
    return jwt.verify(token, secret);
};

export const generateRawToken = (bytes = 32) => {
    const raw = crypto.randomBytes(bytes).toString("hex");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    return { raw, hash };
};

export const hashToken = (raw) =>
    crypto.createHash("sha256").update(raw).digest("hex");
