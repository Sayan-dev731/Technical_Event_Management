import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Boxes } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";
import { inr, titleCase } from "../../utils/format.js";

const STATUSES = ["", "available", "out_of_stock", "discontinued"];

export default function MyItems() {
    const qc = useQueryClient();
    const [status, setStatus] = useState("");
    const { data, isLoading } = useQuery({
        queryKey: ["myItems", { status }],
        queryFn: () =>
            api
                .get("/vendor/items", {
                    params: { status: status || undefined, limit: 50 },
                })
                .then((r) => r.data.data),
    });
    const delMut = useMutation({
        mutationFn: (id) => api.delete(`/vendor/items/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["myItems"] });
            toast.success("Item deleted");
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="h-section">My items</h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Manage your catalog and visibility.
                    </p>
                </div>
                <Link to="/vendor/items/new" className="btn-primary">
                    <Plus className="w-4 h-4" /> New item
                </Link>
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (data?.data?.length || 0) === 0 ? (
                <Empty
                    icon={Boxes}
                    title="No items yet"
                    subtitle="Create your first item to start selling."
                    action={
                        <Link to="/vendor/items/new" className="btn-primary">
                            <Plus className="w-4 h-4" /> New item
                        </Link>
                    }
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.data.map((it) => (
                        <div key={it._id} className="card p-4">
                            <div className="aspect-[4/3] rounded-xl bg-ink-800 overflow-hidden mb-3">
                                {it.image ? (
                                    <img
                                        src={it.image}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-xs text-zinc-600">
                                        No image
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="font-medium truncate">
                                    {it.name}
                                </p>
                                <span className="chip">
                                    {titleCase(it.status)}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                {it.category} · Stock {it.stock}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-mint-300 font-semibold">
                                    {inr(it.price)}
                                </span>
                                <div className="flex gap-1">
                                    <Link
                                        to={`/vendor/items/${it._id}/edit`}
                                        className="btn-ghost !px-2.5 !py-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() =>
                                            confirm("Delete this item?") &&
                                            delMut.mutate(it._id)
                                        }
                                        className="btn-ghost !px-2.5 !py-2 text-red-300 hover:text-red-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
