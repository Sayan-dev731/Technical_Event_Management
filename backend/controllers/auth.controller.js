import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    signToken,
    verifyToken,
    generateRawToken,
    hashToken,
} from "../utils/tokens.js";
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from "../utils/mails.js";
import { User } from "../models/User.model.js";
import { Membership } from "../models/Membership.model.js";
import {
    ROLES,
    TOKEN_TYPES,
    COOKIE_OPTIONS,
    MEMBERSHIP_STATUS,
} from "../constants.js";
import crypto from "crypto";

const TEMP_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 min

const issueAuthTokens = async (user) => {
    const payload = { _id: user._id, role: user.role, email: user.email };
    const accessToken = signToken(payload, TOKEN_TYPES.ACCESS);
    const refreshToken = signToken({ _id: user._id }, TOKEN_TYPES.REFRESH);
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
    res.cookie("accessToken", accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

const issueAndSendTempToken = async (user, purpose) => {
    const { raw, hash } = generateRawToken();
    user.tempTokenHash = hash;
    user.tempTokenExpiresAt = new Date(Date.now() + TEMP_TOKEN_TTL_MS);
    user.tempTokenPurpose = purpose;
    await user.save({ validateBeforeSave: false });

    const jwtTemp = signToken(
        { _id: user._id, purpose, hash },
        TOKEN_TYPES.TEMP,
    );

    return { raw, jwtTemp };
};

export const signupUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
        throw new ApiError(409, "Email already registered");
    }
    const user = await User.create({ name, email, password, role: ROLES.USER });

    const { raw } = await issueAndSendTempToken(user, "email_verify");
    const link = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
    sendVerificationEmail(email, name, link);

    return res.status(201).json(
        new ApiResponse(201, "User registered. Please verify email.", {
            user: user.toSafeJSON(),
        }),
    );
});

export const signupAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
        throw new ApiError(409, "Email already registered");
    }
    const user = await User.create({
        name,
        email,
        password,
        role: ROLES.ADMIN,
        isVerified: true, 
    });
    return res
        .status(201)
        .json(
            new ApiResponse(201, "Admin registered", {
                user: user.toSafeJSON(),
            }),
        );
});

export const signupVendor = asyncHandler(async (req, res) => {
    const { name, email, password, category, plan } = req.body;
    if (await User.findOne({ email })) {
        throw new ApiError(409, "Email already registered");
    }
    const vendor = await User.create({
        name,
        email,
        password,
        role: ROLES.VENDOR,
        category,
    });

    const start = new Date();
    const end = Membership.computeEndDate(start, plan);
    const membership = await Membership.create({
        vendor: vendor._id,
        membershipNumber: `MEM-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        plan,
        startDate: start,
        endDate: end,
        status: MEMBERSHIP_STATUS.ACTIVE,
        history: [{ action: "created", plan, by: vendor._id }],
    });
    vendor.membership = membership._id;
    await vendor.save({ validateBeforeSave: false });

    const { raw } = await issueAndSendTempToken(vendor, "email_verify");
    const link = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
    sendVerificationEmail(email, name, link);

    return res.status(201).json(
        new ApiResponse(201, "Vendor registered. Please verify email.", {
            vendor: vendor.toSafeJSON(),
            membership,
        }),
    );
});

export const login = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role }).select("+password");
    if (!user) throw new ApiError(401, "Invalid credentials");
    if (!user.isActive) throw new ApiError(403, "Account is disabled");

    const ok = await user.comparePassword(password);
    if (!ok) throw new ApiError(401, "Invalid credentials");

    const tokens = await issueAuthTokens(user);
    setAuthCookies(res, tokens);

    return res.status(200).json(
        new ApiResponse(200, "Login successful", {
            user: user.toSafeJSON(),
            ...tokens,
        }),
    );
});

export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 },
    });
    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    return res.status(200).json(new ApiResponse(200, "Logged out"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incoming) throw new ApiError(401, "Refresh token required");

    let decoded;
    try {
        decoded = verifyToken(incoming, TOKEN_TYPES.REFRESH);
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded._id).select("+refreshToken");
    if (!user || user.refreshToken !== incoming) {
        throw new ApiError(401, "Refresh token reuse detected");
    }

    const tokens = await issueAuthTokens(user);
    setAuthCookies(res, tokens);

    return res
        .status(200)
        .json(new ApiResponse(200, "Token refreshed", tokens));
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const hash = hashToken(token);

    const user = await User.findOne({
        tempTokenHash: hash,
        tempTokenPurpose: "email_verify",
        tempTokenExpiresAt: { $gt: new Date() },
    }).select("+tempTokenHash +tempTokenExpiresAt +tempTokenPurpose");

    if (!user) throw new ApiError(400, "Invalid or expired verification token");

    user.isVerified = true;
    user.tempTokenHash = undefined;
    user.tempTokenExpiresAt = undefined;
    user.tempTokenPurpose = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, "Email verified"));
});

export const resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
        // Avoid leaking existence
        return res
            .status(200)
            .json(
                new ApiResponse(200, "If the account exists, a link was sent"),
            );
    }

    const { raw } = await issueAndSendTempToken(user, "email_verify");
    const link = `${process.env.CLIENT_URL}/verify-email?token=${raw}`;
    sendVerificationEmail(email, user.name, link);

    return res
        .status(200)
        .json(new ApiResponse(200, "Verification email sent"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, "If the account exists, a link was sent"),
            );
    }
    const { raw } = await issueAndSendTempToken(user, "password_reset");
    const link = `${process.env.CLIENT_URL}/reset-password?token=${raw}`;
    sendPasswordResetEmail(email, user.name, link);
    return res
        .status(200)
        .json(new ApiResponse(200, "Password reset email sent"));
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const hash = hashToken(token);

    const user = await User.findOne({
        tempTokenHash: hash,
        tempTokenPurpose: "password_reset",
        tempTokenExpiresAt: { $gt: new Date() },
    }).select(
        "+tempTokenHash +tempTokenExpiresAt +tempTokenPurpose +password +refreshToken",
    );
    if (!user) throw new ApiError(400, "Invalid or expired reset token");

    user.password = password;
    user.tempTokenHash = undefined;
    user.tempTokenExpiresAt = undefined;
    user.tempTokenPurpose = undefined;
    user.refreshToken = undefined; // invalidate sessions
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Password reset successful"));
});

export const me = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("membership");
    return res.status(200).json(new ApiResponse(200, "Current user", user));
});

export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select(
        "+password +refreshToken",
    );
    const ok = await user.comparePassword(currentPassword);
    if (!ok) throw new ApiError(400, "Current password is incorrect");
    user.password = newPassword;
    user.refreshToken = undefined;
    await user.save();
    return res.status(200).json(new ApiResponse(200, "Password changed"));
});
