import { motion } from "framer-motion";
import { Logo } from "../components/Logo.jsx";
import { Link } from "react-router-dom";

export function AuthShell({ title, subtitle, children, footer }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left visual */}
            <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-faint [background-size:36px_36px] opacity-40" />
                <div className="absolute -top-40 -left-20 w-[40rem] h-[40rem] bg-radial-fade" />
                <div className="relative z-10">
                    <Link to="/">
                        <Logo />
                    </Link>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 max-w-md"
                >
                    <h2 className="font-display text-4xl font-bold leading-tight">
                        Make every event feel
                        <span className="bg-gradient-to-r from-mint-300 to-emerald-500 bg-clip-text text-transparent">
                            {" "}
                            effortless.
                        </span>
                    </h2>
                    <p className="mt-4 text-zinc-400">
                        From the first vendor request to the last guest
                        checked-in. Eventide keeps everyone aligned.
                    </p>
                </motion.div>
                <div className="relative z-10 text-xs text-zinc-500">
                    © {new Date().getFullYear()} Eventide
                </div>
            </div>

            {/* Right form */}
            <div className="flex flex-col items-center justify-center px-5 py-10 sm:px-10">
                <div className="lg:hidden mb-6">
                    <Link to="/">
                        <Logo />
                    </Link>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    <h1 className="font-display text-3xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-zinc-400 mt-2">{subtitle}</p>
                    )}
                    <div className="card p-6 mt-6">{children}</div>
                    {footer && (
                        <div className="text-sm text-zinc-400 mt-4 text-center">
                            {footer}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
