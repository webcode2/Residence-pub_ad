'use client';
import {useState,useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {getOnboardingJobs,retryOnboardingJob} from '@/actions/directory';
import {LandlordImportFiles} from '@/components/LandlordImportFiles';
import {Button} from '@/components/ui/button';

type Job = {id:string;batch_id:string;email:string;full_name:string;house_number:string;status:string;attempts:number;last_error:string|null;next_attempt_at:string|null};
export function LandlordOnboardingTracker({version=0}:{version?:number}) {
    const [offset,setOffset]=useState(0);
    const [opened,setOpened]=useState(false);
    const [dismissedVersion,setDismissedVersion]=useState(0);
    const [busy,setBusy]=useState<string|null>(null);
    const [error,setError]=useState('');
    useEffect(()=>{setOffset(0);setOpened(false);},[version]);
    const q=useQuery<Job[]>({queryKey:['landlord-onboarding',version,offset],queryFn:()=>getOnboardingJobs(offset),retry:false,refetchInterval:query=>(opened||version>dismissedVersion)&&(query.state.data??[]).some(j=>['queued','processing','retrying'].includes(j.status))?3000:false});
    async function retry(id:string) {
        setBusy(id);setError('');
        try {await retryOnboardingJob(id);await q.refetch();}
        catch {setError('Unable to retry this job. Refresh the tracker and try again.');}
        finally {setBusy(null);}
    }
    const failed=q.data?.filter(j=>['failed','retrying'].includes(j.status))??[];
    const hasResults=!!q.data?.length;
    const expanded=opened || (version>dismissedVersion && (!q.data || q.isError || q.data.some(j=>['queued','processing','failed','retrying'].includes(j.status))));
    if(!expanded) return <div className="mb-4 flex flex-wrap items-center gap-3">
        {failed.length>0&&<button type="button" onClick={()=>setOpened(true)} className="text-sm text-destructive underline">{failed.length} import jobs need attention</button>}
        <Button variant="ghost" onClick={()=>setOpened(true)}>Import history</Button>
    </div>;
    return <section aria-label="Directory import tracker" className="mb-6 rounded-xl border bg-card p-5 space-y-4">
        <div className="flex flex-wrap gap-3 justify-between items-center"><div><h2 className="font-semibold">Directory import</h2><p className="text-sm text-muted-foreground">Account creation and welcome emails run in the background. Failed jobs can be retried.</p></div><Button variant="ghost" onClick={()=>{setOpened(false);setDismissedVersion(version);}}>Close</Button><Button variant="outline" disabled={q.isFetching} onClick={()=>q.refetch()}>{q.isFetching?'Refreshing…':'Refresh tracker'}</Button></div>
        {(error||q.isError)&&<p role="alert" className="text-sm text-destructive">{error||'Could not load onboarding jobs. Refresh to retry.'}</p>}
        {q.isError?null:q.isLoading?<p role="status">Loading jobs…</p>:!q.data?.length?<p className="text-sm text-muted-foreground">No imports to display.</p>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b"><th className="p-2">Host / house</th><th className="p-2">Status</th><th className="p-2">Attempts</th><th className="p-2">Details</th><th className="p-2">Action</th></tr></thead><tbody>{q.data.map(j=><tr key={j.id} className="border-b"><td className="p-2"><div>{j.full_name} · {j.house_number}</div><div className="text-muted-foreground">{j.email}</div><div className="text-xs text-muted-foreground">Job {j.id.slice(0,8)} · Batch {j.batch_id.slice(0,8)}</div></td><td className="p-2 capitalize">{j.status==='sent'?'Welcome email accepted':j.status}</td><td className="p-2">{j.attempts}</td><td className="p-2 max-w-xs">{j.last_error||'—'}{j.status==='retrying'&&j.next_attempt_at&&<div>Next retry: {new Date(j.next_attempt_at+'Z').toLocaleString()}</div>}</td><td className="p-2">{['failed','retrying'].includes(j.status)&&<Button variant="outline" disabled={busy!==null} onClick={()=>retry(j.id)}>{busy===j.id?'Queueing…':'Retry job'}</Button>}</td></tr>)}</tbody></table></div>}
        <div className="flex gap-2"><Button variant="outline" disabled={!offset} onClick={()=>setOffset(Math.max(0,offset-100))}>Previous jobs</Button><Button variant="outline" disabled={(q.data?.length??0)<100} onClick={()=>setOffset(offset+100)}>Older jobs</Button></div>
        {opened&&hasResults&&<LandlordImportFiles version={version}/>}
    </section>;
}
