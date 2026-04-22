import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import { api } from "../../api/axios.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";
import { fmtDate, inr, titleCase } from "../../utils/format.js";

const STATUSES = [
    "",
    "pending",
    "confirmed",
    "received",
    "ready_for_shipping",
    "out_for_delivery",
    "delivered",
    "cancelled",
];

export default function VendorOrders() {
    const [status, setStatus] = useState("");
    const { data, isLoading } = useQuery({
        queryKey: ["vendorOrders", { status }],
        queryFn: () =>
            api
                .get("/vendor/orders", {
                    params: { status: status || undefined, limit: 30 },
                })
                .then((r) => r.data.data),
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="h-section">Orders</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Orders that include your items.
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                    <button
                        key={s || "all"}
                        onClick={() => setStatus(s)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition ${
                            status === s
                                ? "bg-mint-400/10 border-mint-400/40 text-mint-300"
                                : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300"
                        }`}
                    >
                        {s ? titleCase(s) : "All"}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <CardSkeleton />
            ) : (data?.data?.length || 0) === 0 ? (
                <Empty title="No orders" icon={Truck} />
            ) : (
                <div className="card divide-y divide-white/5">
                    {data.data.map((o) => (
                        <Link
                            key={o._id}
                            to={`/vendor/orders/${o._id}`}
                            className="block p-4 hover:bg-white/[0.04]"
                        >
                            <div className="flex flex-wrap justify-between gap-3">
                                <div>
                                    <p className="font-medium">
                                        #{o._id.slice(-6).toUpperCase()}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {o.user?.name} · {fmtDate(o.createdAt)}
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
            )}
        </div>
    );
}
