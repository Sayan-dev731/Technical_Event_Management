/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Inter",
                    "ui-sans-serif",
                    "system-ui",
                    "-apple-system",
                    "Segoe UI",
                    "Roboto",
                    "sans-serif",
                ],
                display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
            },
            colors: {
                ink: {
                    950: "#06090a",
                    900: "#0b0f10",
                    850: "#0f1416",
                    800: "#141b1d",
                    700: "#1b2326",
                    600: "#26302f",
                    500: "#384441",
                },
                mint: {
                    50: "#ecfdf5",
                    100: "#d1fae5",
                    200: "#a7f3d0",
                    300: "#6ee7b7",
                    400: "#34d399",
                    500: "#10b981",
                    600: "#059669",
                    700: "#047857",
                    800: "#065f46",
                },
            },
            boxShadow: {
                glow: "0 0 0 1px rgba(52,211,153,.18), 0 10px 40px -10px rgba(16,185,129,.35)",
                soft: "0 10px 30px -12px rgba(0,0,0,.6)",
            },
            backgroundImage: {
                "grid-faint":
                    "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
                "radial-fade":
                    "radial-gradient(ellipse at top, rgba(16,185,129,.18), transparent 60%)",
            },
            keyframes: {
                shimmer: {
                    "100%": { transform: "translateX(100%)" },
                },
                float: {
                    "0%,100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-6px)" },
                },
            },
            animation: {
                shimmer: "shimmer 1.6s infinite",
                float: "float 6s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};
