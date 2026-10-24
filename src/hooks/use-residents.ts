"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { directoryRequest } from '@/actions/directory';

export function useResidents(appId: string) {
    return useQuery({queryKey:['residents',appId],enabled:!!appId,
        queryFn:()=>directoryRequest('list'),refetchOnWindowFocus:false});
}
function useDirectoryMutation(appId: string, action: 'import'|'revoke'|'update'|'delete') {
    const cache=useQueryClient();
    return useMutation({mutationFn:(value:any)=>action==='import'?directoryRequest(action,undefined,value):action==='update'?directoryRequest(action,value.userId,value.data):directoryRequest(action,value),
        onSuccess:()=>cache.invalidateQueries({queryKey:['residents',appId]})});
}
export function useImportLandlords(appId:string){return useDirectoryMutation(appId,'import');}
export function useRevokeUser(appId:string){return useDirectoryMutation(appId,'revoke');}
export function useUpdateUser(appId:string){return useDirectoryMutation(appId,'update');}
export function useDeleteUser(appId:string){return useDirectoryMutation(appId,'delete');}

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
