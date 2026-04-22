import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, MailCheck, MailWarning } from "lucide-react";
import { api, apiMessage } from "../api/axios.js";
import { AuthShell } from "../components/AuthShell.jsx";

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const [state, setState] = useState({
        loading: !!token,
        ok: false,
        error: "",
    });

    useEffect(() => {
        if (!token) return;
        api.post("/auth/verify-email", { token })
            .then(() => setState({ loading: false, ok: true, error: "" }))
            .catch((err) =>
                setState({ loading: false, ok: false, error: apiMessage(err) }),
            );
    }, [token]);

    return (
        <AuthShell title="Verify your email">
            {!token ? (
                <p className="text-sm text-zinc-400">
                    Open the link from the email we sent you to confirm your
                    address.
                </p>
            ) : state.loading ? (
                <div className="flex items-center gap-3 text-zinc-300">
                    <Loader2 className="w-5 h-5 animate-spin text-mint-400" />
                    Verifying your email…
                </div>
            ) : state.ok ? (
                <div>
                    <MailCheck className="w-10 h-10 text-mint-400 mb-3" />
                    <p className="font-medium">Email verified successfully</p>
                    <p className="text-sm text-zinc-400 mt-1">
                        You can now sign in to your account.
                    </p>
                    <Link
                        to="/login"
                        className="btn-primary mt-5 w-full justify-center"
                    >
                        Continue
                    </Link>
                </div>
            ) : (
                <div>
                    <MailWarning className="w-10 h-10 text-red-400 mb-3" />
                    <p className="font-medium">Verification failed</p>
                    <p className="text-sm text-zinc-400 mt-1">{state.error}</p>
                </div>
            )}
        </AuthShell>
    );
}
