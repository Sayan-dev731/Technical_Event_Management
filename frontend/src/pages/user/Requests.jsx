import { useQuery } from "@tanstack/react-query";
import { Inbox } from "lucide-react";
import { api } from "../../api/axios.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";
import { fmtDate, titleCase } from "../../utils/format.js";

const STATUS_COLORS = {
    pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    accepted: "border-mint-400/30 bg-mint-400/10 text-mint-300",
    rejected: "border-red-500/30 bg-red-500/10 text-red-300",
    fulfilled: "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

export default function Requests() {
    const { data, isLoading } = useQuery({
        queryKey: ["myRequests"],
        queryFn: () => api.get("/user/requests").then((r) => r.data.data),
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="h-section">My requests</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Custom requests you've sent to vendors.
                </p>
            </div>
            {isLoading ? (
                <div className="space-y-3">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            ) : (data?.length || 0) === 0 ? (
                <Empty
                    title="No requests yet"
                    subtitle="Visit a vendor page to send your first request."
                    icon={Inbox}
                />
            ) : (
                <div className="card divide-y divide-white/5">
                    {data.map((r) => (
                        <div
                            key={r._id}
                            className="p-4 flex items-start justify-between gap-3"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="font-medium">
                                    {r.vendor?.name}
                                    {r.item ? ` · ${r.item?.name}` : ""}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {fmtDate(r.createdAt)} · Qty {r.quantity}
                                </p>
                                {r.message && (
                                    <p className="text-sm text-zinc-400 mt-2">
                                        "{r.message}"
                                    </p>
                                )}
                                {r.responseNote && (
                                    <p className="text-sm text-mint-300 mt-2">
                                        ↳ {r.responseNote}
                                    </p>
                                )}
                            </div>
                            <span
                                className={`chip ${STATUS_COLORS[r.status] || ""}`}
                            >
                                {titleCase(r.status)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
