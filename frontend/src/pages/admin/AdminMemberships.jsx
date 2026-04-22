import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, BadgeCheck, RefreshCw, X } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";
import { fmtDate, inr, titleCase } from "../../utils/format.js";

const STATUSES = ["", "active", "expired", "cancelled"];
const PLANS = ["", "6_months", "1_year", "2_years"];
const PLAN_LABELS = {
    "6_months": "6 months",
    "1_year": "1 year",
    "2_years": "2 years",
};

export default function AdminMemberships() {
    const qc = useQueryClient();
    const [status, setStatus] = useState("");
    const [plan, setPlan] = useState("");
    const [openNew, setOpenNew] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["memberships", { status, plan }],
        queryFn: () =>
            api
                .get("/admin/memberships", {
                    params: {
                        status: status || undefined,
                        plan: plan || undefined,
                        limit: 50,
                    },
                })
                .then((r) => r.data.data),
    });

    const actionMut = useMutation({
        mutationFn: (body) => api.patch("/admin/memberships", body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["memberships"] });
            toast.success("Updated");
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="h-section">Memberships</h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Vendor subscriptions &amp; renewals.
                    </p>
                </div>
                <button
                    onClick={() => setOpenNew(true)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" /> New membership
                </button>
            </div>

            <div className="card p-3 grid sm:grid-cols-2 gap-3">
                <select
                    className="input capitalize"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    {STATUSES.map((s) => (
                        <option key={s || "all"} value={s}>
                            {s ? titleCase(s) : "All status"}
                        </option>
                    ))}
                </select>
                <select
                    className="input"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                >
                    {PLANS.map((p) => (
                        <option key={p || "all"} value={p}>
                            {p ? PLAN_LABELS[p] : "All plans"}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <CardSkeleton />
            ) : (data?.data?.length || 0) === 0 ? (
                <Empty title="No memberships" icon={BadgeCheck} />
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-xs uppercase tracking-wider text-zinc-400">
                            <tr>
                                <th className="text-left p-3">Vendor</th>
                                <th className="text-left p-3 hidden md:table-cell">
                                    Number
                                </th>
                                <th className="text-left p-3">Plan</th>
                                <th className="text-left p-3 hidden sm:table-cell">
                                    Period
                                </th>
                                <th className="text-left p-3">Status</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.data.map((m) => (
                                <tr
                                    key={m._id}
                                    className="hover:bg-white/[0.03]"
                                >
                                    <td className="p-3">
                                        <div className="font-medium">
                                            {m.vendor?.name}
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                            {m.vendor?.email}
                                        </div>
                                    </td>
                                    <td className="p-3 hidden md:table-cell font-mono text-xs text-zinc-400">
                                        {m.membershipNumber}
                                    </td>
                                    <td className="p-3">
                                        {PLAN_LABELS[m.plan] || m.plan}
                                    </td>
                                    <td className="p-3 hidden sm:table-cell text-zinc-400 text-xs">
                                        {fmtDate(m.startDate)} →{" "}
                                        {fmtDate(m.endDate)}
                                    </td>
                                    <td className="p-3">
                                        <span className="chip capitalize">
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        {m.status === "active" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        actionMut.mutate({
                                                            membershipNumber:
                                                                m.membershipNumber,
                                                            action: "extend",
                                                            plan: m.plan,
                                                        })
                                                    }
                                                    className="btn-ghost !px-2.5 !py-2 mr-1"
                                                    title="Extend"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        confirm(
                                                            "Cancel membership?",
                                                        ) &&
                                                        actionMut.mutate({
                                                            membershipNumber:
                                                                m.membershipNumber,
                                                            action: "cancel",
                                                        })
                                                    }
                                                    className="btn-ghost !px-2.5 !py-2 text-red-300 hover:text-red-200"
                                                    title="Cancel"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {openNew && <NewModal onClose={() => setOpenNew(false)} />}
        </div>
    );
}

function NewModal({ onClose }) {
    const qc = useQueryClient();
    const [form, setForm] = useState({
        vendorId: "",
        plan: "6_months",
        amountPaid: 0,
    });
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await api.post("/admin/memberships", {
                ...form,
                amountPaid: Number(form.amountPaid) || 0,
            });
            qc.invalidateQueries({ queryKey: ["memberships"] });
            toast.success("Membership created");
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
                <h3 className="font-display text-lg">New membership</h3>
                <div>
                    <label className="label">Vendor ID</label>
                    <input
                        required
                        className="input font-mono text-sm"
                        value={form.vendorId}
                        onChange={(e) =>
                            setForm({ ...form, vendorId: e.target.value })
                        }
                    />
                    <p className="text-[11px] text-zinc-500 mt-1">
                        Tip: copy from Users → Vendor row.
                    </p>
                </div>
                <div>
                    <label className="label">Plan</label>
                    <select
                        className="input"
                        value={form.plan}
                        onChange={(e) =>
                            setForm({ ...form, plan: e.target.value })
                        }
                    >
                        <option value="6_months">6 months</option>
                        <option value="1_year">1 year</option>
                        <option value="2_years">2 years</option>
                    </select>
                </div>
                <div>
                    <label className="label">Amount paid (₹)</label>
                    <input
                        type="number"
                        min={0}
                        className="input"
                        value={form.amountPaid}
                        onChange={(e) =>
                            setForm({ ...form, amountPaid: e.target.value })
                        }
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
                        {busy ? "Creating…" : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
}
