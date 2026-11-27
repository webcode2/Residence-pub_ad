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

        if (!response.data.user?.roles?.includes('caretaker') ||
            response.data.user.app_id !== formData.appId) {
            return { error: "Only an estate caretaker can access this dashboard." };
        }
        // Create session cookie with user data and JWT
        if (response.data.user) {
            await setSession(response.data.user, response.data.access_token || response.data.token?.access_token);
        }

        // The bearer token stays in the httpOnly session cookie; never hand it to browser code.
        const { token: _token, access_token: _accessToken, ...data } = response.data;
        return {
            success: true,
            data,
            twoFactorRequired: response.data.twoFactorRequired
        };
    } catch (error: any) {
        return {
            error: error.response?.data?.message || error.response?.data?.detail || "Failed to connect to authentication server"
        };
    }
}

export async function requestReinstatementAction(input: { appId: string; email: string }) {
    const parsed = LoginSchema.pick({ appId: true, email: true }).safeParse(input);
    if (!parsed.success) return { error: "Enter your estate App ID and email." };
    try {
        const response = await api.post<{message: string}>("auth/request-reinstatement",
            { email: parsed.data.email },
            { headers: { "X-App-Id": parsed.data.appId.trim().toUpperCase() }, timeout: 10000 });
        return { message: response.data.message };
    } catch {
        return { error: "Unable to submit the request. Please try again." };
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

        const { token: _token, access_token: _accessToken, ...data } = response.data;
        return { success: true, data };
    } catch (error: any) {
        return {
            error: error.response?.data?.message || error.response?.data?.detail || "Failed to connect to authentication server"
        };
    }
}


export async function logoutAction() {
    const session = await getSession();
    if (session?.token) {
        // Revoke the backend token too; clearing the cookie alone leaves it usable until expiry.
        await api.post("auth/logout", {}, {
            headers: { Authorization: `Bearer ${session.token}`, "X-App-Id": session.user?.app_id },
            timeout: 10000,
        }).catch(() => undefined);
    }
    await destroySession();
    redirect("/login");
}

export async function getSessionAction() {
    const session = await getSession();
    return session?.user ? { user: session.user } : null;
}

export async function verify2FAAction(_code: string) {
    return { success: false, error: "Two-factor verification is not configured. Contact your estate administrator." };
}
