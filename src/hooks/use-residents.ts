"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { directoryRequest } from '@/actions/directory';

async function request(...args: Parameters<typeof directoryRequest>) {
    const result = await directoryRequest(...args);
    if (result?.error) throw new Error(result.error);
    return result;
}

export function useResidents(appId: string) {
    return useQuery({queryKey:['residents',appId],enabled:!!appId,
        queryFn:()=>request('list'),refetchOnWindowFocus:false});
}
function useDirectoryMutation(appId: string, action: 'create'|'import'|'revoke'|'restore'|'update'|'delete') {
    const cache=useQueryClient();
    return useMutation({mutationFn:(value:any)=>action==='import'||action==='create'?request(action,undefined,value):action==='update'?request(action,value.userId,value.data):request(action,value),
        onSuccess:()=>cache.invalidateQueries({queryKey:['residents',appId]})});
}
export function useCreateLandlord(appId:string){return useDirectoryMutation(appId,'create');}
export function useImportLandlords(appId:string){return useDirectoryMutation(appId,'import');}
export function useRevokeUser(appId:string){return useDirectoryMutation(appId,'revoke');}
export function useRestoreUser(appId:string){return useDirectoryMutation(appId,'restore');}
export function useUpdateUser(appId:string){return useDirectoryMutation(appId,'update');}
export function useDeleteUser(appId:string){return useDirectoryMutation(appId,'delete');}
