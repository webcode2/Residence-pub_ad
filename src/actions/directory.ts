"use server";
import api from '@/lib/api';
import { caretakerHeaders } from '@/lib/caretaker';
import { z } from 'zod';
export async function directoryRequest(action: 'list'|'import'|'revoke'|'update'|'delete', id?: string, data?: unknown) {
    if (!['list','import','revoke','update','delete'].includes(action)) throw new Error('Unknown directory action.');
    const headers = await caretakerHeaders();
    if (['revoke','update','delete'].includes(action) && !z.string().uuid().safeParse(id).success) throw new Error('Invalid account.');
    try {
        if (action === 'list') return (await api.get('landlords/', {headers, timeout:15000})).data;
        if (action === 'import') return (await api.post('landlords/import', data, {headers, timeout:15000})).data;
        if (action === 'delete') { await api.delete(`users/${id}`, {headers, timeout:15000}); return {success:true}; }
        const parsed = action === 'revoke' ? {is_revoked:true} : z.object({full_name:z.string().min(1).optional(),email:z.string().email().optional(),house_number:z.string().nullable().optional(),street_name:z.string().nullable().optional()}).parse(data);
        return (await api.patch(`users/${id}`, parsed, {headers, timeout:15000})).data;
    } catch { throw new Error('Unable to complete the resident directory request. Please retry.'); }
}

export async function uploadLandlordFile(form: FormData) {
    const headers = await caretakerHeaders();
    const file = form.get('file');
    if (!(file instanceof File) || file.size > 5 * 1024 * 1024) throw new Error('Choose a spreadsheet up to 5 MB.');
    const base = api.defaults.baseURL!;
    const response = await fetch(new URL('landlords/import-file', base.endsWith('/') ? base : base+'/'), {
        method:'POST', headers, body:form, cache:'no-store',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Check the spreadsheet columns and values.');
    return data;
}
export async function getOnboardingJobs(offset = 0) {
    const headers = await caretakerHeaders();
    return (await api.get('landlords/onboarding-jobs', {headers, params:{offset}})).data;
}
export async function retryOnboardingJob(id: string) {
    const headers = await caretakerHeaders();
    if (!z.string().uuid().safeParse(id).success) throw new Error('Invalid job.');
    return (await api.post(`landlords/onboarding-jobs/${id}/retry`, {}, {headers})).data;
}

export async function getLandlordImportFiles(offset = 0) {
    const headers = await caretakerHeaders();
    return (await api.get('landlords/import-files', {headers, params:{offset}})).data;
}
export async function deleteLandlordImportFile(id: string) {
    const headers = await caretakerHeaders();
    if (!z.string().uuid().safeParse(id).success) throw new Error('Invalid import file.');
    try {await api.delete(`landlords/import-files/${id}`, {headers});}
    catch(error: unknown) {
        const result=error as {response?:{data?:{detail?:string}}};
        throw new Error(result.response?.data?.detail || 'Unable to delete the import file.');
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
