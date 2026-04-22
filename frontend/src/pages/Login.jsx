import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../store/auth.js";
import { apiMessage } from "../api/axios.js";
import { AuthShell } from "../components/AuthShell.jsx";

const ROLES = [
    { value: "user", label: "User" },
    { value: "vendor", label: "Vendor" },
    { value: "admin", label: "Admin" },
];

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const [form, setForm] = useState({ email: "", password: "", role: "user" });
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const u = await login(form);
            toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
            const to = loc.state?.from || `/${u.role}`;
            nav(to, { replace: true });
        } catch (err) {
            toast.error(apiMessage(err, "Could not sign in"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to continue planning brilliantly."
            footer={
                <>
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-mint-400 hover:text-mint-300"
                    >
                        Create one
                    </Link>
                </>
            }
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="label">I am a</label>
                    <div className="grid grid-cols-3 gap-2">
                        {ROLES.map((r) => (
                            <button
                                type="button"
                                key={r.value}
                                onClick={() =>
                                    setForm({ ...form, role: r.value })
                                }
                                className={`px-3 py-2 rounded-xl text-sm border transition ${
                                    form.role === r.value
                                        ? "bg-mint-400/10 border-mint-400/40 text-mint-300"
                                        : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
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
                    <div className="relative">
                        <input
                            type={show ? "text" : "password"}
                            required
                            className="input pr-12"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />
                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-white"
                        >
                            {show ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Link
                        to="/forgot-password"
                        className="text-xs text-zinc-400 hover:text-mint-300"
                    >
                        Forgot password?
                    </Link>
                </div>

                <button disabled={busy} className="btn-primary w-full py-3">
                    {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "Sign in"
                    )}
                </button>
            </form>
        </AuthShell>
    );
}
