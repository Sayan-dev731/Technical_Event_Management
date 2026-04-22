import { Router } from "express";
import {
    listVendors,
    getVendorWithItems,
    browseItems,
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    checkout,
    listMyOrders,
    getMyOrder,
    cancelMyOrder,
    createGuestList,
    listGuestLists,
    getGuestList,
    updateGuestList,
    deleteGuestList,
    createItemRequest,
    listMyRequests,
} from "../controllers/user.controller.js";
import { verifyJWT, requireUser } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    addToCartSchema,
    updateCartSchema,
    checkoutSchema,
    cancelOrderSchema,
    createGuestListSchema,
    updateGuestListSchema,
    createItemRequestSchema,
} from "../validators/common.validator.js";

const router = Router();

router.use(verifyJWT, requireUser);
router.route("/vendors").get(listVendors);
router.route("/vendors/:id").get(getVendorWithItems);
router.route("/items").get(browseItems);

router.route("/cart").get(getCart);
router.route("/cart").post(validate(addToCartSchema), addToCart);
router.route("/cart/:lineId").patch(validate(updateCartSchema), updateCartItem);
router.route("/cart/:lineId").delete(removeCartItem);
router.route("/cart").delete(clearCart);

router.route("/checkout").post(validate(checkoutSchema), checkout);
router.route("/orders").get(listMyOrders);
router.route("/orders/:id").get(getMyOrder);
router.route("/orders/:id/cancel").post(validate(cancelOrderSchema), cancelMyOrder);

router.route("/guest-lists").get(listGuestLists);
router.route("/guest-lists").post(validate(createGuestListSchema), createGuestList);
router.route("/guest-lists/:id").get(getGuestList);
router.route("/guest-lists/:id").patch(
    validate(updateGuestListSchema),
    updateGuestList,
);
router.route("/guest-lists/:id").delete(deleteGuestList);

router.route("/requests").post(validate(createItemRequestSchema), createItemRequest);
router.route("/requests").get(listMyRequests);

export default router;
