import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Search, Boxes } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";
import { inr } from "../../utils/format.js";

const CATEGORIES = ["", "Catering", "Florist", "Decoration", "Lighting"];

export default function Items() {
    const [q, setQ] = useState("");
    const [category, setCategory] = useState("");
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["items", { q, category }],
        queryFn: () =>
            api
                .get("/user/items", {
                    params: {
                        q: q || undefined,
                        category: category || undefined,
                        limit: 30,
                    },
                })
                .then((r) => r.data.data),
    });

    const addMut = useMutation({
        mutationFn: (itemId) => api.post("/user/cart", { itemId, quantity: 1 }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["cart"] });
            toast.success("Added to cart");
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="h-section">Browse Items</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Pick what you love. Add to cart and check out anytime.
                </p>
            </div>

            <div className="card p-3 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        className="input pl-9"
                        placeholder="Search items…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c || "all"}
                            onClick={() => setCategory(c)}
                            className={`px-3 py-2 rounded-xl text-sm border transition ${
                                category === c
                                    ? "bg-mint-400/10 border-mint-400/40 text-mint-300"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300"
                            }`}
                        >
                            {c || "All"}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (data?.data?.length || 0) === 0 ? (
                <Empty
                    title="No items found"
                    icon={Boxes}
                    subtitle="Try a different category or search term."
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.data.map((it) => (
                        <div key={it._id} className="card p-4 flex flex-col">
                            <div className="aspect-square rounded-xl bg-ink-800 overflow-hidden mb-3">
                                {it.image ? (
                                    <img
                                        src={it.image}
                                        className="w-full h-full object-cover"
                                        alt={it.name}
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-zinc-600 text-xs">
                                        No image
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-medium truncate">
                                    {it.name}
                                </p>
                                <span className="chip">{it.category}</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                By {it.vendor?.name}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-mint-300 font-semibold">
                                    {inr(it.price)}
                                </span>
                                <button
                                    onClick={() => addMut.mutate(it._id)}
                                    className="btn-primary !px-3 !py-2 text-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
