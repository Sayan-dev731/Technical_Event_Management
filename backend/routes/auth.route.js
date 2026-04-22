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
    updateProfile,
    updateAvatar,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
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
import { updateProfileSchema } from "../validators/common.validator.js";

const router = Router();

router.route("/signup/user").post(
    authLimiter,
    validate(userSignupSchema),
    signupUser,
);
router.route("/signup/admin").post(
    authLimiter,
    validate(adminSignupSchema),
    signupAdmin,
);
router.route("/signup/vendor").post(
    authLimiter,
    validate(vendorSignupSchema),
    signupVendor,
);

router.route("/login").post(authLimiter, validate(loginSchema), login);
router.route("/logout").post(verifyJWT, logout);
router.route("/refresh").post(refreshAccessToken);

router.route("/verify-email").post(validate(verifyEmailSchema), verifyEmail);
router.route("/resend-verification").post(
    authLimiter,
    validate(resendVerificationSchema),
    resendVerification,
);

router.route("/forgot-password").post(
    authLimiter,
    validate(forgotPasswordSchema),
    forgotPassword,
);
router.route("/reset-password").post(
    authLimiter,
    validate(resetPasswordSchema),
    resetPassword,
);

router.route("/me").get(verifyJWT, me);
router.route("/me").patch(verifyJWT, validate(updateProfileSchema), updateProfile);
router.route("/me/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/change-password").post(
    verifyJWT,
    validate(changePasswordSchema),
    changePassword,
);

export default router;
