import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import { api, apiMessage } from "../../api/axios.js";
import { Loader } from "../../components/Loader.jsx";

const CATEGORIES = ["Catering", "Florist", "Decoration", "Lighting"];
const STATUSES = ["available", "out_of_stock", "discontinued"];

export default function ItemForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const nav = useNavigate();
    const qc = useQueryClient();

    const { data: existing, isLoading } = useQuery({
        queryKey: ["myItem", id],
        queryFn: () => api.get(`/vendor/items/${id}`).then((r) => r.data.data),
        enabled: isEdit,
    });

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "Catering",
        price: 0,
        stock: 0,
        status: "available",
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");

    useEffect(() => {
        if (existing) {
            setForm({
                name: existing.name,
                description: existing.description || "",
                category: existing.category,
                price: existing.price,
                stock: existing.stock,
                status: existing.status,
            });
            setPreview(existing.image || "");
        }
    }, [existing]);

    const onFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const submitMut = useMutation({
        mutationFn: () => {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (file) fd.append("image", file);
            return isEdit
                ? api.patch(`/vendor/items/${id}`, fd, {
                      headers: { "Content-Type": "multipart/form-data" },
                  })
                : api.post("/vendor/items", fd, {
                      headers: { "Content-Type": "multipart/form-data" },
                  });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["myItems"] });
            toast.success(isEdit ? "Item updated" : "Item created");
            nav("/vendor/items");
        },
        onError: (e) => toast.error(apiMessage(e)),
    });

    if (isEdit && isLoading) return <Loader />;

    return (
        <div className="max-w-3xl space-y-6">
            <Link
                to="/vendor/items"
                className="text-sm text-zinc-400 hover:text-white inline-flex items-center gap-1.5"
            >
                <ArrowLeft className="w-4 h-4" /> Back to items
            </Link>
            <div>
                <h1 className="h-section">
                    {isEdit ? "Edit item" : "New item"}
                </h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Provide rich details so users can find &amp; buy.
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submitMut.mutate();
                }}
                className="card p-6 space-y-5"
            >
                <div className="grid sm:grid-cols-3 gap-5">
                    <label className="sm:col-span-1 cursor-pointer">
                        <div className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-mint-400/50 grid place-items-center text-zinc-400 overflow-hidden">
                            {preview ? (
                                <img
                                    src={preview}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                            ) : (
                                <div className="text-center">
                                    <ImagePlus className="w-6 h-6 mx-auto mb-1" />
                                    <span className="text-xs">Add image</span>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onFile}
                            className="hidden"
                        />
                    </label>

                    <div className="sm:col-span-2 space-y-4">
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
                                    {CATEGORIES.map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Status</label>
                                <select
                                    className="input capitalize"
                                    value={form.status}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            status: e.target.value,
                                        })
                                    }
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s.replace(/_/g, " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Price (₹)</label>
                                <input
                                    required
                                    type="number"
                                    min={0}
                                    className="input"
                                    value={form.price}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            price: Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="label">Stock</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="input"
                                    value={form.stock}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            stock: Number(e.target.value),
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="label">Description</label>
                    <textarea
                        rows={4}
                        className="input"
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Link to="/vendor/items" className="btn-ghost">
                        Cancel
                    </Link>
                    <button
                        disabled={submitMut.isPending}
                        className="btn-primary"
                    >
                        {submitMut.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isEdit ? (
                            "Save"
                        ) : (
                            "Create"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
