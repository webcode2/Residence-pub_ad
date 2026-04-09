import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface BillingRecord {
    id: string;
    user_id: string;
    amount: number;
    description?: string;
    title: string;
    app_id: string;
    is_paid: boolean;
    created_at: string;
    user_name: string;
    unit: string;
    billing_month?: number;
    billing_year?: number;
}

export interface FeeConfig {
    id: string;
    name: string;
    amount: number;
    is_recurring: boolean;
    frequency: string;
    is_global: boolean;
    description?: string;
    app_id: string;
}

export function useBillings(appId: string) {
    return useQuery({
        queryKey: ["billings", appId],
        queryFn: async () => {
            const response = await api.get(`billing/billings`, {
                headers: {
                    "X-App-Id": appId,
                },
            });
            return response.data as BillingRecord[];
        },
        enabled: !!appId,
    });
}

export function useFeeConfigs(appId: string) {
    return useQuery({
        queryKey: ["fee-configs", appId],
        queryFn: async () => {
            const response = await api.get(`billing/fees`, {
                headers: {
                    "X-App-Id": appId,
                },
            });
            return response.data as FeeConfig[];
        },
        enabled: !!appId,
    });
}

export function useCreateFeeConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<FeeConfig>) => {
            const response = await api.post(`billing/fees`, data, {
                headers: {
                    "X-App-Id": data.app_id,
                },
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["fee-configs", variables.app_id] });
        },
    });
}

export function useDeleteFeeConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, appId }: { id: string; appId: string }) => {
            const response = await api.delete(`billing/fees/${id}`, {
                headers: {
                    "X-App-Id": appId,
                },
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["fee-configs", variables.appId] });
        },
    });
}
export function useUpdateFeeConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, appId, data }: { id: string; appId: string; data: Partial<FeeConfig> }) => {
            const response = await api.patch(`billing/fees/${id}`, data, {
                headers: {
                    "X-App-Id": appId,
                },
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["fee-configs", variables.appId] });
        },
    });
}

export function useGenerateInvoices() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ appId }: { appId: string }) => {
            const response = await api.post(
                `billing/trigger-monthly`,
                {},
                {
                    headers: {
                        "X-App-Id": appId,
                    },
                }
            );
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["billings", variables.appId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats", variables.appId] });
            queryClient.invalidateQueries({ queryKey: ["billing-insights", variables.appId] });
        },
    });
}

export interface BillingInsights {
    paid_this_month_count: number;
    paid_last_month_count: number;
    debtors: {
        user_id: string;
        name: string;
        unit: string;
        months_owing: number;
        total_owed: number;
    }[];
}

export function useBillingInsights(appId: string) {
    return useQuery({
        queryKey: ["billing-insights", appId],
        queryFn: async () => {
            const response = await api.get(`billing/billings/insights`, {
                headers: {
                    "X-App-Id": appId,
                },
            });
            return response.data as BillingInsights;
        },
        enabled: !!appId,
    });
}
