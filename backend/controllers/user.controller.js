import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Item } from "../models/Item.model.js";
import { Cart } from "../models/Cart.model.js";
import { Order } from "../models/Order.model.js";
import { GuestList } from "../models/GuestList.model.js";
import { ItemRequest } from "../models/ItemRequest.model.js";
import {
    ROLES,
    ORDER_STATUS,
    PAYMENT_STATUS,
    ITEM_STATUS,
} from "../constants.js";
import { sendOrderConfirmationEmail } from "../utils/mails.js";

export const listVendors = asyncHandler(async (req, res) => {
    const { category, q, page = 1, limit = 20 } = req.query;
    const filter = { role: ROLES.VENDOR, isActive: true };
    if (category) filter.category = category;
    if (q) filter.name = new RegExp(q, "i");
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        User.find(filter)
            .select("name email phone contactInfo category avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        User.countDocuments(filter),
    ]);
    return res.status(200).json(
        new ApiResponse(200, "Vendors", {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
        }),
    );
});

export const getVendorWithItems = asyncHandler(async (req, res) => {
    const vendor = await User.findOne({
        _id: req.params.id,
        role: ROLES.VENDOR,
        isActive: true,
    }).select("name email phone contactInfo category avatar");
    if (!vendor) throw new ApiError(404, "Vendor not found");
    const items = await Item.find({
        vendor: vendor._id,
        status: "available",
    });
    return res
        .status(200)
        .json(new ApiResponse(200, "Vendor", { vendor, items }));
});

export const browseItems = asyncHandler(async (req, res) => {
    const { category, q, vendor, page = 1, limit = 20 } = req.query;
    const filter = { status: "available" };
    if (category) filter.category = category;
    if (vendor) filter.vendor = vendor;
    if (q) filter.name = new RegExp(q, "i");
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        Item.find(filter)
            .populate("vendor", "name category")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Item.countDocuments(filter),
    ]);
    return res.status(200).json(
        new ApiResponse(200, "Items", {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
        }),
    );
});

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    return cart;
};

export const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate("items.item", "name price image status")
        .populate("items.vendor", "name category");
    return res
        .status(200)
        .json(new ApiResponse(200, "Cart", cart || { items: [] }));
});

export const addToCart = asyncHandler(async (req, res) => {
    const { itemId, quantity } = req.body;
    const item = await Item.findById(itemId);
    if (!item || item.status !== "available") {
        throw new ApiError(404, "Item unavailable");
    }
    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((i) => i.item.toString() === itemId);
    const newQty = (existing?.quantity || 0) + quantity;
    if (item.stock > 0 && newQty > item.stock) {
        throw new ApiError(400, `Only ${item.stock} unit(s) in stock`);
    }
    if (existing) {
        existing.quantity = newQty;
    } else {
        cart.items.push({
            item: item._id,
            vendor: item.vendor,
            quantity,
            priceAtAdd: item.price,
        });
    }
    await cart.save();
    return res.status(200).json(new ApiResponse(200, "Added to cart", cart));
});

export const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new ApiError(404, "Cart empty");
    const line = cart.items.id(req.params.lineId);
    if (!line) throw new ApiError(404, "Line item not found");
    line.quantity = quantity;
    await cart.save();
    return res.status(200).json(new ApiResponse(200, "Cart updated", cart));
});

export const removeCartItem = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new ApiError(404, "Cart empty");
    const line = cart.items.id(req.params.lineId);
    if (!line) throw new ApiError(404, "Line item not found");
    line.deleteOne();
    await cart.save();
    return res.status(200).json(new ApiResponse(200, "Item removed", cart));
});

export const clearCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } },
    );
    return res.status(200).json(new ApiResponse(200, "Cart cleared"));
});

