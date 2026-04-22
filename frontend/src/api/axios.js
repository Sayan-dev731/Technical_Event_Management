import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE
    ? `${import.meta.env.VITE_API_BASE.replace(/\/$/, "")}/api/v1`
    : "/api/v1";

export const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 20_000,
});

// Token from auth store (set lazily to avoid circular import)
let getAccessToken = () => null;
export const bindAuth = (fn) => {
    getAccessToken = fn;
};

api.interceptors.request.use((cfg) => {
    const tok = getAccessToken();
    if (tok && !cfg.headers.Authorization) {
        cfg.headers.Authorization = `Bearer ${tok}`;
    }
    return cfg;
});

let isRefreshing = false;
let waiters = [];

const flush = (err, token = null) => {
    waiters.forEach((cb) => cb(err, token));
    waiters = [];
};

api.interceptors.response.use(
    (r) => r,
    async (error) => {
        const original = error.config || {};
        const status = error.response?.status;

        // Try silent refresh once on 401 (skip the auth endpoints themselves)
        const isAuthCall =
            original.url?.includes("/auth/login") ||
            original.url?.includes("/auth/refresh") ||
            original.url?.includes("/auth/signup");

        if (status === 401 && !original._retry && !isAuthCall) {
            original._retry = true;
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    waiters.push((err, token) => {
                        if (err) return reject(err);
                        if (token)
                            original.headers.Authorization = `Bearer ${token}`;
                        resolve(api(original));
                    });
                });
            }
            isRefreshing = true;
            try {
                const r = await api.post("/auth/refresh", {});
                const newTok = r.data?.data?.accessToken;
                flush(null, newTok);
                if (newTok) original.headers.Authorization = `Bearer ${newTok}`;
                return api(original);
            } catch (e) {
                flush(e, null);
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    },
);

export const apiMessage = (err, fallback = "Something went wrong") =>
    err?.response?.data?.message || err?.message || fallback;
