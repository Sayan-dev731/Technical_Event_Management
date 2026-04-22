import { Router } from "express";
import {
    signupUser,
    signupAdmin,
    signupVendor,
    login,
    logout,
    refreshAccessToken,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    me,
    changePassword,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import {
    adminSignupSchema,
    userSignupSchema,
    vendorSignupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    resendVerificationSchema,
    changePasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post(
    "/signup/user",
    authLimiter,
    validate(userSignupSchema),
    signupUser,
);
router.post(
    "/signup/admin",
    authLimiter,
    validate(adminSignupSchema),
    signupAdmin,
);
router.post(
    "/signup/vendor",
    authLimiter,
    validate(vendorSignupSchema),
    signupVendor,
);

router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh", refreshAccessToken);

router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post(
    "/resend-verification",
    authLimiter,
    validate(resendVerificationSchema),
    resendVerification,
);

router.post(
    "/forgot-password",
    authLimiter,
    validate(forgotPasswordSchema),
    forgotPassword,
);
router.post(
    "/reset-password",
    authLimiter,
    validate(resetPasswordSchema),
    resetPassword,
);

router.get("/me", verifyJWT, me);
router.post(
    "/change-password",
    verifyJWT,
    validate(changePasswordSchema),
    changePassword,
);

export default router;
