import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Item } from "../models/Item.model.js";
import { ItemRequest } from "../models/ItemRequest.model.js";
import { Order } from "../models/Order.model.js";
import { Membership } from "../models/Membership.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { REQUEST_STATUS } from "../constants.js";

const requireActiveMembership = async (vendor) => {
    if (!vendor.membership) {
        throw new ApiError(403, "No active membership. Contact admin.");
    }
    const m = await Membership.findById(vendor.membership);
    if (!m || !m.isActive()) {
        throw new ApiError(403, "Membership inactive or expired");
    }
};

export const createItem = asyncHandler(async (req, res) => {
    await requireActiveMembership(req.user);

    const { name, description, category, price, stock, status } = req.body;

    let image = "";
    let imagePublicId = "";
    if (req.file?.path) {
        const up = await uploadOnCloudinary(req.file.path, "event-mgmt/items");
        if (up) {
            image = up.secure_url;
            imagePublicId = up.public_id;
        }
    }

    const item = await Item.create({
        vendor: req.user._id,
        name,
        description,
        category: category || req.user.category,
        price,
        stock,
        status,
        image,
        imagePublicId,
    });

    return res.status(201).json(new ApiResponse(201, "Item created", item));
});

export const listMyItems = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { vendor: req.user._id };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        Item.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Item.countDocuments(filter),
    ]);
    return res
        .status(200)
        .json(
            new ApiResponse(200, "My items", {
                data,
                total,
                page: Number(page),
                limit: Number(limit),
            }),
        );
});

export const getMyItem = asyncHandler(async (req, res) => {
    const item = await Item.findOne({
        _id: req.params.id,
        vendor: req.user._id,
    });
    if (!item) throw new ApiError(404, "Item not found");
    return res.status(200).json(new ApiResponse(200, "Item", item));
});

export const updateItem = asyncHandler(async (req, res) => {
    await requireActiveMembership(req.user);

    const item = await Item.findOne({
        _id: req.params.id,
        vendor: req.user._id,
    });
    if (!item) throw new ApiError(404, "Item not found");

    Object.assign(item, req.body);

    if (req.file?.path) {
        const up = await uploadOnCloudinary(req.file.path, "event-mgmt/items");
        if (up) {
            if (item.imagePublicId)
                await deleteFromCloudinary(item.imagePublicId);
            item.image = up.secure_url;
            item.imagePublicId = up.public_id;
        }
    }

    await item.save();
    return res.status(200).json(new ApiResponse(200, "Item updated", item));
});

export const deleteItem = asyncHandler(async (req, res) => {
    await requireActiveMembership(req.user);
    const item = await Item.findOneAndDelete({
        _id: req.params.id,
        vendor: req.user._id,
    });
    if (!item) throw new ApiError(404, "Item not found");
    if (item.imagePublicId) await deleteFromCloudinary(item.imagePublicId);
    return res.status(200).json(new ApiResponse(200, "Item deleted"));
});

export const listIncomingRequests = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { vendor: req.user._id };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        ItemRequest.find(filter)
            .populate("user", "name email")
            .populate("item", "name price")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        ItemRequest.countDocuments(filter),
    ]);
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Incoming requests", {
                data,
                total,
                page: Number(page),
                limit: Number(limit),
            }),
        );
});

export const respondToRequest = asyncHandler(async (req, res) => {
    const { status, responseNote } = req.body;
    const reqDoc = await ItemRequest.findOne({
        _id: req.params.id,
        vendor: req.user._id,
    });
    if (!reqDoc) throw new ApiError(404, "Request not found");
    if (reqDoc.status !== REQUEST_STATUS.PENDING) {
        throw new ApiError(400, `Request already ${reqDoc.status}`);
    }
    reqDoc.status = status;
    reqDoc.responseNote = responseNote;
    reqDoc.respondedAt = new Date();
    await reqDoc.save();
    return res
        .status(200)
        .json(new ApiResponse(200, "Request updated", reqDoc));
});

export const listVendorOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const match = { "items.vendor": req.user._id };
    if (status) match.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        Order.find(match)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Order.countDocuments(match),
    ]);
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Vendor orders", {
                data,
                total,
                page: Number(page),
                limit: Number(limit),
            }),
        );
});
