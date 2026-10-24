"use server";

import { login as setSession, logout as destroySession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";
import api from "@/lib/api";

const LoginSchema = z.object({
    appId: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
});

const RegisterSchema = z.object({
    estateName: z.string().min(3),
    adminName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    terms: z.boolean().refine(value => value === true),
});

export async function loginAction(formData: z.infer<typeof LoginSchema>) {
    console.log("[loginAction] Starting login with:", formData.email, "appId:", formData.appId);

    try {
        // IMPORTANT: Pass X-App-Id per-request, NOT via api.defaults.
        // api.defaults.headers is a shared singleton on the server and can be
        // overwritten by concurrent requests from other users/tenants.
        const response = await api.post("auth/login", {
            email: formData.email,
            password: formData.password,
        }, {
            headers: { "X-App-Id": formData.appId },
        });
        console.log("[loginAction] API response status:", response.status);

        if (!response.data.user?.roles?.includes('caretaker') ||
            response.data.user.app_id !== formData.appId) {
            return { error: "Only an estate caretaker can access this dashboard." };
        }
        // Create session cookie with user data and JWT
        if (response.data.user) {
            await setSession(response.data.user, response.data.access_token || response.data.token?.access_token);
        }

        return {
            success: true,
            data: response.data,
            twoFactorRequired: response.data.twoFactorRequired
        };
    } catch (error: any) {
        console.error("[loginAction] ERROR:", error.message);
        return {
            error: error.response?.data?.message || error.response?.data?.detail || "Failed to connect to authentication server"
        };
    }
}

export async function registerAction(formData: z.infer<typeof RegisterSchema>) {
    const parsed = RegisterSchema.safeParse(formData);
    if (!parsed.success) return { error: "Check the registration details and accept the terms before continuing." };

    try {
        // No X-App-Id needed for registration — the backend creates a new estate
        const response = await api.post("users/register-tenant", {
            email: formData.email,
            password: formData.password,
            adminName: formData.adminName,
            estateName: formData.estateName,
            terms: formData.terms
        });

        if (response.data.user && (response.data.access_token || response.data.token?.access_token)) {
            await setSession(response.data.user, response.data.access_token || response.data.token?.access_token);
        }

        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            error: error.response?.data?.message || error.response?.data?.detail || "Failed to connect to authentication server"
        };
    }
}


export async function logoutAction() {
    await destroySession();
    redirect("/login");
}

export async function getSessionAction() {
    return await getSession();
}

export async function verify2FAAction(_code: string) {
    return { success: false, error: "Two-factor verification is not configured. Contact your estate administrator." };
}
