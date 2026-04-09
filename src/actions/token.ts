"use server";

import api from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createRegistrationTokenAction(appId: string, data: { landlord_id: string; house_number: string; street_name: string }) {
    try {
        const response = await api.post(`iam/registration-tokens`, data, {
            headers: {
                'X-App-Id': appId
            }
        });

        revalidatePath('/dashboard/residents');
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            error: error.response?.data?.detail || "Failed to generate registration token"
        };
    }
}

export async function createVisitorTokenAction(appId: string, data: { visitor_name: string; visitor_phone?: string }) {
    try {
        const response = await api.post(`tokens/visitor`, data, {
            headers: {
                'X-App-Id': appId
            }
        });

        revalidatePath('/dashboard');
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            error: error.response?.data?.detail || "Failed to generate visitor token"
        };
    }
}
