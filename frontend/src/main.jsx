import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import "./index.css";

const qc = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={qc}>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: "rgba(20,27,29,.95)",
                            color: "#e5e7eb",
                            border: "1px solid rgba(255,255,255,.08)",
                            backdropFilter: "blur(12px)",
                            borderRadius: "12px",
                            fontSize: "14px",
                        },
                        success: {
                            iconTheme: {
                                primary: "#34d399",
                                secondary: "#0b0f10",
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: "#f87171",
                                secondary: "#0b0f10",
                            },
                        },
                    }}
                />
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>,
);
