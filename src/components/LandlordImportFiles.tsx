'use client';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {getLandlordImportFiles,downloadLandlordImportFile,deleteLandlordImportFile} from '@/actions/directory';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';

type ImportFile={id:string;filename:string;size_bytes:number;batch_id:string;created_at:string;pending_jobs:number;can_delete:boolean};
export function LandlordImportFiles({version=0}:{version?:number}) {
    const [offset,setOffset]=useState(0);
    const [busy,setBusy]=useState<string|null>(null);
    const [error,setError]=useState('');
    const [deleting,setDeleting]=useState<ImportFile|null>(null);
    const q=useQuery<ImportFile[]>({queryKey:['landlord-import-files',version,offset],queryFn:()=>getLandlordImportFiles(offset)});
    async function download(file:ImportFile) {
        setBusy(file.id);setError('');
        try {
            const result=await downloadLandlordImportFile(file.id);
            const bytes=Uint8Array.from(atob(result.base64),c=>c.charCodeAt(0));
            const url=URL.createObjectURL(new Blob([bytes],{type:result.contentType}));
            const a=document.createElement('a');a.href=url;a.download=file.filename;
            document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
        } catch {setError('Unable to download this file. Refresh the list and retry.');}
        finally {setBusy(null);}
    }
    async function remove() {
        if(!deleting)return;
        setBusy(deleting.id);setError('');
        try {const r=await deleteLandlordImportFile(deleting.id);if('error' in r)throw new Error(r.error);setDeleting(null);await q.refetch();}
        catch(e) {setDeleting(null);setError(e instanceof Error?e.message:'Unable to delete this file.');}
        finally {setBusy(null);}
    }
    return <div className="space-y-3 border-t pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Saved import files</h3><p className="text-sm text-muted-foreground">Original spreadsheets stay private to your estate until you delete them. Deletion is available when processing finishes.</p></div><Button variant="outline" disabled={q.isFetching} onClick={()=>q.refetch()}>Refresh files</Button></div>
        {(error||q.isError)&&<p role="alert" className="text-sm text-destructive">{error||'Unable to load saved files. Refresh to retry.'}</p>}
        {q.isError?null:q.isLoading?<p role="status">Loading saved files…</p>:!q.data?.length?<p className="text-sm text-muted-foreground">No saved import files.</p>:<ul className="divide-y">{q.data.map(file=><li key={file.id} className="flex flex-wrap justify-between items-center gap-3 py-3"><div className="min-w-0"><p className="font-medium break-all">{file.filename}</p><p className="text-xs text-muted-foreground">{(file.size_bytes/1024).toFixed(1)} KB · Uploaded {new Date(file.created_at+'Z').toLocaleString()}</p><p className="text-sm text-muted-foreground">{file.pending_jobs?`${file.pending_jobs} rows still importing`:'Import finished · see the result above'}</p></div><div className="flex gap-2"><Button variant="outline" disabled={busy!==null} onClick={()=>download(file)}>{busy===file.id?'Working…':'Download'}</Button><Button variant="outline" disabled={busy!==null||!file.can_delete} onClick={()=>setDeleting(file)}>Delete file</Button></div></li>)}</ul>}
        <div className="flex gap-2"><Button variant="outline" disabled={!offset} onClick={()=>setOffset(Math.max(0,offset-50))}>Previous files</Button><Button variant="outline" disabled={(q.data?.length??0)<50} onClick={()=>setOffset(offset+50)}>Older files</Button></div>
        <Dialog open={!!deleting} onOpenChange={open=>{if(!open&&!busy)setDeleting(null);}}><DialogContent><DialogTitle>Delete this import file?</DialogTitle><DialogDescription>Delete “{deleting?.filename}” from saved files? Imported accounts and import results will remain. The original file will no longer be downloadable.</DialogDescription><div className="flex justify-end gap-2"><Button variant="outline" disabled={!!busy} onClick={()=>setDeleting(null)}>Keep file</Button><Button variant="destructive" disabled={!!busy} onClick={remove}>{busy?'Deleting…':'Delete file'}</Button></div></DialogContent></Dialog>
    </div>;
}
