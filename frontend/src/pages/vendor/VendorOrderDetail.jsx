import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { Loader } from "../../components/Loader.jsx";
import { fmtDateTime, inr, titleCase } from "../../utils/format.js";

const STATUSES = [
    "pending",
    "confirmed",
    "received",
    "ready_for_shipping",
    "out_for_delivery",
    "delivered",
    "cancelled",
];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export default function VendorOrderDetail() {
    const { id } = useParams();
    const qc = useQueryClient();

    const { data: order, isLoading } = useQuery({
        queryKey: ["vendorOrder", id],
        queryFn: () => api.get(`/vendor/orders/${id}`).then((r) => r.data.data),
    });

    const updateMut = useMutation({
        mutationFn: (body) => api.patch(`/vendor/orders/${id}`, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["vendorOrder", id] });
            qc.invalidateQueries({ queryKey: ["vendorOrders"] });
            toast.success("Order updated");
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    if (isLoading) return <Loader />;
    if (!order) return null;

    return (
        <div className="space-y-6">
            <Link
                to="/vendor/orders"
                className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1.5"
            >
                <ArrowLeft className="w-4 h-4" /> Back to orders
            </Link>

            <div className="card p-6 grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <p className="text-xs text-zinc-500">Order ID</p>
                    <h1 className="font-display text-2xl">
                        #{order._id.slice(-8).toUpperCase()}
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Placed {fmtDateTime(order.createdAt)}
                    </p>
                    <p className="text-sm text-zinc-400 mt-3">
                        Customer:{" "}
                        <span className="text-zinc-200">
                            {order.user?.name}
                        </span>{" "}
                        · {order.user?.email}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-display text-2xl">
                        {inr(order.totalAmount)}
                    </p>
                    <p className="text-xs text-zinc-500 capitalize">
                        {order.paymentMethod}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                <div className="card p-5 lg:col-span-2 divide-y divide-white/5">
                    {order.items.map((it, i) => (
                        <div
                            key={i}
                            className="py-3 flex justify-between text-sm"
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

                <div className="card p-5 space-y-4">
                    <h3 className="font-display text-lg">Update status</h3>
                    <div>
                        <label className="label">Order status</label>
                        <select
                            className="input capitalize"
                            value={order.status}
                            onChange={(e) =>
                                updateMut.mutate({ status: e.target.value })
                            }
                        >
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {titleCase(s)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Payment status</label>
                        <select
                            className="input capitalize"
                            value={order.paymentStatus}
                            onChange={(e) =>
                                updateMut.mutate({
                                    status: order.status,
                                    paymentStatus: e.target.value,
                                })
                            }
                        >
                            {PAYMENT_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {titleCase(s)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="border-t border-white/5 pt-3">
                        <p className="text-xs text-zinc-500 mb-1">Ship to</p>
                        <p className="text-sm">{order.shippingAddress?.name}</p>
                        <p className="text-sm text-zinc-400">
                            {order.shippingAddress?.address},{" "}
                            {order.shippingAddress?.city}
                        </p>
                        <p className="text-sm text-zinc-400">
                            {order.shippingAddress?.state}{" "}
                            {order.shippingAddress?.pinCode}
                        </p>
                        <p className="text-sm text-zinc-400">
                            {order.shippingAddress?.phone}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
