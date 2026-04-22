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
router.get("/vendors", listVendors);
router.get("/vendors/:id", getVendorWithItems);
router.get("/items", browseItems);

router.get("/cart", getCart);
router.post("/cart", validate(addToCartSchema), addToCart);
router.patch("/cart/:lineId", validate(updateCartSchema), updateCartItem);
router.delete("/cart/:lineId", removeCartItem);
router.delete("/cart", clearCart);

router.post("/checkout", validate(checkoutSchema), checkout);
router.get("/orders", listMyOrders);
router.get("/orders/:id", getMyOrder);
router.post("/orders/:id/cancel", validate(cancelOrderSchema), cancelMyOrder);

router.get("/guest-lists", listGuestLists);
router.post("/guest-lists", validate(createGuestListSchema), createGuestList);
router.get("/guest-lists/:id", getGuestList);
router.patch(
    "/guest-lists/:id",
    validate(updateGuestListSchema),
    updateGuestList,
);
router.delete("/guest-lists/:id", deleteGuestList);

router.post("/requests", validate(createItemRequestSchema), createItemRequest);
router.get("/requests", listMyRequests);

export default router;
