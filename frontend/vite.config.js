import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const apiTarget = env.VITE_API_PROXY || "http://localhost:8000";

    return {
        plugins: [
            react(),
            VitePWA({
                registerType: "autoUpdate",
                includeAssets: [
                    "favicon.svg",
                    "robots.txt",
                    "apple-touch-icon.png",
                ],
                manifest: {
                    name: "Eventide — Event Management",
                    short_name: "Eventide",
                    description:
                        "Plan, source, and manage events end-to-end. Vendors, carts, guest lists and more.",
                    theme_color: "#0b0f10",
                    background_color: "#0b0f10",
                    display: "standalone",
                    orientation: "portrait",
                    start_url: "/",
                    scope: "/",
                    icons: [
                        {
                            src: "/icons/icon-192.png",
                            sizes: "192x192",
                            type: "image/png",
                            purpose: "any maskable",
                        },
                        {
                            src: "/icons/icon-512.png",
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "any maskable",
                        },
                    ],
                },
                workbox: {
                    globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff2}"],
                    runtimeCaching: [
                        {
                            urlPattern: ({ url }) =>
                                url.pathname.startsWith("/api/"),
                            handler: "NetworkFirst",
                            options: {
                                cacheName: "api-cache",
                                networkTimeoutSeconds: 6,
                                expiration: {
                                    maxEntries: 80,
                                    maxAgeSeconds: 60 * 60 * 24,
                                },
                            },
                        },
                        {
                            urlPattern: ({ request }) =>
                                request.destination === "image",
                            handler: "CacheFirst",
                            options: {
                                cacheName: "img-cache",
                                expiration: {
                                    maxEntries: 200,
                                    maxAgeSeconds: 60 * 60 * 24 * 30,
                                },
                            },
                        },
                    ],
                },
            }),
        ],
        server: {
            port: 5173,
            host: true,
            proxy: {
                "/api": {
                    target: apiTarget,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});
