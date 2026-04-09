"use client";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useAccessLogs(appId: string, params: { search?: string; type?: string; limit?: number }) {
    return useQuery({
        queryKey: ['access-logs', params],
        queryFn: async () => {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.type && params.type !== 'all') queryParams.append('type', params.type);
            queryParams.append('limit', (params.limit || 50).toString());

            const response = await api.get(`iam/activity?${queryParams.toString()}`, {
                headers: { 'X-App-Id': appId }
            });
            return response.data;
        },
    });
}

export function useTrafficStats(appId: string) {
    return useQuery({
        queryKey: ['traffic-stats'],
        queryFn: async () => {
            const response = await api.get('iam/dashboard/stats', {
                headers: { 'X-App-Id': appId }
            });
            return response.data;
        },
    });
}
