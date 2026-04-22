import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { Loader } from "../../components/Loader.jsx";
import { fmtDate } from "../../utils/format.js";

const RSVP = ["pending", "yes", "no", "maybe"];

export default function GuestListDetail() {
    const { id } = useParams();
    const qc = useQueryClient();
    const { data: list, isLoading } = useQuery({
        queryKey: ["guestList", id],
        queryFn: () =>
            api.get(`/user/guest-lists/${id}`).then((r) => r.data.data),
    });

    const [form, setForm] = useState({
        eventName: "",
        eventDate: "",
        notes: "",
        guests: [],
    });
    useEffect(() => {
        if (list)
            setForm({
                eventName: list.eventName || "",
                eventDate: list.eventDate ? list.eventDate.slice(0, 10) : "",
                notes: list.notes || "",
                guests: list.guests || [],
            });
    }, [list]);

    const saveMut = useMutation({
        mutationFn: (body) => api.patch(`/user/guest-lists/${id}`, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["guestList", id] });
            toast.success("Saved");
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    if (isLoading) return <Loader />;
    if (!list) return null;

    const updateGuest = (i, patch) => {
        const guests = [...form.guests];
        guests[i] = { ...guests[i], ...patch };
        setForm({ ...form, guests });
    };
    const removeGuest = (i) =>
        setForm({ ...form, guests: form.guests.filter((_, x) => x !== i) });
    const addGuest = () =>
        setForm({
            ...form,
            guests: [
                ...form.guests,
                { name: "", email: "", phone: "", rsvp: "pending" },
            ],
        });

    const onSave = () => {
        const body = {
            eventName: form.eventName,
            notes: form.notes,
            guests: form.guests,
        };
        if (form.eventDate) body.eventDate = form.eventDate;
        saveMut.mutate(body);
    };

    const counts = form.guests.reduce(
        (a, g) => ((a[g.rsvp] = (a[g.rsvp] || 0) + 1), a),
        {},
    );

    return (
        <div className="space-y-6">
            <Link
                to="/user/guest-lists"
                className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1.5"
            >
                <ArrowLeft className="w-4 h-4" /> Back to lists
            </Link>

            <div className="card p-6 grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-4">
                    <div>
                        <label className="label">Event name</label>
                        <input
                            className="input"
                            value={form.eventName}
                            onChange={(e) =>
                                setForm({ ...form, eventName: e.target.value })
                            }
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Date</label>
                            <input
                                type="date"
                                className="input"
                                value={form.eventDate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        eventDate: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label className="label">Notes</label>
                            <input
                                className="input"
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                        Stats
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {RSVP.map((r) => (
                            <div key={r} className="rounded-xl bg-white/5 p-3">
                                <p className="text-xs text-zinc-400 capitalize">
                                    {r}
                                </p>
                                <p className="font-display text-xl">
                                    {counts[r] || 0}
                                </p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-zinc-500">
                        Created {fmtDate(list.createdAt)}
                    </p>
                </div>
            </div>

            <div className="card divide-y divide-white/5">
                <div className="p-4 flex items-center justify-between">
                    <h3 className="font-display text-lg">
                        Guests ({form.guests.length})
                    </h3>
                    <button onClick={addGuest} className="btn-ghost">
                        <Plus className="w-4 h-4" /> Add guest
                    </button>
                </div>
                {form.guests.map((g, i) => (
                    <div
                        key={i}
                        className="p-4 grid sm:grid-cols-12 gap-3 items-center"
                    >
                        <input
                            className="input sm:col-span-3"
                            placeholder="Name"
                            value={g.name}
                            onChange={(e) =>
                                updateGuest(i, { name: e.target.value })
                            }
                        />
                        <input
                            className="input sm:col-span-3"
                            placeholder="Email"
                            value={g.email || ""}
                            onChange={(e) =>
                                updateGuest(i, { email: e.target.value })
                            }
                        />
                        <input
                            className="input sm:col-span-3"
                            placeholder="Phone"
                            value={g.phone || ""}
                            onChange={(e) =>
                                updateGuest(i, { phone: e.target.value })
                            }
                        />
                        <select
                            className="input sm:col-span-2 capitalize"
                            value={g.rsvp || "pending"}
                            onChange={(e) =>
                                updateGuest(i, { rsvp: e.target.value })
                            }
                        >
                            {RSVP.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => removeGuest(i)}
                            className="btn-ghost text-red-300 sm:col-span-1 justify-self-end"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {form.guests.length === 0 && (
                    <div className="p-6 text-center text-sm text-zinc-500">
                        No guests yet — add one to get started.
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onSave}
                    className="btn-primary"
                    disabled={saveMut.isPending}
                >
                    <Save className="w-4 h-4" /> Save changes
                </button>
            </div>
        </div>
    );
}
