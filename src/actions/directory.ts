"use server";
import api from '@/lib/api';
import { caretakerHeaders } from '@/lib/caretaker';
import { z } from 'zod';
// Next.js hides thrown messages from server actions in production, so user-facing failures are returned instead.
function failure(error: unknown, fallback: string) {
    const detail = (error as {response?:{data?:{detail?:unknown}}}).response?.data?.detail;
    return {error: typeof detail === 'string' ? detail : fallback};
}

export async function directoryRequest(action: 'archive-list'|'archive-reinstate'|'archive-hold'|'list'|'create'|'import'|'revoke'|'restore'|'update'|'archive', id?: string, data?: unknown) {
    if (!['archive-list','archive-reinstate','archive-hold','list','create','import','revoke','restore','update','archive'].includes(action)) return {error:'Unknown directory action.'};
    if (['revoke','restore','update','archive','archive-hold','archive-reinstate'].includes(action) && !z.string().uuid().safeParse(id).success) return {error:'Invalid account.'};
    try {
        const headers = await caretakerHeaders();
        if (action === 'archive-reinstate') return (await api.patch(`users/${id}/archive/reinstate`, {}, {headers, timeout:15000})).data;
        if (action === 'archive-hold') return (await api.patch(`users/${id}/archive/hold`, {}, {headers, timeout:15000})).data;
        if (action === 'archive-list') return (await api.get('users/archive', {headers, timeout:15000})).data;
        if (action === 'list') return (await api.get('landlords/', {headers, timeout:15000})).data;
        if (action === 'create') return (await api.post('landlords/', data, {headers, timeout:15000})).data;
        if (action === 'import') return (await api.post('landlords/import', data, {headers, timeout:15000})).data;
        if (action === 'archive' || action === 'revoke') {
            const reason = z.string().trim().min(1).max(500).safeParse(data);
            if (!reason.success) return {error:'Enter a suspension reason of 1 to 500 characters.'};
            const body = {reason: reason.data};
            if (action === 'archive') return (await api.patch(`users/${id}/archive`, body, {headers, timeout:15000})).data;
            return (await api.patch(`users/${id}/status`, {is_revoked: true, ...body}, {headers, timeout:15000})).data;
        }
        if (action === 'restore') {
            return (await api.patch(`users/${id}/status`, {is_revoked: false}, {headers, timeout:15000})).data;
        }
        const parsed = z.object({full_name:z.string().min(1).optional(),email:z.string().email().optional(),house_number:z.string().nullable().optional(),street_name:z.string().nullable().optional(),phone:z.string().max(40).nullable().optional(),reset_password:z.boolean().optional()}).parse(data);
        return (await api.patch(`users/${id}`, parsed, {headers, timeout:15000})).data;
    } catch (error) {
        return failure(error, 'Unable to complete the resident directory request. Please retry.');
    }
}

export async function uploadLandlordFile(form: FormData) {
    const file = form.get('file');
    if (!(file instanceof File) || file.size > 5 * 1024 * 1024) return {error:'Choose a spreadsheet up to 5 MB.'};
    try {
        const headers = await caretakerHeaders();
        const base = api.defaults.baseURL!;
        const response = await fetch(new URL('landlords/import-file', base.endsWith('/') ? base : base+'/'), {
            method:'POST', headers, body:form, cache:'no-store', signal:AbortSignal.timeout(60000),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return {error: typeof data.detail === 'string' ? data.detail : 'Check the spreadsheet columns and values.'};
        return data;
    } catch {
        return {error:'Could not upload the file. Check your connection and retry.'};
    }
}
export async function getImportBatches(offset = 0) {
    const headers = await caretakerHeaders();
    return (await api.get('landlords/import-batches', {headers, params:{offset}})).data;
}
export async function getImportProblems(batchId: string) {
    const headers = await caretakerHeaders();
    if (!z.string().uuid().safeParse(batchId).success) throw new Error('Invalid import.');
    return (await api.get('landlords/onboarding-jobs', {headers, params:{batch_id:batchId, problems:true}})).data;
}
export async function retryImportBatch(batchId: string) {
    const headers = await caretakerHeaders();
    if (!z.string().uuid().safeParse(batchId).success) throw new Error('Invalid import.');
    return (await api.post(`landlords/import-batches/${batchId}/retry`, {}, {headers})).data;
}

export async function getLandlordImportFiles(offset = 0) {
    const headers = await caretakerHeaders();
    return (await api.get('landlords/import-files', {headers, params:{offset}})).data;
}
export async function deleteLandlordImportFile(id: string) {
    if (!z.string().uuid().safeParse(id).success) return {error:'Invalid import file.'};
    try {
        const headers = await caretakerHeaders();
        await api.delete(`landlords/import-files/${id}`, {headers});
        return {success:true};
    } catch (error) {
        return failure(error, 'Unable to delete the import file.');
    }
}
export async function downloadLandlordImportFile(id: string) {
    const headers = await caretakerHeaders();
    if (!z.string().uuid().safeParse(id).success) throw new Error('Invalid import file.');
    const base=api.defaults.baseURL!;
    const response=await fetch(new URL(`landlords/import-files/${id}/download`,base.endsWith('/')?base:base+'/'),{headers,cache:'no-store'});
    if(!response.ok)throw new Error('Unable to download this import file.');
    return {base64:Buffer.from(await response.arrayBuffer()).toString('base64'),contentType:response.headers.get('content-type')||'application/octet-stream'};
}
