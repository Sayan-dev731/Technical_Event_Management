import { motion } from "framer-motion";

export function Loader({ label = "Loading" }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div
                className="w-10 h-10 rounded-full border-2 border-white/10 border-t-mint-400"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            <span className="text-xs uppercase tracking-widest text-zinc-500">
                {label}
            </span>
        </div>
    );
}

export function FullPageLoader() {
    return (
        <div className="min-h-screen grid place-items-center">
            <Loader label="Booting" />
        </div>
    );
}

export function CardSkeleton({ rows = 3 }) {
    return (
        <div className="card p-5 space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton h-4 w-full"
                    style={{ width: `${90 - i * 12}%` }}
                />
            ))}
        </div>
    );
}
