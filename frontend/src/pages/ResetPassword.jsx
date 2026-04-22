import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { api, apiMessage } from "../api/axios.js";
import { AuthShell } from "../components/AuthShell.jsx";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get("token") || "";
    const nav = useNavigate();
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Missing reset token");
        setBusy(true);
        try {
            await api.post("/auth/reset-password", { token, password });
            toast.success("Password updated. Please sign in.");
            nav("/login", { replace: true });
        } catch (err) {
            toast.error(apiMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            title="Choose a new password"
            footer={
                <Link to="/login" className="text-mint-400 hover:text-mint-300">
                    Back to sign in
                </Link>
            }
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="label">New password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        className="input"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button disabled={busy} className="btn-primary w-full py-3">
                    {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        "Reset password"
                    )}
                </button>
            </form>
        </AuthShell>
    );
}