export const checkout = asyncHandler(async (req, res) => {
    const { paymentMethod, paymentRef, shippingAddress } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    // Snapshot items
    const itemIds = cart.items.map((i) => i.item);
    const items = await Item.find({ _id: { $in: itemIds } });
    const map = new Map(items.map((i) => [i._id.toString(), i]));

    const orderItems = cart.items.map((line) => {
        const it = map.get(line.item.toString());
        if (!it) throw new ApiError(400, "Some items no longer exist");
        if (it.status !== "available") {
            throw new ApiError(400, `Item "${it.name}" is no longer available`);
        }
        if (it.stock > 0 && line.quantity > it.stock) {
            throw new ApiError(
                400,
                `Insufficient stock for "${it.name}" — only ${it.stock} left`,
            );
        }
        return {
            item: it._id,
            vendor: it.vendor,
            name: it.name,
            price: it.price,
            quantity: line.quantity,
        };
    });

    const totalAmount = orderItems.reduce(
        (s, l) => s + l.price * l.quantity,
        0,
    );

    // Dummy payment processing: cash/COD => pending, others => assume paid.
    const paidStatuses = ["upi", "card", "netbanking"];
    const paymentStatus = paidStatuses.includes(paymentMethod)
        ? PAYMENT_STATUS.PAID
        : PAYMENT_STATUS.PENDING;

    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod,
        paymentRef:
            paymentRef ||
            (paymentStatus === PAYMENT_STATUS.PAID
                ? `DUMMY-${Date.now()}`
                : ""),
        paymentStatus,
        status: ORDER_STATUS.CONFIRMED,
    });

    // Decrement stock for every ordered item and auto-mark out_of_stock at 0.
    // Uses an aggregation pipeline update so both stages run atomically per doc.
    const bulkOps = orderItems.map((line) => ({
        updateOne: {
            filter: { _id: line.item },
            update: [
                {
                    $set: {
                        stock: {
                            $max: [0, { $subtract: ["$stock", line.quantity] }],
                        },
                    },
                },
                {
                    $set: {
                        status: {
                            $cond: [
                                { $lte: ["$stock", 0] },
                                ITEM_STATUS.OUT_OF_STOCK,
                                "$status",
                            ],
                        },
                    },
                },
            ],
        },
    }));
    await Item.bulkWrite(bulkOps);

    cart.items = [];
    await cart.save();

    sendOrderConfirmationEmail(req.user.email, req.user.name, order);

    return res.status(201).json(new ApiResponse(201, "Order placed", order));
});

export const listMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Order.countDocuments(filter),
    ]);
    return res.status(200).json(
        new ApiResponse(200, "Orders", {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
        }),
    );
});

export const getMyOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!order) throw new ApiError(404, "Order not found");
    return res.status(200).json(new ApiResponse(200, "Order", order));
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!order) throw new ApiError(404, "Order not found");
    if (
        [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status)
    ) {
        throw new ApiError(400, `Cannot cancel a ${order.status} order`);
    }
    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = req.body?.reason || "";
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
        order.paymentStatus = PAYMENT_STATUS.REFUNDED;
    }
    await order.save();
    return res.status(200).json(new ApiResponse(200, "Order cancelled", order));
});

export const createGuestList = asyncHandler(async (req, res) => {
    const list = await GuestList.create({ ...req.body, user: req.user._id });
    return res
        .status(201)
        .json(new ApiResponse(201, "Guest list created", list));
});

export const listGuestLists = asyncHandler(async (req, res) => {
    const lists = await GuestList.find({ user: req.user._id }).sort({
        createdAt: -1,
    });
    return res.status(200).json(new ApiResponse(200, "Guest lists", lists));
});

export const getGuestList = asyncHandler(async (req, res) => {
    const list = await GuestList.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!list) throw new ApiError(404, "Guest list not found");
    return res.status(200).json(new ApiResponse(200, "Guest list", list));
});

export const updateGuestList = asyncHandler(async (req, res) => {
    const list = await GuestList.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true },
    );
    if (!list) throw new ApiError(404, "Guest list not found");
    return res
        .status(200)
        .json(new ApiResponse(200, "Guest list updated", list));
});

export const deleteGuestList = asyncHandler(async (req, res) => {
    const list = await GuestList.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!list) throw new ApiError(404, "Guest list not found");
    return res.status(200).json(new ApiResponse(200, "Guest list deleted"));
});

/* ----------------------------- Item Requests -------------------------- */

export const createItemRequest = asyncHandler(async (req, res) => {
    const { vendorId, itemId, message, quantity } = req.body;
    const vendor = await User.findOne({ _id: vendorId, role: ROLES.VENDOR });
    if (!vendor) throw new ApiError(404, "Vendor not found");

    const reqDoc = await ItemRequest.create({
        user: req.user._id,
        vendor: vendor._id,
        item: itemId,
        message,
        quantity,
    });
    return res.status(201).json(new ApiResponse(201, "Request sent", reqDoc));
});

export const listMyRequests = asyncHandler(async (req, res) => {
    const data = await ItemRequest.find({ user: req.user._id })
        .populate("vendor", "name category")
        .populate("item", "name price")
        .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, "My requests", data));
});
