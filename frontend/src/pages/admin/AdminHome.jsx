import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Store, Boxes, Truck, BadgeCheck, Banknote } from "lucide-react";
import { api } from "../../api/axios.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { inr } from "../../utils/format.js";

export default function AdminHome() {
    const { data, isLoading } = useQuery({
        queryKey: ["adminDashboard"],
        queryFn: () => api.get("/admin/dashboard").then((r) => r.data.data),
    });

    const tiles = [
        {
            label: "Users",
            value: data?.users,
            icon: Users,
            color: "from-mint-300 to-mint-600",
        },
        {
            label: "Vendors",
            value: data?.vendors,
            icon: Store,
            color: "from-blue-300 to-blue-600",
        },
        {
            label: "Items",
            value: data?.items,
            icon: Boxes,
            color: "from-fuchsia-300 to-fuchsia-600",
        },
        {
            label: "Orders",
            value: data?.orders,
            icon: Truck,
            color: "from-amber-300 to-amber-600",
        },
        {
            label: "Active memberships",
            value: data?.activeMemberships,
            icon: BadgeCheck,
            color: "from-emerald-300 to-emerald-600",
        },
        {
            label: "Total revenue",
            value: data?.totalRevenue,
            icon: Banknote,
            color: "from-rose-300 to-rose-600",
            money: true,
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs uppercase tracking-widest text-mint-400">
                    Admin console
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">
                    Platform overview
                </h1>
                <p className="text-zinc-400 mt-1">
                    Eyes on every corner of Eventide.
                </p>
            </div>
            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tiles.map((t, i) => (
                        <motion.div
                            key={t.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="card p-5 relative overflow-hidden"
                        >
                            <div
                                className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${t.color} opacity-10 blur-2xl`}
                            />
                            <div className="w-10 h-10 rounded-xl bg-mint-400/10 text-mint-300 grid place-items-center">
                                <t.icon className="w-5 h-5" />
                            </div>
                            <p className="mt-4 text-3xl font-display font-semibold">
                                {t.money ? inr(t.value || 0) : (t.value ?? 0)}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {t.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
