import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Store,
    Boxes,
    ShoppingBag,
    Truck,
    ArrowRight,
    Heart,
} from "lucide-react";
import { api } from "../../api/axios.js";
import { useAuth } from "../../store/auth.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { fmtDate, inr, titleCase } from "../../utils/format.js";

export default function UserHome() {
    const { user } = useAuth();

    const cart = useQuery({
        queryKey: ["cart"],
        queryFn: () => api.get("/user/cart").then((r) => r.data.data),
    });
    const orders = useQuery({
        queryKey: ["orders", { limit: 5 }],
        queryFn: () => api.get("/user/orders?limit=5").then((r) => r.data.data),
    });
    const vendors = useQuery({
        queryKey: ["vendors", { limit: 6 }],
        queryFn: () =>
            api.get("/user/vendors?limit=6").then((r) => r.data.data),
    });

    const cartCount = cart.data?.items?.length || 0;
    const cartTotal =
        cart.data?.items?.reduce(
            (s, l) => s + (l.priceAtAdd || l.item?.price || 0) * l.quantity,
            0,
        ) || 0;

    const stats = [
        {
            label: "Cart items",
            value: cartCount,
            sub: cartTotal ? inr(cartTotal) : "Empty",
            icon: ShoppingBag,
            to: "/user/cart",
        },
        {
            label: "Orders",
            value: orders.data?.total ?? 0,
            sub: "Lifetime",
            icon: Truck,
            to: "/user/orders",
        },
        {
            label: "Vendors",
            value: vendors.data?.total ?? 0,
            sub: "Available",
            icon: Store,
            to: "/user/vendors",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs uppercase tracking-widest text-mint-400">
                    Welcome back
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">
                    Hi {user?.name?.split(" ")[0]} 👋
                </h1>
                <p className="text-zinc-400 mt-1">
                    Let’s plan something memorable.
                </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Link
                            to={s.to}
                            className="card p-5 block hover:bg-white/[0.05] transition group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-xl bg-mint-400/10 text-mint-300 grid place-items-center">
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 group-hover:text-white transition" />
                            </div>
                            <div className="mt-4">
                                <div className="text-2xl font-semibold font-display">
                                    {s.value}
                                </div>
                                <div className="text-xs text-zinc-500 mt-0.5">
                                    {s.label} · {s.sub}
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-baseline justify-between">
                        <h2 className="font-display text-xl">
                            Featured vendors
                        </h2>
                        <Link
                            to="/user/vendors"
                            className="text-sm text-mint-400 hover:text-mint-300"
                        >
                            View all →
                        </Link>
                    </div>
                    {vendors.isLoading ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            <CardSkeleton /> <CardSkeleton />
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {vendors.data?.data?.slice(0, 4).map((v) => (
                                <Link
                                    key={v._id}
                                    to={`/user/vendors/${v._id}`}
                                    className="card p-5 hover:bg-white/[0.05] transition group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-mint-400 to-mint-700 grid place-items-center text-ink-950 font-bold">
                                            {v.name?.[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium truncate">
                                                {v.name}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {v.category}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                        <h2 className="font-display text-xl">Recent orders</h2>
                        <Link
                            to="/user/orders"
                            className="text-sm text-mint-400 hover:text-mint-300"
                        >
                            All →
                        </Link>
                    </div>
                    <div className="card p-2 divide-y divide-white/5">
                        {orders.isLoading && <CardSkeleton />}
                        {!orders.isLoading &&
                            (orders.data?.data?.length || 0) === 0 && (
                                <div className="p-6 text-center text-sm text-zinc-400">
                                    No orders yet.
                                </div>
                            )}
                        {orders.data?.data?.map((o) => (
                            <Link
                                key={o._id}
                                to={`/user/orders/${o._id}`}
                                className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        #{o._id.slice(-6).toUpperCase()}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {fmtDate(o.createdAt)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm">
                                        {inr(o.totalAmount)}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                                        {titleCase(o.status)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-display text-lg flex items-center gap-2">
                        <Heart className="w-4 h-4 text-mint-400" /> Build your
                        guest list
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                        Track RSVPs, notes and dates in one place.
                    </p>
                </div>
                <Link to="/user/guest-lists" className="btn-primary">
                    Open guest lists <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
