"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { directoryRequest } from '@/actions/directory';

async function request(...args: Parameters<typeof directoryRequest>) {
    const result = await directoryRequest(...args);
    if (result?.error) throw new Error(result.error);
    return result;
}

type ResetStatus = { password_reset?: { status: string } | null };

export function useResidents(appId: string) {
    const pending = (row: ResetStatus) => ['queued', 'retrying'].includes(row.password_reset?.status ?? '');
    return useQuery({
        queryKey: ['residents', appId],
        enabled: !!appId,
        queryFn: () => request('list'),
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
        refetchInterval: query => Array.isArray(query.state.data) &&
            query.state.data.some((row: ResetStatus & { occupants?: ResetStatus[] }) =>
                pending(row) || row.occupants?.some(pending)) ? 10000 : false,
    });
}
function useDirectoryMutation(appId: string, action: 'create'|'import'|'revoke'|'restore'|'update'|'archive') {
    const cache=useQueryClient();
    return useMutation({mutationFn:(value:any)=>action==='import'||action==='create'?request(action,undefined,value):action==='update'?request(action,value.userId,value.data):action==='revoke'||action==='archive'?request(action,value.userId,value.reason):request(action,value),
        onSuccess:()=>cache.invalidateQueries({queryKey:['residents',appId]})});
}
export function useCreateLandlord(appId:string){return useDirectoryMutation(appId,'create');}
export function useImportLandlords(appId:string){return useDirectoryMutation(appId,'import');}
export function useRevokeUser(appId:string){return useDirectoryMutation(appId,'revoke');}
export function useRestoreUser(appId:string){return useDirectoryMutation(appId,'restore');}
export function useUpdateUser(appId:string){return useDirectoryMutation(appId,'update');}
export function useArchiveUser(appId:string){return useDirectoryMutation(appId,'archive');}
