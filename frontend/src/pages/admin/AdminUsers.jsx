import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Search, Trash2, Edit, Users, Copy, Check } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";
import { fmtDate, titleCase } from "../../utils/format.js";

const ROLES = ["", "user", "vendor", "admin"];

export default function AdminUsers() {
    const qc = useQueryClient();
    const [q, setQ] = useState("");
    const [role, setRole] = useState("");
    const [active, setActive] = useState("");
    const [editing, setEditing] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["adminUsers", { q, role, active }],
        queryFn: () =>
            api
                .get("/admin/users", {
                    params: {
                        q: q || undefined,
                        role: role || undefined,
                        isActive: active === "" ? undefined : active,
                        limit: 50,
                    },
                })
                .then((r) => r.data.data),
    });

    const delMut = useMutation({
        mutationFn: (id) => api.delete(`/admin/users/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["adminUsers"] });
            toast.success("User deleted");
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="h-section">Users</h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Manage everyone on Eventide.
                    </p>
                </div>
                <Link to="/admin/users/new" className="btn-primary">
                    <Plus className="w-4 h-4" /> New user
                </Link>
            </div>

            <div className="card p-3 grid sm:grid-cols-4 gap-3">
                <div className="relative sm:col-span-2">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        className="input pl-9"
                        placeholder="Search name or email…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
                <select
                    className="input capitalize"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    {ROLES.map((r) => (
                        <option key={r || "all"} value={r}>
                            {r ? titleCase(r) : "All roles"}
                        </option>
                    ))}
                </select>
                <select
                    className="input"
                    value={active}
                    onChange={(e) => setActive(e.target.value)}
                >
                    <option value="">All status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {isLoading ? (
                <CardSkeleton />
            ) : (data?.data?.length || 0) === 0 ? (
                <Empty title="No users match" icon={Users} />
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-xs uppercase tracking-wider text-zinc-400">
                            <tr>
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3 hidden sm:table-cell">
                                    Email
                                </th>
                                <th className="text-left p-3">Role</th>
                                <th className="text-left p-3 hidden md:table-cell">
                                    Joined
                                </th>
                                <th className="text-left p-3">Status</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.data.map((u) => (
                                <tr
                                    key={u._id}
                                    className="hover:bg-white/[0.03]"
                                >
                                    <td className="p-3">
                                        <div className="font-medium">
                                            {u.name}
                                        </div>
                                        <div className="text-xs text-zinc-500 sm:hidden">
                                            {u.email}
                                        </div>
                                    </td>
                                    <td className="p-3 hidden sm:table-cell text-zinc-400">
                                        {u.email}
                                    </td>
                                    <td className="p-3">
                                        <span className="chip capitalize">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-3 text-zinc-400 hidden md:table-cell">
                                        {fmtDate(u.createdAt)}
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`chip ${u.isActive ? "chip-mint" : "border-red-500/30 bg-red-500/10 text-red-300"}`}
                                        >
                                            {u.isActive ? "Active" : "Disabled"}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        {u.role === "vendor" && (
                                            <CopyIdButton id={u._id} />
                                        )}
                                        <button
                                            onClick={() => setEditing(u)}
                                            className="btn-ghost !px-2.5 !py-2 mr-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                confirm("Delete this user?") &&
                                                delMut.mutate(u._id)
                                            }
                                            className="btn-ghost !px-2.5 !py-2 text-red-300 hover:text-red-200"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <EditModal user={editing} onClose={() => setEditing(null)} />
            )}
        </div>
    );
}

function CopyIdButton({ id }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <button
            onClick={copy}
            className="btn-ghost !px-2.5 !py-2 mr-1"
            title={copied ? "Copied!" : "Copy vendor ID"}
        >
            {copied ? (
                <Check className="w-4 h-4 text-mint-400" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
        </button>
    );
}

function EditModal({ user, onClose }) {
    const qc = useQueryClient();
    const [form, setForm] = useState({
        name: user.name || "",
        phone: user.phone || "",
        category: user.category || "",
        contactInfo: user.contactInfo || "",
        isActive: user.isActive,
        isVerified: user.isVerified,
    });
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await api.patch(`/admin/users/${user._id}`, form);
            qc.invalidateQueries({ queryKey: ["adminUsers"] });
            toast.success("Updated");
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
                onSubmit={submit}
                onClick={(e) => e.stopPropagation()}
                className="card p-6 w-full max-w-lg space-y-4"
            >
                <h3 className="font-display text-lg">Edit {user.name}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label className="label">Name</label>
                        <input
                            className="input"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className="label">Phone</label>
                        <input
                            className="input"
                            value={form.phone}
                            onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                            }
                        />
                    </div>
                    {user.role === "vendor" && (
                        <div>
                            <label className="label">Category</label>
                            <select
                                className="input"
                                value={form.category}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        category: e.target.value,
                                    })
                                }
                            >
                                <option value="">—</option>
                                <option>Catering</option>
                                <option>Florist</option>
                                <option>Decoration</option>
                                <option>Lighting</option>
                            </select>
                        </div>
                    )}
                    <div className="sm:col-span-2">
                        <label className="label">Contact info</label>
                        <textarea
                            rows={2}
                            className="input"
                            value={form.contactInfo}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    contactInfo: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) =>
                                setForm({ ...form, isActive: e.target.checked })
                            }
                        />
                        Active
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.isVerified}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    isVerified: e.target.checked,
                                })
                            }
                        />
                        Verified
                    </label>
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
                        {busy ? "Saving…" : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}
