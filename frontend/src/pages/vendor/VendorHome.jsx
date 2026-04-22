import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Boxes, Inbox, Truck, BadgeCheck, ArrowRight } from "lucide-react";
import { api } from "../../api/axios.js";
import { useAuth } from "../../store/auth.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { fmtDate, inr, titleCase } from "../../utils/format.js";

export default function VendorHome() {
    const { user } = useAuth();
    const items = useQuery({
        queryKey: ["myItems"],
        queryFn: () =>
            api.get("/vendor/items?limit=1").then((r) => r.data.data),
    });
    const reqs = useQuery({
        queryKey: ["incomingReqs"],
        queryFn: () =>
            api.get("/vendor/requests?limit=5").then((r) => r.data.data),
    });
    const orders = useQuery({
        queryKey: ["vendorOrders"],
        queryFn: () =>
            api.get("/vendor/orders?limit=5").then((r) => r.data.data),
    });

    const m = user?.membership;

    const stats = [
        {
            label: "Items",
            value: items.data?.total ?? 0,
            icon: Boxes,
            to: "/vendor/items",
        },
        {
            label: "Requests",
            value: reqs.data?.total ?? 0,
            icon: Inbox,
            to: "/vendor/requests",
        },
        {
            label: "Orders",
            value: orders.data?.total ?? 0,
            icon: Truck,
            to: "/vendor/orders",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs uppercase tracking-widest text-mint-400">
                    Vendor console
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">
                    Hi {user?.name?.split(" ")[0]}
                </h1>
                <p className="text-zinc-400 mt-1">
                    Here’s a snapshot of your business today.
                </p>
            </div>

            {m && (
                <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-mint-400/10 text-mint-300 grid place-items-center">
                            <BadgeCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium">
                                {titleCase(m.plan?.replace(/_/g, " "))}{" "}
                                membership · {titleCase(m.status)}
                            </p>
                            <p className="text-xs text-zinc-500">
                                Expires {fmtDate(m.endDate)} · #
                                {m.membershipNumber}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4">
                {stats.map((s) => (
                    <Link
                        key={s.label}
                        to={s.to}
                        className="card p-5 hover:bg-white/[0.05] transition group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-mint-400/10 text-mint-300 grid place-items-center">
                                <s.icon className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                        </div>
                        <div className="mt-4">
                            <div className="text-2xl font-display font-semibold">
                                {s.value}
                            </div>
                            <div className="text-xs text-zinc-500">
                                {s.label}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
                <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                        <h2 className="font-display text-xl">Recent orders</h2>
                        <Link
                            to="/vendor/orders"
                            className="text-sm text-mint-400"
                        >
                            All →
                        </Link>
                    </div>
                    <div className="card divide-y divide-white/5">
                        {orders.isLoading && <CardSkeleton />}
                        {orders.data?.data?.length === 0 && (
                            <div className="p-6 text-center text-sm text-zinc-500">
                                No orders yet.
                            </div>
                        )}
                        {orders.data?.data?.map((o) => (
                            <Link
                                key={o._id}
                                to={`/vendor/orders/${o._id}`}
                                className="block p-4 hover:bg-white/5"
                            >
                                <div className="flex justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium">
                                            #{o._id.slice(-6).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {o.user?.name} ·{" "}
                                            {fmtDate(o.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {inr(o.totalAmount)}
                                        </p>
                                        <span className="chip mt-1">
                                            {titleCase(o.status)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                        <h2 className="font-display text-xl">
                            Pending requests
                        </h2>
                        <Link
                            to="/vendor/requests"
                            className="text-sm text-mint-400"
                        >
                            All →
                        </Link>
                    </div>
                    <div className="card divide-y divide-white/5">
                        {reqs.isLoading && <CardSkeleton />}
                        {reqs.data?.data?.length === 0 && (
                            <div className="p-6 text-center text-sm text-zinc-500">
                                No requests yet.
                            </div>
                        )}
                        {reqs.data?.data?.map((r) => (
                            <div key={r._id} className="p-4">
                                <div className="flex justify-between">
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">
                                            {r.user?.name} ·{" "}
                                            {r.item?.name || "General request"}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {fmtDate(r.createdAt)} · Qty{" "}
                                            {r.quantity}
                                        </p>
                                    </div>
                                    <span className="chip capitalize">
                                        {r.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
