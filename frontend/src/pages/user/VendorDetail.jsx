import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Send, Phone, Mail } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { Loader } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";
import { inr } from "../../utils/format.js";

export default function VendorDetail() {
    const { id } = useParams();
    const qc = useQueryClient();
    const [reqOpen, setReqOpen] = useState(null); // item id

    const { data, isLoading } = useQuery({
        queryKey: ["vendor", id],
        queryFn: () => api.get(`/user/vendors/${id}`).then((r) => r.data.data),
    });

    const addMut = useMutation({
        mutationFn: (itemId) => api.post("/user/cart", { itemId, quantity: 1 }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Added to cart");
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    if (isLoading) return <Loader />;
    if (!data) return null;
    const { vendor, items } = data;

    return (
        <div className="space-y-6">
            <Link
                to="/user/vendors"
                className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1.5"
            >
                <ArrowLeft className="w-4 h-4" /> Back to vendors
            </Link>

            <div className="card p-6 flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-700 grid place-items-center text-ink-950 font-bold text-2xl overflow-hidden">
                    {vendor.avatar ? (
                        <img
                            src={vendor.avatar}
                            className="w-full h-full object-cover"
                            alt=""
                        />
                    ) : (
                        vendor.name?.[0]
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="font-display text-2xl font-semibold">
                            {vendor.name}
                        </h1>
                        <span className="chip-mint">{vendor.category}</span>
                    </div>
                    {vendor.contactInfo && (
                        <p className="text-sm text-zinc-400 mt-2">
                            {vendor.contactInfo}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-zinc-400">
                        {vendor.email && (
                            <span className="inline-flex items-center gap-1.5">
                                <Mail className="w-4 h-4" />
                                {vendor.email}
                            </span>
                        )}
                        {vendor.phone && (
                            <span className="inline-flex items-center gap-1.5">
                                <Phone className="w-4 h-4" />
                                {vendor.phone}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <h2 className="font-display text-xl">Catalog</h2>
            {items.length === 0 ? (
                <Empty
                    title="No items yet"
                    subtitle="This vendor hasn't published items yet."
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((it) => (
                        <div key={it._id} className="card p-4 flex flex-col">
                            <div className="aspect-[4/3] rounded-xl bg-ink-800 overflow-hidden mb-3">
                                {it.image ? (
                                    <img
                                        src={it.image}
                                        alt={it.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-zinc-600 text-xs">
                                        No image
                                    </div>
                                )}
                            </div>
                            <p className="font-medium">{it.name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                                {it.description || "—"}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-4">
                                <span className="text-mint-300 font-semibold">
                                    {inr(it.price)}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setReqOpen(it._id)}
                                        className="btn-ghost !px-3 !py-2 text-xs"
                                        title="Send request"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => addMut.mutate(it._id)}
                                        className="btn-primary !px-3 !py-2 text-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {reqOpen && (
                <RequestModal
                    vendorId={vendor._id}
                    itemId={reqOpen}
                    onClose={() => setReqOpen(null)}
                />
            )}
        </div>
    );
}

function RequestModal({ vendorId, itemId, onClose }) {
    const [message, setMessage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await api.post("/user/requests", {
                vendorId,
                itemId,
                message,
                quantity,
            });
            toast.success("Request sent to vendor");
            onClose();
        } catch (err) {
            toast.error(apiMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={submit}
                className="card p-6 w-full max-w-md space-y-4"
            >
                <h3 className="font-display text-lg">Send request</h3>
                <div>
                    <label className="label">Quantity</label>
                    <input
                        type="number"
                        min={1}
                        className="input"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label className="label">Message</label>
                    <textarea
                        rows={4}
                        className="input"
                        placeholder="Special requirements, dates, customisation…"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost"
                    >
                        Cancel
                    </button>
                    <button disabled={busy} className="btn-primary">
                        {busy ? "Sending…" : "Send request"}
                    </button>
                </div>
            </form>
        </div>
    );
}
