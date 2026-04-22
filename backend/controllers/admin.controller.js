import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Membership } from "../models/Membership.model.js";
import { Item } from "../models/Item.model.js";
import { Order } from "../models/Order.model.js";
import { ROLES, MEMBERSHIP_STATUS, MEMBERSHIP_PLANS } from "../constants.js";
import { sendMembershipEmail } from "../utils/mails.js";
import crypto from "crypto";

export const createUserOrVendor = asyncHandler(async (req, res) => {
    const { name, email, password, role, category, plan, phone, contactInfo } =
        req.body;
    if (await User.findOne({ email })) {
        throw new ApiError(409, "Email already registered");
    }
    const user = await User.create({
        name,
        email,
        password,
        role,
        category,
        phone,
        contactInfo,
        isVerified: true,
    });

    let membership = null;
    if (role === ROLES.VENDOR) {
        const start = new Date();
        const end = Membership.computeEndDate(
            start,
            plan || MEMBERSHIP_PLANS.SIX_MONTHS,
        );
        membership = await Membership.create({
            vendor: user._id,
            membershipNumber: `MEM-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
            plan: plan || MEMBERSHIP_PLANS.SIX_MONTHS,
            startDate: start,
            endDate: end,
            status: MEMBERSHIP_STATUS.ACTIVE,
            history: [
                {
                    action: "created",
                    plan: plan || MEMBERSHIP_PLANS.SIX_MONTHS,
                    by: req.user._id,
                },
            ],
        });
        user.membership = membership._id;
        await user.save({ validateBeforeSave: false });
    }

    return res.status(201).json(
        new ApiResponse(201, "User created", {
            user: user.toSafeJSON(),
            membership,
        }),
    );
});

export const addMembership = asyncHandler(async (req, res) => {
    const { vendorId, plan, amountPaid } = req.body;
    const vendor = await User.findOne({ _id: vendorId, role: ROLES.VENDOR });
    if (!vendor) throw new ApiError(404, "Vendor not found");

    const start = new Date();
    const end = Membership.computeEndDate(start, plan);

    const membership = await Membership.create({
        vendor: vendor._id,
        membershipNumber: `MEM-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        plan,
        startDate: start,
        endDate: end,
        amountPaid,
        status: MEMBERSHIP_STATUS.ACTIVE,
        history: [{ action: "created", plan, by: req.user._id }],
    });

    vendor.membership = membership._id;
    await vendor.save({ validateBeforeSave: false });

    sendMembershipEmail(vendor.email, vendor.name, membership);

    return res
        .status(201)
        .json(new ApiResponse(201, "Membership created", membership));
});

export const updateMembership = asyncHandler(async (req, res) => {
    const {
        membershipNumber,
        action,
        plan = MEMBERSHIP_PLANS.SIX_MONTHS,
    } = req.body;
    const membership = await Membership.findOne({ membershipNumber });
    if (!membership) throw new ApiError(404, "Membership not found");

    if (action === "extend") {
        const base =
            membership.endDate > new Date() ? membership.endDate : new Date();
        membership.endDate = Membership.computeEndDate(base, plan);
        membership.plan = plan;
        membership.status = MEMBERSHIP_STATUS.ACTIVE;
        membership.history.push({ action: "extended", plan, by: req.user._id });
    } else if (action === "cancel") {
        membership.status = MEMBERSHIP_STATUS.CANCELLED;
        membership.history.push({
            action: "cancelled",
            plan: membership.plan,
            by: req.user._id,
        });
    }

    await membership.save();
    const vendor = await User.findById(membership.vendor);
    if (vendor) sendMembershipEmail(vendor.email, vendor.name, membership);

    return res
        .status(200)
        .json(new ApiResponse(200, "Membership updated", membership));
});

export const listMemberships = asyncHandler(async (req, res) => {
    const { status, plan, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        Membership.find(filter)
            .populate("vendor", "name email category")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Membership.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Memberships", {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
        }),
    );
});

export const getMembershipByNumber = asyncHandler(async (req, res) => {
    const m = await Membership.findOne({
        membershipNumber: req.params.number,
    }).populate("vendor", "name email category");
    if (!m) throw new ApiError(404, "Membership not found");
    return res.status(200).json(new ApiResponse(200, "Membership", m));
});

export const listUsers = asyncHandler(async (req, res) => {
    const { role, q, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (q) {
        filter.$or = [
            { name: new RegExp(q, "i") },
            { email: new RegExp(q, "i") },
        ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        User.find(filter)
            .populate("membership")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        User.countDocuments(filter),
    ]);
    return res.status(200).json(
        new ApiResponse(200, "Users", {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
        }),
    );
});

export const getUserById = asyncHandler(async (req, res) => {
    const u = await User.findById(req.params.id).populate("membership");
    if (!u) throw new ApiError(404, "User not found");
    return res.status(200).json(new ApiResponse(200, "User", u));
});

export const updateUserOrVendor = asyncHandler(async (req, res) => {
    const u = await User.findById(req.params.id);
    if (!u) throw new ApiError(404, "User not found");
    Object.assign(u, req.body);
    await u.save();
    return res
        .status(200)
        .json(new ApiResponse(200, "User updated", u.toSafeJSON()));
});

export const deleteUserOrVendor = asyncHandler(async (req, res) => {
    const u = await User.findById(req.params.id);
    if (!u) throw new ApiError(404, "User not found");
    if (u.role === ROLES.ADMIN)
        throw new ApiError(403, "Cannot delete an admin");
    await u.deleteOne();
    return res.status(200).json(new ApiResponse(200, "User deleted"));
});

export const dashboardStats = asyncHandler(async (_req, res) => {
    const [users, vendors, items, orders, activeMemberships] =
        await Promise.all([
            User.countDocuments({ role: ROLES.USER }),
            User.countDocuments({ role: ROLES.VENDOR }),
            Item.countDocuments(),
            Order.countDocuments(),
            Membership.countDocuments({ status: MEMBERSHIP_STATUS.ACTIVE }),
        ]);

    const revenueAgg = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Dashboard stats", {
            users,
            vendors,
            items,
            orders,
            activeMemberships,
            totalRevenue: revenueAgg[0]?.total || 0,
        }),
    );
});
