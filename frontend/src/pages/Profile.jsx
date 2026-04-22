import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Loader2, Save, KeyRound } from "lucide-react";
import { api, apiMessage } from "../api/axios.js";
import { useAuth } from "../store/auth.js";
import { initials } from "../utils/format.js";

const VENDOR_CATEGORIES = ["Catering", "Florist", "Decoration", "Lighting"];

export default function Profile() {
    const { user, refreshMe } = useAuth();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        contactInfo: "",
        category: "",
    });
    const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
    const [busy, setBusy] = useState(false);
    const [pwBusy, setPwBusy] = useState(false);
    const [avatarBusy, setAvatarBusy] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                phone: user.phone || "",
                contactInfo: user.contactInfo || "",
                category: user.category || "Catering",
            });
        }
    }, [user]);

    const save = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const body = {
                name: form.name,
                phone: form.phone,
                contactInfo: form.contactInfo,
            };
            if (user.role === "vendor") body.category = form.category;
            await api.patch("/auth/me", body);
            await refreshMe();
            toast.success("Profile updated");
        } catch (err) {
            toast.error(apiMessage(err));
        } finally {
            setBusy(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setPwBusy(true);
        try {
            await api.post("/auth/change-password", pw);
            toast.success("Password updated. You may need to sign in again.");
            setPw({ currentPassword: "", newPassword: "" });
        } catch (err) {
            toast.error(apiMessage(err));
        } finally {
            setPwBusy(false);
        }
    };

    const onAvatar = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("avatar", file);
        setAvatarBusy(true);
        try {
            await api.patch("/auth/me/avatar", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await refreshMe();
            toast.success("Avatar updated");
        } catch (err) {
            toast.error(apiMessage(err));
        } finally {
            setAvatarBusy(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="h-section">Profile</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Manage how others see you on Eventide.
                </p>
            </div>

            <div className="card p-6 flex items-center gap-5">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mint-400 to-mint-700 grid place-items-center text-ink-950 font-bold text-xl overflow-hidden">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            initials(user.name)
                        )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-ink-800 border border-white/10 grid place-items-center cursor-pointer hover:bg-ink-700">
                        {avatarBusy ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Camera className="w-4 h-4" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onAvatar}
                        />
                    </label>
                </div>
                <div className="min-w-0">
                    <p className="font-display text-xl font-semibold truncate">
                        {user.name}
                    </p>
                    <p className="text-sm text-zinc-400 truncate">
                        {user.email}
                    </p>
                    <p className="chip-mint mt-2 capitalize">{user.role}</p>
                </div>
            </div>

            <form onSubmit={save} className="card p-6 space-y-4">
                <h2 className="font-display text-lg">Personal info</h2>
                <div className="grid sm:grid-cols-2 gap-4">
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
                                {VENDOR_CATEGORIES.map((c) => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="sm:col-span-2">
                        <label className="label">Contact info</label>
                        <textarea
                            rows={3}
                            className="input"
                            value={form.contactInfo}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    contactInfo: e.target.value,
                                })
                            }
                            placeholder="Address, working hours, anything customers should know…"
                        />
                    </div>
                </div>
                <button disabled={busy} className="btn-primary">
                    {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}{" "}
                    Save changes
                </button>
            </form>

            <form onSubmit={changePassword} className="card p-6 space-y-4">
                <h2 className="font-display text-lg flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-mint-400" /> Change
                    password
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Current password</label>
                        <input
                            type="password"
                            required
                            className="input"
                            value={pw.currentPassword}
                            onChange={(e) =>
                                setPw({
                                    ...pw,
                                    currentPassword: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="label">New password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="input"
                            value={pw.newPassword}
                            onChange={(e) =>
                                setPw({ ...pw, newPassword: e.target.value })
                            }
                        />
                    </div>
                </div>
                <button disabled={pwBusy} className="btn-ghost">
                    {pwBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}{" "}
                    Update password
                </button>
            </form>
        </div>
    );
}
