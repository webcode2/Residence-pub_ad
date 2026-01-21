"use server";

import { login as setSession, logout as destroySession } from "@/lib/session";
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
    adminName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
});

export async function loginAction(formData: z.infer<typeof LoginSchema>) {
    console.log("Logging in with:", formData);

    try {
        // Requires X-App-Id header for tenant identification.
        api.defaults.headers.common["X-App-Id"] = formData.appId;
        const response = await api.post("/auth/login", formData);

        console.log(response.data);
        return { success: true, data: response.data, twoFactorRequired: response.data.twoFactorRequired };
    } catch (error: any) {
        // Interceptor already logged this, but we handle the error for the UI

        return {
            error: error.response?.data?.message || error.response?.data?.detail || "Failed to connect to authentication server"
        };
    }




}

export async function registerAction(formData: z.infer<typeof RegisterSchema>) {
    console.log("Registering with:", formData);

    try {
        const response = await api.post("/estates/register/", formData);
        return { success: true, data: response.data };
    } catch (error: any) {
        // Interceptor already logged this, but we handle the error for the UI
        return {
            error: error.response?.data?.message || "Failed to connect to authentication server"
        };
    }
}


export async function logoutAction() {
    await destroySession();
    redirect("/login");
}

export async function verify2FAAction(code: string) {
    // Simulate 2FA verification
    if (code === "123456") {
        const user = {
            id: "user_123",
            email: "2fa@example.com",
            name: "Admin User",
            role: "admin",
            is2FAEnabled: true,
        };
        await setSession(user);
        return { success: true };
    }
    return { success: false, error: "Invalid 2FA code" };
}
