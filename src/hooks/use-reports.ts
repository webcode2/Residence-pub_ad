import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Report {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    location: string;
    status: 'open' | 'investigating' | 'resolved';
    reporter_id: string;
    reported_by_name: string;
    is_anonymous: boolean;
    app_id: string;
    created_at: string;
    updated_at: string;
}

export interface CreateReportDTO {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    location: string;
    is_anonymous?: boolean;
}

export interface UpdateReportDTO {
    title?: string;
    description?: string;
    severity?: 'low' | 'medium' | 'high';
    location?: string;
    status?: 'open' | 'investigating' | 'resolved';
}

export function useReports(appId: string) {
    return useQuery({
        queryKey: ["reports"],
        queryFn: async () => {
            const response = await api.get('iam/reports', {
                headers: { 'X-App-Id': appId }
            });
            return response.data as Report[];
        },
    });
}

export function useCreateReport(appId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateReportDTO) => {
            const response = await api.post('iam/reports', data, {
                headers: { 'X-App-Id': appId }
            });
            return response.data as Report;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
    });
}

export function useUpdateReport(appId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateReportDTO }) => {
            const response = await api.patch(`iam/reports/${id}`, data, {
                headers: { 'X-App-Id': appId }
            });
            return response.data as Report;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
    });
}

export function useDeleteReport(appId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`iam/reports/${id}`, {
                headers: { 'X-App-Id': appId }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
    });
}
