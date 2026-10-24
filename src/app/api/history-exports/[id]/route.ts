import {caretakerHeaders} from '@/lib/caretaker';
import api from '@/lib/api';
export const dynamic='force-dynamic';
export async function GET(_request:Request,context:{params:Promise<{id:string}>}) {
    const {id}=await context.params;
    if(!/^[0-9a-f-]{36}$/i.test(id))return new Response('Invalid export',{status:400});
    try {
        const headers=await caretakerHeaders();
        const base=api.defaults.baseURL!;
        const upstream=await fetch(new URL(`access-logs/jobs/${id}/download`,base.endsWith('/')?base:base+'/'),{headers,cache:'no-store'});
        if(!upstream.ok)return new Response('Export unavailable. Refresh the history job list.',{status:upstream.status,headers:{'Cache-Control':'no-store'}});
        return new Response(upstream.body,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="access-history-${id}.csv"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    }catch{return new Response('Sign in as an estate caretaker to download history.',{status:401,headers:{'Cache-Control':'no-store'}});}
}
