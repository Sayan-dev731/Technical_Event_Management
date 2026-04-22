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
    getVendorOrder,
    updateVendorOrderStatus,
    deleteVendorOrder,
} from "../controllers/vendor.controller.js";
import { verifyJWT, requireVendor } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createItemSchema,
    updateItemSchema,
    respondItemRequestSchema,
    updateOrderStatusSchema,
    cancelOrderSchema,
} from "../validators/common.validator.js";

const router = Router();

router.use(verifyJWT, requireVendor);
router.route("/items").get(listMyItems);
router.route("/items").post(
    upload.single("image"),
    validate(createItemSchema),
    createItem,
);
router.route("/items/:id").get(getMyItem);
router.route("/items/:id").patch(
    upload.single("image"),
    validate(updateItemSchema),
    updateItem,
);
router.route("/items/:id").delete(deleteItem);
router.route("/requests").get(listIncomingRequests);
router.route("/requests/:id").patch(
    validate(respondItemRequestSchema),
    respondToRequest,
);
router.route("/orders").get(listVendorOrders);
router.route("/orders/:id").get(getVendorOrder);
router.route("/orders/:id").patch(
    validate(updateOrderStatusSchema),
    updateVendorOrderStatus,
);
router.route("/orders/:id").delete(validate(cancelOrderSchema), deleteVendorOrder);

export default router;
