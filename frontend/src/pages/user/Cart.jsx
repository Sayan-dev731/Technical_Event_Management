import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { Loader } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";
import { inr } from "../../utils/format.js";

export default function Cart() {
    const qc = useQueryClient();
    const nav = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["cart"],
        queryFn: () => api.get("/user/cart").then((r) => r.data.data),
    });

    const updateMut = useMutation({
        mutationFn: ({ lineId, quantity }) =>
            api.patch(`/user/cart/${lineId}`, { quantity }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
        onError: (e) => toast.error(apiMessage(e)),
    });
    const removeMut = useMutation({
        mutationFn: (lineId) => api.delete(`/user/cart/${lineId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    });
    const clearMut = useMutation({
        mutationFn: () => api.delete("/user/cart"),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    });

    if (isLoading) return <Loader />;
    const items = data?.items || [];
    const total = items.reduce(
        (s, l) => s + (l.priceAtAdd || l.item?.price || 0) * l.quantity,
        0,
    );

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="h-section">Your cart</h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Review your selection before checking out.
                    </p>
                </div>
                {items.length > 0 && (
                    <button
                        onClick={() => clearMut.mutate()}
                        className="btn-ghost text-red-300 hover:text-red-200"
                    >
                        <Trash2 className="w-4 h-4" /> Clear cart
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <Empty
                    icon={ShoppingBag}
                    title="Your cart is empty"
                    subtitle="Browse vendors and add items you love."
                    action={
                        <Link to="/user/items" className="btn-primary">
                            Browse items <ArrowRight className="w-4 h-4" />
                        </Link>
                    }
                />
            ) : (
                <div className="grid lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 card divide-y divide-white/5">
                        {items.map((line) => {
                            const price =
                                line.priceAtAdd || line.item?.price || 0;
                            return (
                                <div
                                    key={line._id}
                                    className="p-4 flex items-center gap-4"
                                >
                                    <div className="w-16 h-16 rounded-xl bg-ink-800 overflow-hidden">
                                        {line.item?.image ? (
                                            <img
                                                src={line.item.image}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        ) : null}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                            {line.item?.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            By {line.vendor?.name}
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            {inr(price)} each
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-ink-800 rounded-lg p-1">
                                        <button
                                            onClick={() =>
                                                line.quantity > 1 &&
                                                updateMut.mutate({
                                                    lineId: line._id,
                                                    quantity: line.quantity - 1,
                                                })
                                            }
                                            className="p-1.5 hover:text-mint-300"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="px-1 min-w-[1.5rem] text-center text-sm">
                                            {line.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateMut.mutate({
                                                    lineId: line._id,
                                                    quantity: line.quantity + 1,
                                                })
                                            }
                                            className="p-1.5 hover:text-mint-300"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <p className="w-20 text-right font-medium">
                                        {inr(price * line.quantity)}
                                    </p>
                                    <button
                                        onClick={() =>
                                            removeMut.mutate(line._id)
                                        }
                                        className="p-2 text-zinc-500 hover:text-red-400"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="card p-5 h-fit lg:sticky lg:top-6 space-y-3">
                        <h3 className="font-display text-lg">Order summary</h3>
                        <Row label="Subtotal" value={inr(total)} />
                        <Row
                            label="Delivery"
                            value="Calculated at checkout"
                            mute
                        />
                        <div className="border-t border-white/5 pt-3 flex justify-between items-baseline">
                            <span className="text-zinc-400">Total</span>
                            <span className="font-display text-2xl">
                                {inr(total)}
                            </span>
                        </div>
                        <button
                            onClick={() => nav("/user/checkout")}
                            className="btn-primary w-full py-3"
                        >
                            Proceed to checkout{" "}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Row({ label, value, mute }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-zinc-400">{label}</span>
            <span className={mute ? "text-zinc-500" : "text-zinc-200"}>
                {value}
            </span>
        </div>
    );
}
