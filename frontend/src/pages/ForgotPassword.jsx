import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { api, apiMessage } from "../api/axios.js";
import { AuthShell } from "../components/AuthShell.jsx";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
            toast.success("Check your inbox for a reset link");
        } catch (err) {
            toast.error(apiMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell
            title="Reset your password"
            subtitle="We'll email you a link to choose a new password."
            footer={
                <Link to="/login" className="text-mint-400 hover:text-mint-300">
                    Back to sign in
                </Link>
            }
        >
            {sent ? (
                <p className="text-sm text-zinc-300">
                    If an account exists for{" "}
                    <span className="text-white">{email}</span>, you'll receive
                    a reset link shortly.
                </p>
            ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            required
                            className="input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button disabled={busy} className="btn-primary w-full py-3">
                        {busy ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Send reset link"
                        )}
                    </button>
                </form>
            )}
        </AuthShell>
    );
}
