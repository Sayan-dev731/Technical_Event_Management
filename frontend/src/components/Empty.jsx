import { Inbox } from "lucide-react";

export function Empty({
    title = "Nothing here yet",
    subtitle,
    icon: Icon = Inbox,
    action,
}) {
    return (
        <div className="card p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 mx-auto grid place-items-center mb-4">
                <Icon className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            {subtitle && (
                <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
