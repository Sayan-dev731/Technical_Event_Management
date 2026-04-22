import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "../store/auth.js";
import { apiMessage } from "../api/axios.js";
import { AuthShell } from "../components/AuthShell.jsx";

const VENDOR_CATEGORIES = ["Catering", "Florist", "Decoration", "Lighting"];
const PLANS = [
    { value: "6_months", label: "6 Months" },
    { value: "1_year", label: "1 Year" },
    { value: "2_years", label: "2 Years" },
];

export default function Signup() {
    const { signup } = useAuth();
    const nav = useNavigate();
    const [role, setRole] = useState("user");
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        category: "Catering",
        plan: "6_months",
    });
    const [busy, setBusy] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
            };
            if (role === "vendor") {
                payload.category = form.category;
                payload.plan = form.plan;
            }
            await signup(role, payload);
            toast.success("Account created — please verify your email.");
            nav("/login", { replace: true });
        } catch (err) {
            toast.error(apiMessage(err, "Could not create account"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            title="Create your account"
            subtitle="Pick the role that fits — you can have separate accounts per role."
            footer={
                <>
                    Already on Eventide?{" "}
                    <Link
                        to="/login"
                        className="text-mint-400 hover:text-mint-300"
                    >
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="label">Sign up as</label>
                    <div className="grid grid-cols-2 gap-2">
                        {["user", "vendor"].map((r) => (
                            <button
                                type="button"
                                key={r}
                                onClick={() => setRole(r)}
                                className={`px-3 py-2 rounded-xl text-sm border capitalize transition ${
                                    role === r
                                        ? "bg-mint-400/10 border-mint-400/40 text-mint-300"
                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="label">Full name</label>
                    <input
                        required
                        className="input"
                        placeholder="Jane Doe"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label className="label">Email</label>
                    <input
                        type="email"
                        required
                        className="input"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label className="label">Password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        className="input"
                        placeholder="At least 6 characters"
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />
                </div>

                {role === "vendor" && (
                    <div className="grid grid-cols-2 gap-3">
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
                                {VENDOR_CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
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
                                {PLANS.map((p) => (
                                    <option key={p.value} value={p.value}>
                                        {p.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <button disabled={busy} className="btn-primary w-full py-3">
                    {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "Create account"
                    )}
                </button>
            </form>
        </AuthShell>
    );
}
