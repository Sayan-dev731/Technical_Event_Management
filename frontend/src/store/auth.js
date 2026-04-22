import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, bindAuth } from "../api/axios.js";

export const useAuth = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            booting: true,

            setSession: ({ user, accessToken }) =>
                set({ user, accessToken, booting: false }),

            login: async ({ email, password, role }) => {
                const r = await api.post("/auth/login", {
                    email,
                    password,
                    role,
                });
                const { user, accessToken } = r.data.data;
                set({ user, accessToken, booting: false });
                return user;
            },

            signup: async (role, payload) => {
                const r = await api.post(`/auth/signup/${role}`, payload);
                return r.data;
            },

            logout: async () => {
                try {
                    await api.post("/auth/logout");
                } catch {
                    /* ignore */
                }
                set({ user: null, accessToken: null });
            },

            refreshMe: async () => {
                try {
                    const r = await api.get("/auth/me");
                    set({ user: r.data.data, booting: false });
                } catch {
                    set({ user: null, accessToken: null, booting: false });
                }
            },

            updateProfileLocal: (patch) =>
                set({ user: { ...(get().user || {}), ...patch } }),
        }),
        {
            name: "eventide-auth",
            partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
        },
    ),
);

// Wire token getter for axios interceptor
bindAuth(() => useAuth.getState().accessToken);
