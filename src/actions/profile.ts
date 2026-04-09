"use server";

import api from "@/lib/api";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession, login } from "@/lib/session";

const ProfileUpdateSchema = z.object({
    full_name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
});

export async function updateProfileAction(userId: string, appId: string, data: z.infer<typeof ProfileUpdateSchema>) {
    console.log(`[updateProfileAction] Start - UserID: ${userId}, AppID: ${appId}`);
    try {
        const session = await getSession();
        if (!session) {
            console.error("[updateProfileAction] No session found");
            return { error: "Session expired. Please log in again." };
        }

        if (!session.token) {
            console.error("[updateProfileAction] No token found in session", session);
            return { error: "Authentication token missing. Please log out and log back in." };
        }

        const headers: any = {
            'X-App-Id': appId,
            'Authorization': `Bearer ${session.token}`
        };

        console.log(`[updateProfileAction] Headers:`, { ...headers, Authorization: 'Bearer [REDACTED]' });

        // Force use of a fresh axios instance or just use api instance but ensure headers are clean
        const response = await api.patch(`iam/users/${userId}`, data, { headers });
        console.log(`[updateProfileAction] Success:`, response.data);

        // Update the session cookie with the new user details
        // This is CRITICAL so refreshUser() sees the new data
        await login(response.data, session.token);

        revalidatePath('/dashboard');
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error("[updateProfileAction] Error:", error.response?.data || error.message);
        return {
            error: error.response?.data?.detail || "Failed to update profile"
        };
    }
}
