import { Router } from "express";
import {
    createItem,
    listMyItems,
    getMyItem,
    updateItem,
    deleteItem,
    listIncomingRequests,
    respondToRequest,
    listVendorOrders,
} from "../controllers/vendor.controller.js";
import { verifyJWT, requireVendor } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createItemSchema,
    updateItemSchema,
    respondItemRequestSchema,
} from "../validators/common.validator.js";

const router = Router();

router.use(verifyJWT, requireVendor);
router.get("/items", listMyItems);
router.post(
    "/items",
    upload.single("image"),
    validate(createItemSchema),
    createItem,
);
router.get("/items/:id", getMyItem);
router.patch(
    "/items/:id",
    upload.single("image"),
    validate(updateItemSchema),
    updateItem,
);
router.delete("/items/:id", deleteItem);
router.get("/requests", listIncomingRequests);
router.patch(
    "/requests/:id",
    validate(respondItemRequestSchema),
    respondToRequest,
);
router.get("/orders", listVendorOrders);

export default router;
