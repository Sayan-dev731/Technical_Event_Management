import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Heart, Trash2, ArrowRight } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { CardSkeleton } from "../../components/Loader.jsx";
import { Empty } from "../../components/Empty.jsx";
import { fmtDate } from "../../utils/format.js";

export default function GuestLists() {
    const qc = useQueryClient();
    const [open, setOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["guestLists"],
        queryFn: () => api.get("/user/guest-lists").then((r) => r.data.data),
    });

    const delMut = useMutation({
        mutationFn: (id) => api.delete(`/user/guest-lists/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["guestLists"] });
            toast.success("Deleted");
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="h-section">Guest lists</h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Track RSVPs and notes for every event.
                    </p>
                </div>
                <button onClick={() => setOpen(true)} className="btn-primary">
                    <Plus className="w-4 h-4" /> New list
                </button>
            </div>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            ) : (data?.length || 0) === 0 ? (
                <Empty
                    icon={Heart}
                    title="No guest lists yet"
                    subtitle="Create your first list to start tracking RSVPs."
                    action={
                        <button
                            onClick={() => setOpen(true)}
                            className="btn-primary"
                        >
                            <Plus className="w-4 h-4" /> New list
                        </button>
                    }
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((l) => (
                        <div key={l._id} className="card p-5 group">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-display text-lg truncate">
                                        {l.eventName}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {l.eventDate
                                            ? fmtDate(l.eventDate)
                                            : "Date TBD"}
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        confirm("Delete this list?") &&
                                        delMut.mutate(l._id)
                                    }
                                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-zinc-400 mt-3">
                                {l.guests?.length || 0} guests
                            </p>
                            <Link
                                to={`/user/guest-lists/${l._id}`}
                                className="btn-ghost w-full mt-4 justify-center"
                            >
                                Manage <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {open && <NewModal onClose={() => setOpen(false)} />}
        </div>
    );
}

function NewModal({ onClose }) {
    const qc = useQueryClient();
    const [form, setForm] = useState({
        eventName: "",
        eventDate: "",
        notes: "",
    });
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const body = { eventName: form.eventName, notes: form.notes };
            if (form.eventDate) body.eventDate = form.eventDate;
            await api.post("/user/guest-lists", body);
            qc.invalidateQueries({ queryKey: ["guestLists"] });
            toast.success("List created");
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
                <h3 className="font-display text-lg">New guest list</h3>
                <div>
                    <label className="label">Event name</label>
                    <input
                        required
                        className="input"
                        value={form.eventName}
                        onChange={(e) =>
                            setForm({ ...form, eventName: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label className="label">Event date</label>
                    <input
                        type="date"
                        className="input"
                        value={form.eventDate}
                        onChange={(e) =>
                            setForm({ ...form, eventDate: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label className="label">Notes</label>
                    <textarea
                        rows={3}
                        className="input"
                        value={form.notes}
                        onChange={(e) =>
                            setForm({ ...form, notes: e.target.value })
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
