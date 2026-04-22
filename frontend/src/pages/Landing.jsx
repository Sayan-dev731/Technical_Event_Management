import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Boxes,
    Users,
    BadgeCheck,
    Truck,
} from "lucide-react";
import { Logo } from "../components/Logo.jsx";

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] },
    },
};

export default function Landing() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Decorative grid + glow */}
            <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:36px_36px] opacity-40" />
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[80rem] h-[40rem] bg-radial-fade" />

            <header className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                <Logo />
                <nav className="hidden md:flex items-center gap-7 text-sm text-zinc-400">
                    <a href="#features" className="hover:text-white transition">
                        Features
                    </a>
                    <a href="#how" className="hover:text-white transition">
                        How it works
                    </a>
                    <a href="#roles" className="hover:text-white transition">
                        For you
                    </a>
                </nav>
                <div className="flex items-center gap-2">
                    <Link to="/login" className="btn-ghost">
                        Sign in
                    </Link>
                    <Link to="/signup" className="btn-primary">
                        Get started <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 lg:pt-24 pb-20 text-center">
                <motion.div initial="hidden" animate="show" variants={stagger}>
                    <motion.span
                        variants={fadeUp}
                        className="chip-mint mx-auto"
                    >
                        <Sparkles className="w-3.5 h-3.5" /> New — Membership
                        powered vendor catalog
                    </motion.span>

                    <motion.h1
                        variants={fadeUp}
                        className="font-display mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]"
                    >
                        Plan unforgettable events,
                        <br />
                        <span className="bg-gradient-to-r from-mint-300 via-mint-400 to-emerald-500 bg-clip-text text-transparent">
                            without the chaos.
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto"
                    >
                        One platform for hosts, vendors and admins. Source
                        curated vendors, manage carts &amp; guest lists, and run
                        end-to-end logistics with elegance.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        className="mt-10 flex items-center justify-center gap-3 flex-wrap"
                    >
                        <Link
                            to="/signup"
                            className="btn-primary px-6 py-3 text-base"
                        >
                            Create your account{" "}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/login"
                            className="btn-ghost px-6 py-3 text-base"
                        >
                            I already have an account
                        </Link>
                    </motion.div>

                    <motion.div variants={fadeUp} className="mt-14">
                        <HeroPreview />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features */}
            <section
                id="features"
                className="relative z-10 max-w-7xl mx-auto px-6 py-20"
            >
                <h2 className="h-section text-center">
                    Everything you need, nothing you don't
                </h2>
                <p className="text-center text-zinc-400 mt-3 max-w-xl mx-auto">
                    A focused toolkit built around real event workflows — not
                    generic e-commerce.
                </p>
                <div className="grid md:grid-cols-3 gap-5 mt-12">
                    {FEATURES.map((f) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5 }}
                            className="card p-6 hover:bg-white/[0.05] transition group"
                        >
                            <div className="w-11 h-11 rounded-xl bg-mint-400/10 text-mint-300 grid place-items-center group-hover:scale-110 transition">
                                <f.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-display mt-4 text-lg font-semibold">
                                {f.title}
                            </h3>
                            <p className="text-sm text-zinc-400 mt-1.5">
                                {f.body}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Roles */}
            <section
                id="roles"
                className="relative z-10 max-w-7xl mx-auto px-6 py-16"
            >
                <h2 className="h-section text-center">
                    Built for everyone in the room
                </h2>
                <div className="grid md:grid-cols-3 gap-5 mt-10">
                    {ROLES.map((r) => (
                        <div key={r.name} className="card p-6">
                            <div className="text-xs uppercase tracking-widest text-mint-400">
                                {r.name}
                            </div>
                            <h3 className="font-display text-xl font-semibold mt-2">
                                {r.title}
                            </h3>
                            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                                {r.bullets.map((b) => (
                                    <li
                                        key={b}
                                        className="flex items-start gap-2"
                                    >
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mint-400 shrink-0" />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="relative z-10 border-t border-white/5 mt-10">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3">
                    <Logo />
                    <p className="text-xs text-zinc-500">
                        © {new Date().getFullYear()} Eventide. Crafted for
                        organisers who care.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function HeroPreview() {
    return (
        <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-2 bg-gradient-to-r from-mint-500/20 via-emerald-500/10 to-teal-500/20 blur-2xl rounded-3xl" />
            <div className="relative card p-2 sm:p-3 overflow-hidden">
                <div className="rounded-2xl border border-white/5 bg-ink-950 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        <span className="ml-3 text-[11px] text-zinc-500">
                            eventide.app/user
                        </span>
                    </div>
                    <div className="p-6 grid sm:grid-cols-3 gap-4 bg-gradient-to-b from-ink-900 to-ink-950">
                        {["Vendors", "Cart", "Orders"].map((label, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                            >
                                <div className="text-xs text-zinc-500">
                                    {label}
                                </div>
                                <div className="font-display text-2xl mt-1">
                                    {[12, 4, 7][i]}
                                </div>
                                <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${[80, 35, 60][i]}%`,
                                        }}
                                        transition={{
                                            delay: 0.6 + i * 0.1,
                                            duration: 0.8,
                                        }}
                                        className="h-full bg-gradient-to-r from-mint-400 to-emerald-500"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const FEATURES = [
    {
        icon: Boxes,
        title: "Curated catalog",
        body: "Browse verified vendors across catering, decor, lighting and more — all in one place.",
    },
    {
        icon: Truck,
        title: "Realtime orders",
        body: "Track each order from confirmed to delivered with status updates from vendors.",
    },
    {
        icon: Users,
        title: "Guest lists",
        body: "Manage RSVPs, notes and event dates with crisp, collaborative lists.",
    },
    {
        icon: BadgeCheck,
        title: "Vendor memberships",
        body: "Admin-managed plans keep vendors active, with email-driven lifecycle events.",
    },
    {
        icon: ShieldCheck,
        title: "Hardened auth",
        body: "JWT + refresh rotation, email verification and rate-limited endpoints by default.",
    },
    {
        icon: Sparkles,
        title: "Installable PWA",
        body: "Works offline-friendly, installable on iOS, Android and desktop.",
    },
];

const ROLES = [
    {
        name: "User",
        title: "Plan with confidence",
        bullets: [
            "Browse vendors & request items",
            "Build a cart, check out securely",
            "Track orders & manage guests",
        ],
    },
    {
        name: "Vendor",
        title: "Sell more, hassle less",
        bullets: [
            "Manage your catalog",
            "Respond to incoming requests",
            "Update orders end-to-end",
        ],
    },
    {
        name: "Admin",
        title: "Govern the platform",
        bullets: [
            "Onboard users & vendors",
            "Issue & extend memberships",
            "Monitor revenue & activity",
        ],
    },
];
