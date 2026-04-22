import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Store } from "lucide-react";
import { api } from "../../api/axios.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";

const CATEGORIES = ["", "Catering", "Florist", "Decoration", "Lighting"];

export default function Vendors() {
    const [q, setQ] = useState("");
    const [category, setCategory] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["vendors", { q, category }],
        queryFn: () =>
            api
                .get("/user/vendors", {
                    params: {
                        q: q || undefined,
                        category: category || undefined,
                        limit: 24,
                    },
                })
                .then((r) => r.data.data),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="h-section">Vendors</h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Discover trusted partners for every part of your event.
                    </p>
                </div>
            </div>

            <div className="card p-3 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        className="input pl-9"
                        placeholder="Search vendors…"
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (data?.data?.length || 0) === 0 ? (
                <Empty
                    title="No vendors found"
                    subtitle="Try a different category or search."
                    icon={Store}
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.data.map((v) => (
                        <Link
                            key={v._id}
                            to={`/user/vendors/${v._id}`}
                            className="card p-5 hover:bg-white/[0.05] transition group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-700 grid place-items-center text-ink-950 font-bold text-lg overflow-hidden">
                                    {v.avatar ? (
                                        <img
                                            src={v.avatar}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    ) : (
                                        v.name?.[0]
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-display text-lg truncate">
                                        {v.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {v.category}
                                    </p>
                                    {v.contactInfo && (
                                        <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                                            {v.contactInfo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
