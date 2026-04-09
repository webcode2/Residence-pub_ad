"use server";

import api from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updateGlobalFeeAction(appId: string, fee: number) {
  try {
    const response = await api.post(`billing/billing/fees`, {
      app_id: appId,
      amount: fee
    }, {
      headers: {
        'X-App-Id': appId
      }
    });

    revalidatePath('/dashboard');
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      error: error.response?.data?.detail || "Failed to update global fee"
    };
  }
}

export async function fetchEstateConfigAction(appId: string) {
  try {
    const response = await api.get(`iam/estates`, {
      headers: {
        'X-App-Id': appId
      }
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      error: error.response?.data?.detail || "Failed to fetch estate configuration"
    };
  }
}
