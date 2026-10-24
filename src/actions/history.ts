'use server';
import api from '@/lib/api';
import {caretakerHeaders} from '@/lib/caretaker';

type Filters={start_at?:string;end_at?:string;status?:string};
export type HistoryJob={id:string;kind:'export'|'purge';status:string;actor_email:string;start_at:string;end_at:string;preview_count:number;processed_count:number;last_error:string|null;can_download:boolean;created_at:string;expires_at:string|null;confirmed_at:string|null};
function message(error:unknown) {const e=error as {response?:{data?:{detail?:unknown}}};return typeof e.response?.data?.detail==='string'?e.response.data.detail:'Unable to complete this history request. Please retry.';}
export async function getHistoryJobs():Promise<HistoryJob[]> {return (await api.get('access-logs/jobs',{headers:await caretakerHeaders()})).data;}
export async function startHistoryJob(kind:'export'|'purge',filters:Filters) {
    try {return {data:(await api.post(kind==='export'?'access-logs/exports':'access-logs/purge-preview',filters,{headers:await caretakerHeaders()})).data as HistoryJob};}
    catch(e){return {error:message(e)};}
}
export async function confirmHistoryPurge(id:string,confirmation:string) {
    if(!/^[0-9a-f-]{36}$/i.test(id))return {error:'Invalid history job.'};
    try {return {data:(await api.post(`access-logs/jobs/${id}/confirm`,{confirmation},{headers:await caretakerHeaders()})).data as HistoryJob};}
    catch(e){return {error:message(e)};}
}
export async function retryHistoryJob(id:string) {
    if(!/^[0-9a-f-]{36}$/i.test(id))return {error:'Invalid history job.'};
    try {return {data:(await api.post(`access-logs/jobs/${id}/retry`,{},{headers:await caretakerHeaders()})).data as HistoryJob};}
    catch(e){return {error:message(e)};}
}
