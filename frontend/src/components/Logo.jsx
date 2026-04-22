export function Logo({ className = "h-7 w-auto" }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <svg viewBox="0 0 64 64" className="h-8 w-8">
                <defs>
                    <linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0" stopColor="#34d399" />
                        <stop offset="1" stopColor="#059669" />
                    </linearGradient>
                </defs>
                <rect width="64" height="64" rx="14" fill="#0f1416" />
                <path
                    d="M14 40c0-10 8-18 18-18s18 8 18 18"
                    stroke="url(#lg)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                />
                <circle cx="32" cy="44" r="4" fill="url(#lg)" />
            </svg>
            <span className="font-display text-lg font-bold tracking-tight">
                Event<span className="text-mint-400">ide</span>
            </span>
        </div>
    );
}
