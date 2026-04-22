import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    LogOut,
    Home,
    Store,
    ShoppingBag,
    ClipboardList,
    Users,
    BadgeCheck,
    UserCog,
    Boxes,
    Inbox,
    Truck,
    Heart,
    Menu,
    X,
    User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth.js";
import { Logo } from "./Logo.jsx";
import { initials } from "../utils/format.js";
import toast from "react-hot-toast";

const NAV = {
    user: [
        { to: "/user", label: "Home", icon: Home, end: true },
        { to: "/user/vendors", label: "Vendors", icon: Store },
        { to: "/user/items", label: "Browse Items", icon: Boxes },
        { to: "/user/cart", label: "Cart", icon: ShoppingBag },
        { to: "/user/orders", label: "Orders", icon: Truck },
        { to: "/user/guest-lists", label: "Guest Lists", icon: Heart },
        { to: "/user/requests", label: "Requests", icon: Inbox },
    ],
    vendor: [
        { to: "/vendor", label: "Overview", icon: Home, end: true },
        { to: "/vendor/items", label: "My Items", icon: Boxes },
        { to: "/vendor/requests", label: "Requests", icon: Inbox },
        { to: "/vendor/orders", label: "Orders", icon: Truck },
    ],
    admin: [
        { to: "/admin", label: "Dashboard", icon: Home, end: true },
        { to: "/admin/users", label: "Users & Vendors", icon: Users },
        { to: "/admin/memberships", label: "Memberships", icon: BadgeCheck },
    ],
};

export function Layout() {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const [open, setOpen] = useState(false);

    useEffect(() => setOpen(false), [loc.pathname]);

    const items = NAV[user?.role] || [];

    const onLogout = async () => {
        await logout();
        toast.success("See you soon");
        nav("/login");
    };

    return (
        <div className="min-h-screen flex">
            {/* Sidebar (desktop) */}
            <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/5 bg-ink-950/60 backdrop-blur-xl">
                <div className="p-5 border-b border-white/5">
                    <Logo />
                </div>
                <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
                    {items.map((it) => (
                        <NavItem key={it.to} {...it} />
                    ))}
                </nav>
                <ProfilePill onLogout={onLogout} />
            </aside>

            {/* Mobile drawer */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        />
                        <motion.aside
                            className="fixed top-0 left-0 bottom-0 w-72 z-50 bg-ink-950 border-r border-white/10 lg:hidden flex flex-col"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{
                                type: "spring",
                                damping: 26,
                                stiffness: 240,
                            }}
                        >
                            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                <Logo />
                                <button
                                    onClick={() => setOpen(false)}
                                    className="btn-ghost !p-2"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
                                {items.map((it) => (
                                    <NavItem key={it.to} {...it} />
                                ))}
                            </nav>
                            <ProfilePill onLogout={onLogout} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main */}
            <main className="flex-1 min-w-0 flex flex-col">
                <header className="sticky top-0 z-30 lg:hidden bg-ink-950/80 backdrop-blur-xl border-b border-white/5">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={() => setOpen(true)}
                            className="btn-ghost !p-2"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <Logo />
                        <NavLink to="/user/profile" className="btn-ghost !p-2">
                            <UserIcon className="w-5 h-5" />
                        </NavLink>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={loc.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                            duration: 0.25,
                            ease: [0.2, 0.7, 0.2, 1],
                        }}
                        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>

                {/* Mobile bottom nav (top 4 items) */}
                <nav className="lg:hidden sticky bottom-0 z-30 bg-ink-950/95 backdrop-blur-xl border-t border-white/5">
                    <div className="grid grid-cols-5 px-1">
                        {items.slice(0, 5).map((it) => (
                            <NavLink
                                key={it.to}
                                to={it.to}
                                end={it.end}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-wider ${
                                        isActive
                                            ? "text-mint-400"
                                            : "text-zinc-500"
                                    }`
                                }
                            >
                                <it.icon className="w-5 h-5" />
                                <span className="leading-none">
                                    {it.label.split(" ")[0]}
                                </span>
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </main>
        </div>
    );
}

function NavItem({ to, label, icon: Icon, end }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                    isActive
                        ? "bg-white/5 text-white shadow-soft"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.span
                            layoutId="nav-pill"
                            className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-mint-400"
                            transition={{
                                type: "spring",
                                damping: 24,
                                stiffness: 280,
                            }}
                        />
                    )}
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                </>
            )}
        </NavLink>
    );
}

function ProfilePill({ onLogout }) {
    const { user } = useAuth();
    const profilePath =
        user?.role === "user"
            ? "/user/profile"
            : user?.role === "vendor"
              ? "/vendor/profile"
              : "/admin/profile";
    return (
        <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
                <NavLink
                    to={profilePath}
                    className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-90"
                >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint-400 to-mint-700 grid place-items-center text-ink-950 font-bold text-sm">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt=""
                                className="w-full h-full object-cover rounded-xl"
                            />
                        ) : (
                            initials(user?.name)
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.name}
                        </p>
                        <p className="text-[11px] text-zinc-500 capitalize">
                            {user?.role}
                        </p>
                    </div>
                </NavLink>
                <button
                    onClick={onLogout}
                    className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-red-400"
                    title="Log out"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
