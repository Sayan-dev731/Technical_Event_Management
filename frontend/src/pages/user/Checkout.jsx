import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { Loader } from "../../components/Loader.jsx";
import { useAuth } from "../../store/auth.js";
import { inr } from "../../utils/format.js";

const PAYMENTS = [
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" },
    { value: "netbanking", label: "Net Banking" },
    { value: "cod", label: "Cash on Delivery" },
    { value: "cash", label: "Cash" },
];

export default function Checkout() {
    const { user } = useAuth();
    const nav = useNavigate();
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["cart"],
        queryFn: () => api.get("/user/cart").then((r) => r.data.data),
    });

    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [shipping, setShipping] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
    });

    const checkoutMut = useMutation({
        mutationFn: () =>
            api.post("/user/checkout", {
                paymentMethod,
                shippingAddress: shipping,
            }),
        onSuccess: (r) => {
            qc.invalidateQueries({ queryKey: ["cart"] });
            qc.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Order placed!");
            nav(`/user/orders/${r.data.data._id}`, { replace: true });
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    if (isLoading) return <Loader />;
    const items = data?.items || [];
    const total = items.reduce(
        (s, l) => s + (l.priceAtAdd || l.item?.price || 0) * l.quantity,
        0,
    );

    if (items.length === 0) {
        nav("/user/cart", { replace: true });
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="h-section">Checkout</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Just a few details and your event essentials are on the way.
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    checkoutMut.mutate();
                }}
                className="grid lg:grid-cols-3 gap-5"
            >
                <div className="lg:col-span-2 space-y-5">
                    <div className="card p-6 space-y-4">
                        <h2 className="font-display text-lg">
                            Shipping address
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field
                                label="Full name"
                                value={shipping.name}
                                onChange={(v) =>
                                    setShipping({ ...shipping, name: v })
                                }
                            />
                            <Field
                                label="Phone"
                                value={shipping.phone}
                                onChange={(v) =>
                                    setShipping({ ...shipping, phone: v })
                                }
                            />
                            <Field
                                label="Email"
                                type="email"
                                value={shipping.email}
                                onChange={(v) =>
                                    setShipping({ ...shipping, email: v })
                                }
                            />
                            <Field
                                label="PIN code"
                                value={shipping.pinCode}
                                onChange={(v) =>
                                    setShipping({ ...shipping, pinCode: v })
                                }
                            />
                            <Field
                                label="City"
                                value={shipping.city}
                                onChange={(v) =>
                                    setShipping({ ...shipping, city: v })
                                }
                            />
                            <Field
                                label="State"
                                value={shipping.state}
                                onChange={(v) =>
                                    setShipping({ ...shipping, state: v })
                                }
                            />
                            <div className="sm:col-span-2">
                                <label className="label">Address</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="input"
                                    value={shipping.address}
                                    onChange={(e) =>
                                        setShipping({
                                            ...shipping,
                                            address: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 space-y-3">
                        <h2 className="font-display text-lg">Payment method</h2>
                        <div className="grid sm:grid-cols-3 gap-2">
                            {PAYMENTS.map((p) => (
                                <button
                                    type="button"
                                    key={p.value}
                                    onClick={() => setPaymentMethod(p.value)}
                                    className={`px-3 py-2 rounded-xl text-sm border transition ${
                                        paymentMethod === p.value
                                            ? "bg-mint-400/10 border-mint-400/40 text-mint-300"
                                            : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300"
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-zinc-500 inline-flex items-center gap-1.5 pt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-mint-400" />
                            Demo gateway — no real charge will be made.
                        </p>
                    </div>
                </div>

                <div className="card p-5 h-fit lg:sticky lg:top-6 space-y-3">
                    <h3 className="font-display text-lg">Summary</h3>
                    <div className="space-y-2 max-h-60 overflow-auto pr-1">
                        {items.map((l) => (
                            <div
                                key={l._id}
                                className="flex justify-between text-sm"
                            >
                                <span className="truncate pr-2">
                                    {l.item?.name} × {l.quantity}
                                </span>
                                <span>
                                    {inr(
                                        (l.priceAtAdd || l.item?.price || 0) *
                                            l.quantity,
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-white/5 pt-3 flex justify-between items-baseline">
                        <span className="text-zinc-400">Total</span>
                        <span className="font-display text-2xl">
                            {inr(total)}
                        </span>
                    </div>
                    <button
                        disabled={checkoutMut.isPending}
                        className="btn-primary w-full py-3"
                    >
                        {checkoutMut.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Place order"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, value, onChange, type = "text" }) {
    return (
        <div>
            <label className="label">{label}</label>
            <input
                required
                type={type}
                className="input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
