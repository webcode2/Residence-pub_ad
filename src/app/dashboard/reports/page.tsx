"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Plus, ShieldCheck, MapPin, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { listReports, triageReport, createReport } from '@/actions/community';
import type { IncidentReport, ReportSeverity, ReportStatus } from '@/actions/community';

const statuses: ReportStatus[] = ['open', 'investigating', 'resolved'];
const field = 'w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm';
const severityStyle: Record<ReportSeverity, string> = { low: 'bg-muted text-muted-foreground', medium: 'bg-amber-50 text-amber-800', high: 'bg-red-50 text-red-700' };
const statusStyle: Record<ReportStatus, string> = { open: 'bg-red-50 text-red-700', investigating: 'bg-amber-50 text-amber-800', resolved: 'bg-[#edf2e6] text-[#516c40]' };
const blank = { title: '', description: '', location: '', severity: 'low' as ReportSeverity, is_anonymous: false };

function Pill({ className, children }: { className: string; children: React.ReactNode }) {
    return <span className={`inline-block rounded-full px-2.5 py-1 text-xs capitalize whitespace-nowrap ${className}`}>{children}</span>;
}

export default function IncidentReports() {
    const cache = useQueryClient();
    const [status, setStatus] = useState(''), [severity, setSeverity] = useState(''), [offset, setOffset] = useState(0);
    const [selected, setSelected] = useState<IncidentReport | null>(null), [note, setNote] = useState(''), [next, setNext] = useState<ReportStatus>('open');
    const [creating, setCreating] = useState(false), [draft, setDraft] = useState(blank);
    const [saving, setSaving] = useState(false), [error, setError] = useState('');
    const query = useQuery({ queryKey: ['incident-reports', status, severity, offset], retry: false, refetchOnWindowFocus: false,
        queryFn: async () => { const r = await listReports({ status, severity, offset }); if (!r.data) throw new Error(r.error); return r.data; } });
    const refresh = () => cache.invalidateQueries({ queryKey: ['incident-reports'] });

    function open(report: IncidentReport) { setSelected(report); setNext(report.status); setNote(report.resolution_note || ''); setError(''); }
    async function run(action: () => Promise<{ error?: string }>, done: () => void) {
        setSaving(true); setError('');
        try { const r = await action(); if (r.error) { setError(r.error); return; } done(); await refresh(); } finally { setSaving(false); }
    }
    const counts = query.data?.counts;
    const reports = query.data?.reports ?? [];

    return <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Estate safety</p><h1 className="mt-2 text-3xl font-semibold">Incident reports</h1><p className="mt-2 text-sm text-muted-foreground">Reports filed by residents, hosts / property owners and guards from the app. Reporters are notified when you change a report’s status.</p></div>
            <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={query.isFetching} onClick={() => query.refetch()}><RefreshCw size={16} className={query.isFetching ? 'mr-2 animate-spin' : 'mr-2'} />Refresh</Button><Button variant="outline" asChild><Link href="/dashboard/notifications"><Megaphone size={16} className="mr-2" />Send announcement</Link></Button><Button onClick={() => { setDraft(blank); setError(''); setCreating(true); }}><Plus size={16} className="mr-2" />Log incident</Button></div>
        </div>
        <div role="group" aria-label="Incident report status" className="grid grid-cols-3 divide-x overflow-hidden rounded-xl border bg-card">{statuses.map(s => <button key={s} onClick={() => { setStatus(status === s ? '' : s); setOffset(0); }} aria-pressed={status === s}
            className={`p-3 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-5 ${status === s ? 'bg-muted' : ''}`}><p className="text-xs capitalize text-muted-foreground">{s}</p><p className="mt-3 text-3xl font-medium tabular-nums">{counts ? counts[s] : '—'}</p></button>)}</div>
        <div className="flex flex-wrap gap-3">
            <select aria-label="Filter by severity" value={severity} onChange={e => { setSeverity(e.target.value); setOffset(0); }} className="rounded-md border border-input bg-card px-3 py-2.5 text-sm"><option value="">All severities</option>{['low', 'medium', 'high'].map(s => <option key={s} value={s}>{s}</option>)}</select>
        </div>
        {query.error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{query.error.message}</p>}
        <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full text-left text-sm"><thead className="border-b bg-muted/40"><tr>{['Reported', 'Incident', 'Severity', 'Status', ''].map(h => <th key={h} className="p-4 font-medium">{h}</th>)}</tr></thead><tbody>
            {query.isLoading ? <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading reports…</td></tr>
            : reports.length === 0 ? <tr><td colSpan={5} className="p-10 text-center text-muted-foreground"><ShieldCheck className="mx-auto mb-3" />No incident reports match these filters.</td></tr>
            : reports.map(r => <tr key={r.id} className="border-b last:border-0 align-top">
                <td className="p-4 whitespace-nowrap"><p>{new Date(r.created_at).toLocaleString()}</p><p className="mt-1 text-xs text-muted-foreground">{r.reported_by_name} · <span className="capitalize">{r.reporter_role}</span></p></td>
                <td className="p-4 max-w-md"><p className="font-medium">{r.title}</p><p className="mt-1 text-muted-foreground line-clamp-2">{r.description}</p><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} />{r.location}</p></td>
                <td className="p-4"><Pill className={severityStyle[r.severity]}>{r.severity}</Pill></td>
                <td className="p-4"><Pill className={statusStyle[r.status]}>{r.status}</Pill></td>
                <td className="p-4 text-right"><Button variant="outline" size="sm" onClick={() => open(r)}>Review</Button></td>
            </tr>)}
        </tbody></table><div className="flex justify-end gap-2 border-t p-4"><Button variant="outline" disabled={query.isFetching || offset === 0} onClick={() => setOffset(v => Math.max(0, v - 50))}>Previous</Button><Button variant="outline" disabled={query.isFetching || !query.data?.has_more} onClick={() => setOffset(v => v + 50)}>Next</Button></div></div>

        <Dialog open={selected !== null} onOpenChange={o => { if (!saving && !o) setSelected(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{selected?.title}</DialogTitle><DialogDescription>{selected && `${selected.reported_by_name} · ${selected.location} · ${new Date(selected.created_at).toLocaleString()}`}</DialogDescription></DialogHeader>
            <p className="whitespace-pre-wrap text-sm">{selected?.description}</p>
            {selected && <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium">Reporter identity</p>
                <p>{selected.reporter_identity || selected.reporter_id || 'Account unavailable'}</p>
                {selected.is_anonymous && <p className="mt-1 text-xs text-muted-foreground">Filed anonymously. Reporter identity is visible only to authorized estate staff.</p>}
            </div>}
            <label className="text-sm font-medium">Status<select value={next} onChange={e => setNext(e.target.value as ReportStatus)} className={`${field} mt-2 capitalize`}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
            <label className="text-sm font-medium">Note for the record<Textarea className="mt-2" maxLength={1000} value={note} onChange={e => setNote(e.target.value)} placeholder="What was done, or what happens next" /></label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <Button disabled={saving} onClick={() => selected && void run(() => triageReport(selected.id, { status: next, resolution_note: note }), () => setSelected(null))}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogContent></Dialog>

        <Dialog open={creating} onOpenChange={o => { if (!saving && !o) setCreating(false); }}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Log an incident</DialogTitle><DialogDescription>Record an incident you observed or were told about. It appears in this list as filed by you.</DialogDescription></DialogHeader>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); void run(() => createReport(draft), () => setCreating(false)); }}>
                <label className="block text-sm font-medium">Title<input required minLength={3} maxLength={120} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} className={`${field} mt-2`} /></label>
                <label className="block text-sm font-medium">Location<input required minLength={2} maxLength={200} value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })} className={`${field} mt-2`} placeholder="e.g. North gate" /></label>
                <label className="block text-sm font-medium">Severity<select value={draft.severity} onChange={e => setDraft({ ...draft, severity: e.target.value as ReportSeverity })} className={`${field} mt-2 capitalize`}>{['low', 'medium', 'high'].map(s => <option key={s} value={s}>{s}</option>)}</select></label>
                <label className="block text-sm font-medium">What happened<Textarea required minLength={10} maxLength={2000} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} className="mt-2" /></label>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                <Button className="w-full" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Log incident'}</Button>
            </form>
        </DialogContent></Dialog>
    </div>;
}
