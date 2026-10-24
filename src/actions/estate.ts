"use server";

import api from "@/lib/api";
import { caretakerHeaders } from "@/lib/caretaker";

export async function fetchEstateConfigAction(appId: string) {
  try {
    const response = await api.get(`estates/settings`, { headers: await caretakerHeaders(), timeout: 15000 });
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      error: error.response?.data?.detail || "Failed to fetch estate configuration"
    };
  }
}
