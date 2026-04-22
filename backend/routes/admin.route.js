import { Router } from "express";
import {
    addMembership,
    updateMembership,
    listMemberships,
    getMembershipByNumber,
    listUsers,
    getUserById,
    updateUserOrVendor,
    deleteUserOrVendor,
    dashboardStats,
    createUserOrVendor,
} from "../controllers/admin.controller.js";
import { verifyJWT, requireAdmin } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    createMembershipSchema,
    updateMembershipSchema,
    adminUpdateUserSchema,
    adminCreateUserSchema,
} from "../validators/common.validator.js";

const router = Router();

router.use(verifyJWT, requireAdmin);

router.route("/dashboard").get(dashboardStats);
router.route("/memberships").get(listMemberships);
router.route("/memberships").post(validate(createMembershipSchema), addMembership);
router.route("/memberships").patch(
    validate(updateMembershipSchema),
    updateMembership,
);
router.route("/memberships/:number").get(getMembershipByNumber);
router.route("/users").get(listUsers);
router.route("/users").post(validate(adminCreateUserSchema), createUserOrVendor);
router.route("/users/:id").get(getUserById);
router.route("/users/:id").patch(validate(adminUpdateUserSchema), updateUserOrVendor);
router.route("/users/:id").delete(deleteUserOrVendor);

export default router;
