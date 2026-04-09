"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useResidents(appId: string) {
    return useQuery({
        queryKey: ['residents'],
        queryFn: async () => {
            const response = await api.get('iam/landlords', {
                headers: { 'X-App-Id': appId }
            });
            return response.data;
        },
    });
}

export function useImportLandlords(appId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any[]) => {
            const response = await api.post('iam/landlords/import', { import_data: data }, {
                headers: { 'X-App-Id': appId }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['residents'] });
        },
    });
}

export function useRevokeUser(appId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.patch(`iam/users/${userId}`, { is_revoked: true }, {
                headers: { 'X-App-Id': appId }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['residents'] });
        },
    });
}

export function useUpdateUser(appId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, data }: { userId: string, data: any }) => {
            const response = await api.patch(`iam/users/${userId}`, data, {
                headers: { 'X-App-Id': appId }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['residents'] });
        },
    });
}

export function useDeleteUser(appId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.delete(`iam/users/${userId}`, {
                headers: { 'X-App-Id': appId }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['residents'] });
        },
    });
}

export function useEstateConfig(appId: string) {
    return useQuery({
        queryKey: ['estate-config'],
        queryFn: async () => {
            const response = await api.get('iam/estates/config', {
                headers: { 'X-App-Id': appId }
            });
            return response.data;
        },
    });
}

export function useUpdateEstateConfig(appId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.patch('iam/estates/config', data, {
                headers: { 'X-App-Id': appId }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['estate-config'] });
        },
    });
}
