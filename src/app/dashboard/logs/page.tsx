'use client';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {Tabs,TabsContent,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {useUser} from '@/contexts/UserContext';
import {getEstateAccessLogs} from '@/actions/conversations';
import {getHistoryJobs,startHistoryJob,confirmHistoryPurge,retryHistoryJob,HistoryJob} from '@/actions/history';

const utc=(value:string)=>new Date(/Z$|[+-]\d\d:\d\d$/.test(value)?value:value+'Z').toLocaleString();
function afterDate(value:string){const date=new Date(value+'T00:00:00Z');date.setUTCDate(date.getUTCDate()+1);return date.toISOString();}
export default function AccessLogsPage(){
    const {user}=useUser();
    const [tab,setTab]=useState('history');
    const [draft,setDraft]=useState({status:'',from:'',to:''});
    const [filters,setFilters]=useState(draft);
    const [pages,setPages]=useState<string[]>(['']);
    const [before,setBefore]=useState('');
    const [error,setError]=useState('');
    const [notice,setNotice]=useState('');
    const [busy,setBusy]=useState(false);
    const [confirming,setConfirming]=useState<HistoryJob|null>(null);
    const [phrase,setPhrase]=useState('');
    const cursor=pages[pages.length-1];
    const queryFilters={status:filters.status||undefined,start_at:filters.from?filters.from+'T00:00:00Z':undefined,end_at:filters.to?afterDate(filters.to):undefined};
    const logs=useQuery({queryKey:['estate-access-logs',user?.app_id,filters,cursor],enabled:!!user?.app_id,refetchOnWindowFocus:false,retry:false,
        queryFn:async()=>{const result=await getEstateAccessLogs({...queryFilters,cursor});if(!result.data)throw new Error(result.error);return result.data;}});
    const jobs=useQuery({queryKey:['history-jobs',user?.app_id],enabled:!!user?.app_id,queryFn:getHistoryJobs,refetchOnWindowFocus:false});
    function apply(){if(draft.from&&draft.to&&draft.from>draft.to){setError('The end date must be on or after the start date.');return;}setError('');setFilters({...draft});setPages(['']);}
    async function queue(kind:'export'|'purge'){
        if(kind==='purge'&&!before){setError('Choose the date before which records should be deleted.');return;}
        setBusy(true);setError('');setNotice('');
        try {
            const result=await startHistoryJob(kind,kind==='export'?queryFilters:{end_at:before+'T00:00:00Z',status:filters.status||undefined});
            if(result.error)setError(result.error);else{setNotice(kind==='export'?'Export queued. Open Manage history to check progress.':'Purge preview queued. No records will be deleted until you confirm the completed preview.');await jobs.refetch();}
        }catch{setError('Unable to queue this history job. Please retry.');}finally{setBusy(false);}
    }
    async function confirm(){
        if(!confirming)return;setBusy(true);setError('');
        try{const result=await confirmHistoryPurge(confirming.id,phrase);if(result.error)setError(result.error);else{setConfirming(null);setPhrase('');setPages(['']);setNotice('Purge queued. Refresh jobs to see the final deleted count.');await jobs.refetch();}}
        catch{setError('Unable to confirm this purge. Please retry.');}finally{setBusy(false);}
    }
    async function retry(id:string){setBusy(true);setError('');try{const result=await retryHistoryJob(id);if(result.error)setError(result.error);else await jobs.refetch();}catch{setError('Unable to retry this job.');}finally{setBusy(false);}}
    return <div className="space-y-6">
        <header className="flex flex-wrap justify-between items-end gap-4"><div><p className="text-xs tracking-widest text-muted-foreground">ESTATE ACTIVITY</p><h1 className="text-3xl font-medium mt-2">Access history</h1><p className="text-sm text-muted-foreground mt-2">Review, export and manage your estate’s gate verification records.</p></div></header>
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList aria-label="Access log sections">
                <TabsTrigger value="history">Access history</TabsTrigger>
                <TabsTrigger value="manage">Manage history</TabsTrigger>
            </TabsList>
            {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{notice&&<p role="status" className="text-sm">{notice}</p>}
            <TabsContent value="history" className="space-y-6">
                <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={()=>setTab('manage')}>View history jobs</Button>
                    <Button variant="outline" disabled={logs.isFetching} onClick={()=>{setPages(['']);logs.refetch();}}>Refresh history</Button>
                </div>
                <section className="rounded-xl border bg-card p-5 space-y-4" aria-label="History filters">
                    <div className="flex flex-wrap gap-4 items-end"><label className="text-sm space-y-2">Status<select className="block border rounded-md bg-background p-2" value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}><option value="">All events</option><option value="authorized">Authorized</option><option value="denied">Denied</option></select></label><label className="text-sm space-y-2">From date (UTC)<input type="date" className="block border rounded-md bg-background p-2" value={draft.from} onChange={e=>setDraft({...draft,from:e.target.value})}/></label><label className="text-sm space-y-2">Through date (UTC)<input type="date" className="block border rounded-md bg-background p-2" value={draft.to} onChange={e=>setDraft({...draft,to:e.target.value})}/></label><Button variant="outline" onClick={apply}>Apply filters</Button><Button disabled={busy||!logs.data} onClick={()=>queue('export')}>Export filtered CSV</Button></div>
                    {logs.data&&<p className="text-sm text-muted-foreground">Your plan includes {logs.data.log_retention_days} days of access history. CSV exports open in Excel and remain downloadable for 24 hours.</p>}
                </section>
                <section className="rounded-xl border bg-card overflow-hidden" aria-label="Access events">
                    {logs.isLoading&&<p role="status" className="p-6">Loading history…</p>}{logs.isError&&<p role="alert" className="p-6 text-destructive">{logs.error.message}</p>}
                    {logs.data?.logs.length===0&&<p className="p-10 text-center text-muted-foreground">No access events match these filters.</p>}
                    {!!logs.data?.logs.length&&<div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-muted/40"><tr>{['Date & time','Person / identifier','Event','Status'].map(label=><th key={label} className="px-5 py-4 font-medium">{label}</th>)}</tr></thead><tbody>{logs.data.logs.map(log=><tr key={log.id} className="border-t"><td className="px-5 py-4 whitespace-nowrap">{utc(log.created_at)}</td><td className="px-5 py-4"><p>{log.visitor_name||'Resident / visitor'}</p><p className="text-xs text-muted-foreground">{log.identifier}</p></td><td className="px-5 py-4">{log.event_type.replaceAll('_',' ')}</td><td className="px-5 py-4 capitalize">{log.status}</td></tr>)}</tbody></table></div>}
                    <div className="border-t flex items-center justify-between p-4"><Button variant="outline" disabled={pages.length===1||logs.isFetching} onClick={()=>setPages(p=>p.slice(0,-1))}>Previous</Button><span className="text-sm">Page {pages.length}</span><Button variant="outline" disabled={!logs.data?.next_cursor||logs.isFetching} onClick={()=>{if(logs.data?.next_cursor)setPages(p=>[...p,logs.data!.next_cursor!]);}}>Next</Button></div>
                </section>
            </TabsContent>
            <TabsContent value="manage" className="space-y-6">
                <section className="rounded-xl border bg-card p-5 space-y-4" aria-label="Purge access history"><h2 className="font-semibold">Delete older access history</h2><p className="text-sm text-muted-foreground">Preview the affected count before deleting {filters.status||'all'} access records dated before your chosen cutoff. Accounts and conversations are preserved.</p><div className="flex flex-wrap gap-3 items-end"><label className="text-sm">Delete records before (UTC)<input type="date" className="block border rounded-md bg-background p-2 mt-2" max={new Date().toISOString().slice(0,10)} value={before} onChange={e=>setBefore(e.target.value)}/></label><Button variant="outline" disabled={busy||!before} onClick={()=>queue('purge')}>Preview purge</Button></div></section>
                <section className="rounded-xl border bg-card p-5 space-y-4" aria-label="History job tracker"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">Exports and purge jobs</h2><p className="text-sm text-muted-foreground">Jobs continue in the background. Refresh to check progress or download completed exports.</p></div><Button variant="outline" disabled={jobs.isFetching} onClick={()=>{jobs.refetch();logs.refetch();}}>Refresh jobs</Button></div>{jobs.isError&&<p role="alert">Unable to load history jobs. Refresh to retry.</p>}{!jobs.data?.length&&<p className="text-sm text-muted-foreground">No history jobs yet.</p>}<ul className="divide-y">{jobs.data?.map(job=><li key={job.id} className="py-4 flex flex-wrap justify-between gap-3"><div><p className="font-medium capitalize">{job.kind} · {job.status.replaceAll('_',' ')}</p><p className="text-sm text-muted-foreground">{job.kind==='purge'&&!job.confirmed_at?`${job.preview_count} in preview`:`${job.processed_count} ${job.kind==='purge'?'deleted':'exported'}`} · {job.actor_email}</p><p className="text-xs text-muted-foreground">{utc(job.start_at)} — {utc(job.end_at)} · Job {job.id.slice(0,8)}</p>{job.last_error&&<p className="text-sm text-destructive">{job.last_error}</p>}</div><div className="flex flex-wrap gap-2 items-center">{job.can_download&&<Button variant="outline" asChild><a href={`/api/history-exports/${job.id}`} download>Download CSV</a></Button>}{job.status==='awaiting_confirmation'&&job.actor_email===user?.email&&<Button variant="destructive" disabled={busy} onClick={()=>{setConfirming(job);setPhrase('');}}>Review deletion</Button>}{job.status==='failed'&&<Button variant="outline" disabled={busy} onClick={()=>retry(job.id)}>Retry job</Button>}</div></li>)}</ul></section>
            </TabsContent>
        </Tabs>
        <Dialog open={!!confirming} onOpenChange={open=>{if(!open&&!busy){setConfirming(null);setPhrase('');}}}><DialogContent><DialogTitle>Confirm history deletion</DialogTitle><DialogDescription>Preview: {confirming?.preview_count} matching access records before {confirming?utc(confirming.end_at):''}. This permanently deletes matching records and invalidates older exports. The final count is recorded in the job history. Accounts and conversations remain.</DialogDescription><label className="text-sm">Type PURGE to confirm<input className="block w-full border rounded-md bg-background p-3 mt-2" value={phrase} onChange={e=>setPhrase(e.target.value)} autoComplete="off"/></label><div className="flex justify-end gap-3"><Button variant="outline" disabled={busy} onClick={()=>setConfirming(null)}>Cancel</Button><Button variant="destructive" disabled={busy||phrase!=='PURGE'} onClick={confirm}>{busy?'Queueing…':'Permanently delete'}</Button></div></DialogContent></Dialog>
    </div>;
}
