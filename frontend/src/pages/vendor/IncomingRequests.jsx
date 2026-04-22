import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Check, X, Inbox } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";
import { fmtDate, titleCase } from "../../utils/format.js";

const STATUSES = ["", "pending", "accepted", "rejected", "fulfilled"];

export default function IncomingRequests() {
    const qc = useQueryClient();
    const [status, setStatus] = useState("");
    const [responding, setResponding] = useState(null); // {id, status}

    const { data, isLoading } = useQuery({
        queryKey: ["incomingReqs", { status }],
        queryFn: () =>
            api
                .get("/vendor/requests", {
                    params: { status: status || undefined, limit: 50 },
                })
                .then((r) => r.data.data),
    });

    const respond = useMutation({
        mutationFn: ({ id, body }) => api.patch(`/vendor/requests/${id}`, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["incomingReqs"] });
            toast.success("Response sent");
            setResponding(null);
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="h-section">Requests</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Custom enquiries from interested customers.
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
                <Empty
                    title="No requests"
                    subtitle="When customers send a request it'll show up here."
                    icon={Inbox}
                />
            ) : (
                <div className="card divide-y divide-white/5">
                    {data.data.map((r) => (
                        <div key={r._id} className="p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium">
                                        {r.user?.name} ·{" "}
                                        {r.item?.name || "General request"}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {fmtDate(r.createdAt)} · Qty{" "}
                                        {r.quantity} · {r.user?.email}
                                    </p>
                                    {r.message && (
                                        <p className="text-sm text-zinc-300 mt-2">
                                            "{r.message}"
                                        </p>
                                    )}
                                    {r.responseNote && (
                                        <p className="text-sm text-mint-300 mt-1">
                                            ↳ {r.responseNote}
                                        </p>
                                    )}
                                </div>
                                <span className="chip capitalize">
                                    {r.status}
                                </span>
                            </div>
                            {r.status === "pending" && (
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() =>
                                            setResponding({
                                                id: r._id,
                                                status: "accepted",
                                            })
                                        }
                                        className="btn-primary !px-3 !py-2 text-xs"
                                    >
                                        <Check className="w-3.5 h-3.5" /> Accept
                                    </button>
                                    <button
                                        onClick={() =>
                                            setResponding({
                                                id: r._id,
                                                status: "rejected",
                                            })
                                        }
                                        className="btn-danger !px-3 !py-2 text-xs"
                                    >
                                        <X className="w-3.5 h-3.5" /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {responding && (
                <RespondModal
                    onSubmit={(note) =>
                        respond.mutate({
                            id: responding.id,
                            body: {
                                status: responding.status,
                                responseNote: note,
                            },
                        })
                    }
                    onClose={() => setResponding(null)}
                    busy={respond.isPending}
                    action={responding.status}
                />
            )}
        </div>
    );
}

function RespondModal({ onSubmit, onClose, busy, action }) {
    const [note, setNote] = useState("");
    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit(note);
                }}
                onClick={(e) => e.stopPropagation()}
                className="card p-6 w-full max-w-md space-y-4"
            >
                <h3 className="font-display text-lg capitalize">
                    {action} request
                </h3>
                <textarea
                    rows={4}
                    className="input"
                    placeholder="Add a note for the customer (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={busy}
                        className={
                            action === "accepted" ? "btn-primary" : "btn-danger"
                        }
                    >
                        {busy ? "Sending…" : "Confirm"}
                    </button>
                </div>
            </form>
        </div>
    );
}
