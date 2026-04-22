import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";

const ROLES = ["user", "vendor", "admin"];
const CATEGORIES = ["Catering", "Florist", "Decoration", "Lighting"];
const PLANS = [
    { value: "6_months", label: "6 months" },
    { value: "1_year", label: "1 year" },
    { value: "2_years", label: "2 years" },
];

export default function AdminUserForm() {
    const nav = useNavigate();
    const qc = useQueryClient();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        phone: "",
        category: "Catering",
        plan: "6_months",
        amountPaid: 0,
        contactInfo: "",
    });

    const createMut = useMutation({
        mutationFn: () => {
            const body = {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
                phone: form.phone || undefined,
                contactInfo: form.contactInfo || undefined,
            };
            if (form.role === "vendor") {
                body.category = form.category;
                body.plan = form.plan;
                body.amountPaid = Number(form.amountPaid) || 0;
            }
            return api.post("/admin/users", body);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["adminUsers"] });
            toast.success("User created");
            nav("/admin/users");
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    return (
        <div className="max-w-2xl space-y-6">
            <Link
                to="/admin/users"
                className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1.5"
            >
                <ArrowLeft className="w-4 h-4" /> Back to users
            </Link>
            <div>
                <h1 className="h-section">New user</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Provision an account for a user, vendor, or fellow admin.
                </p>
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    createMut.mutate();
                }}
                className="card p-6 space-y-4"
            >
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Role</label>
                        <select
                            className="input capitalize"
                            value={form.role}
                            onChange={(e) =>
                                setForm({ ...form, role: e.target.value })
                            }
                        >
                            {ROLES.map((r) => (
                                <option key={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Name</label>
                        <input
                            required
                            className="input"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className="label">Email</label>
                        <input
                            required
                            type="email"
                            className="input"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className="label">Password</label>
                        <input
                            required
                            type="password"
                            className="input"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
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
                    {form.role === "vendor" && (
                        <>
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
                                    {CATEGORIES.map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Plan</label>
                                <select
                                    className="input"
                                    value={form.plan}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            plan: e.target.value,
                                        })
                                    }
                                >
                                    {PLANS.map((p) => (
                                        <option key={p.value} value={p.value}>
                                            {p.label}
                                        </option>
                                    ))}
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
                                        setForm({
                                            ...form,
                                            amountPaid: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </>
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
                <div className="flex justify-end gap-2">
                    <Link to="/admin/users" className="btn-ghost">
                        Cancel
                    </Link>
                    <button
                        disabled={createMut.isPending}
                        className="btn-primary"
                    >
                        {createMut.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Create user"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
