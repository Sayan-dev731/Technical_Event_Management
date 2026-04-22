import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/tokens.js";
import { TOKEN_TYPES, ROLES } from "../constants.js";
import { User } from "../models/User.model.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
    const header = req.header("Authorization") || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = bearer || req.cookies?.accessToken;

    if (!token) throw new ApiError(401, "Authentication required");

    let decoded;
    try {
        decoded = verifyToken(token, TOKEN_TYPES.ACCESS);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired access token");
    }

    if (decoded.tokenType !== TOKEN_TYPES.ACCESS) {
        throw new ApiError(401, "Wrong token type");
    }

    const user = await User.findById(decoded._id);
    if (!user) throw new ApiError(401, "User no longer exists");
    if (!user.isActive) throw new ApiError(403, "Account is disabled");

    req.user = user;
    next();
});

export const requireRole = (...allowed) =>
    asyncHandler(async (req, _res, next) => {
        if (!req.user) throw new ApiError(401, "Authentication required");
        if (!allowed.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Forbidden: requires role(s) ${allowed.join(", ")}`,
            );
        }
        next();
    });

export const requireAdmin = requireRole(ROLES.ADMIN);
export const requireVendor = requireRole(ROLES.VENDOR);
export const requireUser = requireRole(ROLES.USER);
