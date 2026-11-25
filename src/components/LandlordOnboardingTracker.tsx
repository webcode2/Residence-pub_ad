'use client';
import {useEffect,useRef,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {getImportBatches,getImportProblems,retryImportBatch} from '@/actions/directory';
import {LandlordImportFiles} from '@/components/LandlordImportFiles';
import {Button} from '@/components/ui/button';

type Batch = {batch_id:string;filename:string|null;created_at:string;total:number;completed:number;added:number;skipped:number;failed:number;retrying:number;status:'processing'|'needs_attention'|'completed'};
type Problem = {id:string;email:string;full_name:string;house_number:string;status:string;last_error:string|null};
const PAGE_SIZE=20;

function useImportBatches(version:number,offset=0){
    return useQuery<Batch[]>({queryKey:['landlord-import-batches',version,offset],queryFn:()=>getImportBatches(offset),retry:false,
        refetchInterval:query=>(query.state.data??[]).some(b=>b.status==='processing')?3000:false});
}

const STATUS_LABEL={processing:'Importing',needs_attention:'Needs attention',completed:'Completed'} as const;
const STATUS_STYLE={processing:'text-primary',needs_attention:'text-destructive',completed:'text-muted-foreground'} as const;

function result(b:Batch){
    return [`${b.added} added`,b.skipped&&`${b.skipped} already in directory`,b.failed&&`${b.failed} failed`].filter(Boolean).join(' · ');
}

/** One-line status for the directory page, so the import can be followed after closing the dialog. */
export function LandlordImportStatus({version=0,onOpen,onFinished}:{version?:number;onOpen:()=>void;onFinished:()=>void}){
    const {data=[]}=useImportBatches(version);
    const active=data.filter(b=>b.status==='processing');
    const attention=data.filter(b=>b.status==='needs_attention');
    const wasActive=useRef(0);
    useEffect(()=>{if(wasActive.current>active.length)onFinished();wasActive.current=active.length;},[active.length,onFinished]);
    if(!active.length&&!attention.length)return null;
    const total=active.reduce((sum,b)=>sum+b.total,0);const completed=active.reduce((sum,b)=>sum+b.completed,0);
    const failed=attention.reduce((sum,b)=>sum+b.failed,0);
    return <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
        <span>{active.length?`Importing hosts / property owners: ${completed} of ${total} done`:`${failed} ${failed===1?'host / property owner':'hosts / property owners'} could not be imported`}</span>
        <Button variant="outline" size="sm" onClick={onOpen}>{active.length?'View status':'Review and retry'}</Button>
    </div>;
}

function BatchCard({batch,onChanged}:{batch:Batch;onChanged:()=>Promise<unknown>}){
    const [open,setOpen]=useState(false);
    const [busy,setBusy]=useState(false);
    const [error,setError]=useState('');
    const problems=useQuery<Problem[]>({queryKey:['landlord-import-problems',batch.batch_id,batch.completed,batch.retrying],queryFn:()=>getImportProblems(batch.batch_id),enabled:open,retry:false});
    const unfinished=batch.failed+batch.retrying;
    const percent=Math.round(batch.completed/batch.total*100);
    const hasDetails=batch.failed+batch.skipped+batch.retrying>0;
    async function retry(){
        setBusy(true);setError('');
        try{await retryImportBatch(batch.batch_id);await onChanged();}
        catch{setError('Unable to retry this import. Refresh and try again.');}
        finally{setBusy(false);}
    }
    return <li className="rounded-lg border p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><p className="font-medium break-all">{batch.filename??'Host / Property Owner import'}</p><p className="text-xs text-muted-foreground">{new Date(batch.created_at+'Z').toLocaleString()}</p></div>
            <span className={`text-sm font-medium ${STATUS_STYLE[batch.status]}`}>{STATUS_LABEL[batch.status]}</span>
        </div>
        <div role="progressbar" aria-label={`Import progress for ${batch.filename??'host / property owner import'}`} aria-valuemin={0} aria-valuemax={batch.total} aria-valuenow={batch.completed} className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{width:`${percent}%`}}/></div>
        <p className="text-sm"><span className="tabular-nums">{batch.completed} of {batch.total}</span> rows done · {result(batch)}{batch.retrying>0&&<span className="text-muted-foreground"> · {batch.retrying} retrying automatically</span>}</p>
        {batch.status==='needs_attention'&&<p className="text-xs text-muted-foreground">Retry continues from the rows that failed. To correct details, fix the spreadsheet and upload it again; finished rows are not repeated.</p>}
        {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
        {(unfinished>0||hasDetails)&&<div className="flex flex-wrap gap-2">
            {unfinished>0&&<Button variant="outline" size="sm" disabled={busy} onClick={retry}>{busy?'Retrying…':`Retry ${unfinished} unfinished`}</Button>}
            {hasDetails&&<Button variant="ghost" size="sm" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Hide details':'View details'}</Button>}
        </div>}
        {open&&(problems.isError?<p role="alert" className="text-sm text-destructive">Could not load the details. Try again.</p>
            :problems.isLoading?<p role="status" className="text-sm text-muted-foreground">Loading details…</p>
            :<ul className="divide-y text-sm">{problems.data?.map(p=><li key={p.id} className="py-2"><p>{p.full_name} · {p.house_number} <span className="text-muted-foreground">{p.email}</span></p><p className="text-xs text-muted-foreground">{p.last_error??'Already in your directory'}</p></li>)}</ul>)}
    </li>;
}

export function LandlordOnboardingTracker({version=0}:{version?:number}) {
    const [offset,setOffset]=useState(0);
    const q=useImportBatches(version,offset);
    useEffect(()=>setOffset(0),[version]);
    const batches=q.data??[];
    return <section aria-label="Host / Property Owner import status" className="space-y-4">
        <p className="text-sm text-muted-foreground">Imports keep running if you close this window, and pick up where they stopped after an interruption.</p>
        {q.isError?<p role="alert" className="text-sm text-destructive">Could not load imports. Refresh to retry.</p>
            :q.isLoading?<p role="status" className="text-sm text-muted-foreground">Loading imports…</p>
            :!batches.length?<p className="text-sm text-muted-foreground">No imports yet.</p>
            :<ul className="space-y-3">{batches.map(b=><BatchCard key={b.batch_id} batch={b} onChanged={q.refetch}/>)}</ul>}
        {(offset>0||batches.length===PAGE_SIZE)&&<div className="flex gap-2"><Button variant="outline" size="sm" disabled={!offset} onClick={()=>setOffset(Math.max(0,offset-PAGE_SIZE))}>Newer imports</Button><Button variant="outline" size="sm" disabled={batches.length<PAGE_SIZE} onClick={()=>setOffset(offset+PAGE_SIZE)}>Older imports</Button></div>}
        {batches.length>0&&<LandlordImportFiles version={version}/>}
    </section>;
}
