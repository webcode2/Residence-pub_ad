"use server";

import api from "@/lib/api";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { login } from "@/lib/session";
import { caretakerHeaders } from "@/lib/caretaker";

const DetailsSchema = z.object({
    full_name: z.string().trim().min(1).max(255),
    email: z.string().trim().email(),
    current_password: z.string().max(128).optional(),
});
const PasswordSchema = z.object({
    current_password: z.string().min(1).max(128),
    new_password: z.string().min(8).max(72),
});

function failure(error: unknown, fallback: string): string {
    const response = (error as { response?: { status?: number; data?: { detail?: unknown } } }).response;
    if (response?.status === 401) return "Your session has expired. Please sign in again.";
    return typeof response?.data?.detail === "string" ? response.data.detail : fallback;
}

// Both endpoints revoke the presented token and return a fresh one, so the session must be rewritten.
async function persist(data: { user: unknown; token: { access_token: string } }) {
    await login(data.user, data.token.access_token);
    revalidatePath("/dashboard");
}

export async function updateProfileAction(values: z.infer<typeof DetailsSchema>) {
    const parsed = DetailsSchema.safeParse(values);
    if (!parsed.success) return { error: "Enter your name and a valid email address." };
    try {
        const { current_password, ...details } = parsed.data;
        const response = await api.patch("users/me/profile", { ...details, ...(current_password ? { current_password } : {}) },
            { headers: await caretakerHeaders(), timeout: 15000 });
        await persist(response.data);
        return { success: true };
    } catch (error) {
        return { error: failure(error, "Failed to update your profile.") };
    }
}

export async function changePasswordAction(values: z.infer<typeof PasswordSchema>) {
    const parsed = PasswordSchema.safeParse(values);
    if (!parsed.success) return { error: "Use a new password of 8 to 72 characters." };
    try {
        const response = await api.post("auth/change-password", parsed.data, { headers: await caretakerHeaders(), timeout: 15000 });
        await persist(response.data);
        return { success: true };
    } catch (error) {
        return { error: failure(error, "Failed to change your password.") };
    }
}
