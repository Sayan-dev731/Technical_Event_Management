import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, X } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { Loader } from "../../components/Loader.jsx";
import { fmtDateTime, inr, titleCase } from "../../utils/format.js";

const STAGES = [
    "pending",
    "confirmed",
    "received",
    "ready_for_shipping",
    "out_for_delivery",
    "delivered",
];

export default function OrderDetail() {
    const { id } = useParams();
    const qc = useQueryClient();
    const { data: order, isLoading } = useQuery({
        queryKey: ["order", id],
        queryFn: () => api.get(`/user/orders/${id}`).then((r) => r.data.data),
    });

    const cancelMut = useMutation({
        mutationFn: () =>
            api.post(`/user/orders/${id}/cancel`, { reason: "User cancelled" }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["order", id] });
            toast.success("Order cancelled");
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    if (isLoading) return <Loader />;
    if (!order) return null;
    const idx = STAGES.indexOf(order.status);

    return (
        <div className="space-y-6">
            <Link
                to="/user/orders"
                className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1.5"
            >
                <ArrowLeft className="w-4 h-4" /> Back to orders
            </Link>

            <div className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs text-zinc-500">Order ID</p>
                        <h1 className="font-display text-2xl">
                            #{order._id.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-sm text-zinc-400 mt-1">
                            Placed {fmtDateTime(order.createdAt)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-display text-2xl">
                            {inr(order.totalAmount)}
                        </p>
                        <p className="text-xs text-zinc-500 capitalize">
                            {order.paymentMethod} ·{" "}
                            {titleCase(order.paymentStatus)}
                        </p>
                    </div>
                </div>

                {order.status !== "cancelled" ? (
                    <div className="mt-6">
                        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                            {STAGES.map((s, i) => (
                                <div
                                    key={s}
                                    className="flex items-center gap-2 min-w-fit"
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full ${i <= idx ? "bg-mint-400" : "bg-white/10"}`}
                                    />
                                    <span
                                        className={`text-xs capitalize whitespace-nowrap ${i <= idx ? "text-mint-300" : "text-zinc-500"}`}
                                    >
                                        {titleCase(s)}
                                    </span>
                                    {i < STAGES.length - 1 && (
                                        <span
                                            className={`w-8 h-px ${i < idx ? "bg-mint-400" : "bg-white/10"}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 chip border-red-500/30 text-red-300 bg-red-500/10">
                        Cancelled
                    </div>
                )}

                {!["delivered", "cancelled"].includes(order.status) && (
                    <button
                        onClick={() => cancelMut.mutate()}
                        className="btn-danger mt-6"
                        disabled={cancelMut.isPending}
                    >
                        <X className="w-4 h-4" /> Cancel order
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                <div className="card p-5 lg:col-span-2 divide-y divide-white/5">
                    {order.items.map((it, i) => (
                        <div
                            key={i}
                            className="py-3 flex items-center justify-between text-sm"
                        >
                            <div>
                                <p className="font-medium">{it.name}</p>
                                <p className="text-xs text-zinc-500">
                                    {inr(it.price)} × {it.quantity}
                                </p>
                            </div>
                            <p className="font-medium">
                                {inr(it.price * it.quantity)}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="card p-5">
                    <h3 className="font-display text-lg mb-2">Shipping</h3>
                    <p className="text-sm font-medium">
                        {order.shippingAddress?.name}
                    </p>
                    <p className="text-sm text-zinc-400 mt-1">
                        {order.shippingAddress?.address}
                    </p>
                    <p className="text-sm text-zinc-400">
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state}{" "}
                        {order.shippingAddress?.pinCode}
                    </p>
                    <p className="text-sm text-zinc-400 mt-2">
                        {order.shippingAddress?.phone}
                    </p>
                    <p className="text-sm text-zinc-400">
                        {order.shippingAddress?.email}
                    </p>
                </div>
            </div>
        </div>
    );
}
