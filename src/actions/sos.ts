"use server";
import api from '@/lib/api';
import { caretakerHeaders } from '@/lib/caretaker';
export interface SOSAlert { id:string; sender_id:string; sender_name:string; house_location:string; status:string; created_at:string; devices_queued:number; sending_disabled:boolean; delivery:Record<string,number>; }
export interface RestrictedUser { id:string; name:string; house_location:string; reason:string; updated_at:string; }
function failure(error:unknown) {
    const response=(error as {response?:{status?:number;data?:{detail?:unknown}}}).response;
    if(response?.status===401) return 'Your session has expired. Please sign in again.';
    if(response?.status===403) return 'Estate caretaker access required.';
    return typeof response?.data?.detail==='string' ? response.data.detail : 'Unable to update SOS controls. Please retry.';
}
export async function getSOSHistory(offset=0) {
    try {
        const headers=await caretakerHeaders();
        const [history,restrictions]=await Promise.all([
            api.get<{alerts:SOSAlert[];has_more:boolean;retention_days:number}>('sos/history',{headers,params:{offset,limit:50},timeout:15000}),
            api.get<{users:RestrictedUser[]}>('sos/restrictions',{headers,timeout:15000})
        ]);
        return {data:{...history.data,restricted:restrictions.data.users}};
    } catch(error) {return {error:failure(error)};}
}
export async function setSOSRestriction(userId:string,disabled:boolean,reason:string) {
    if(!/^[0-9a-f-]{36}$/i.test(userId)||reason.trim().length<3||reason.length>500) return {error:'Provide a reason between 3 and 500 characters.'};
    try {
        await api.put(`sos/restrictions/${userId}`,{disabled,reason:reason.trim()},{headers:await caretakerHeaders(),timeout:15000});
        return {success:true};
    } catch(error) {return {error:failure(error)};}
}
