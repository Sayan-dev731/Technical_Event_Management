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

router.get("/dashboard", dashboardStats);
router.get("/memberships", listMemberships);
router.post("/memberships", validate(createMembershipSchema), addMembership);
router.patch(
    "/memberships",
    validate(updateMembershipSchema),
    updateMembership,
);
router.get("/memberships/:number", getMembershipByNumber);
router.get("/users", listUsers);
router.post("/users", validate(adminCreateUserSchema), createUserOrVendor);
router.get("/users/:id", getUserById);
router.patch("/users/:id", validate(adminUpdateUserSchema), updateUserOrVendor);
router.delete("/users/:id", deleteUserOrVendor);

export default router;
