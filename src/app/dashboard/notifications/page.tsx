"use client";
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Megaphone, AlertTriangle, Wrench, Shield, Send, RefreshCw, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { listAnnouncements, sendAnnouncement } from '@/actions/community';

type Category = 'general' | 'alert' | 'maintenance' | 'security';
type Audience = 'all' | 'resident' | 'landlord' | 'security';
const categories: { value: Category; label: string; icon: typeof Megaphone }[] = [
    { value: 'general', label: 'General', icon: Megaphone }, { value: 'alert', label: 'Alert', icon: AlertTriangle },
    { value: 'maintenance', label: 'Maintenance', icon: Wrench }, { value: 'security', label: 'Security', icon: Shield },
];
const audiences: { value: Audience; label: string }[] = [
    { value: 'all', label: 'Everyone in the estate' }, { value: 'resident', label: 'Residents' },
    { value: 'landlord', label: 'Hosts / Property Owners' }, { value: 'security', label: 'Security staff' },
];
const field = 'w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm';

export default function Announcements() {
    const cache = useQueryClient();
    const [title, setTitle] = useState(''), [body, setBody] = useState('');
    const [category, setCategory] = useState<Category>('general'), [audience, setAudience] = useState<Audience>('all');
    const [sending, setSending] = useState(false), [offset, setOffset] = useState(0);
    const history = useQuery({ queryKey: ['announcements', offset], retry: false, refetchOnWindowFocus: false,
        queryFn: async () => { const r = await listAnnouncements(offset); if (!r.data) throw new Error(r.error); return r.data; } });
    const canSend = title.trim().length >= 3 && body.trim().length >= 3 && !sending;

    async function send(event: React.FormEvent) {
        event.preventDefault();
        if (!canSend) return;
        setSending(true);
        try {
            const r = await sendAnnouncement({ title, body, category, audience });
            if (!r.data) { toast.error(r.error); return; }
            toast.success(`Announcement delivered to ${r.data.recipient_count} inbox${r.data.recipient_count === 1 ? '' : 'es'}.`);
            setTitle(''); setBody(''); setCategory('general'); setAudience('all'); setOffset(0);
            await cache.invalidateQueries({ queryKey: ['announcements'] });
        } finally { setSending(false); }
    }

    return <div className="mx-auto w-full max-w-7xl space-y-6">
        <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Estate community</p><h1 className="mt-2 text-3xl font-semibold">Announcements</h1><p className="mt-2 text-sm text-muted-foreground">Messages land in each recipient’s in-app inbox and are pushed to their registered phones.</p></div>
        <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <form onSubmit={send} className="space-y-5 rounded-xl border bg-card p-6">
                <fieldset><legend className="text-sm font-medium">Type</legend><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{categories.map(c => <label key={c.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${category === c.value ? 'border-[#7a9563] bg-[#eef3e7] font-medium' : 'border-border hover:bg-muted'}`}>
                    <input type="radio" name="category" value={c.value} checked={category === c.value} onChange={() => setCategory(c.value)} className="sr-only" /><c.icon size={15} />{c.label}</label>)}</div></fieldset>
                <label className="block text-sm font-medium">Send to<select value={audience} onChange={e => setAudience(e.target.value as Audience)} className={`${field} mt-2`}>{audiences.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></label>
                <label className="block text-sm font-medium">Title<input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} className={`${field} mt-2`} placeholder="e.g. Water maintenance on Saturday" /></label>
                <label className="block text-sm font-medium">Message<Textarea value={body} onChange={e => setBody(e.target.value)} maxLength={2000} rows={6} className="mt-2" placeholder="Share the details residents need" /><span className="mt-1 block text-right text-xs font-normal text-muted-foreground">{body.length}/2000</span></label>
                <Button type="submit" className="w-full" disabled={!canSend}><Send size={16} className="mr-2" />{sending ? 'Sending…' : 'Send announcement'}</Button>
            </form>
            <section className="rounded-xl border bg-card">
                <div className="flex items-center justify-between gap-3 border-b p-5"><h2 className="font-semibold">Sent announcements</h2><Button variant="outline" size="sm" disabled={history.isFetching} onClick={() => history.refetch()}><RefreshCw size={14} className={history.isFetching ? 'mr-2 animate-spin' : 'mr-2'} />Refresh</Button></div>
                {history.error && <p role="alert" className="m-5 text-sm text-red-600">{history.error.message}</p>}
                {history.isLoading ? <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>
                : !history.data?.announcements.length ? <p className="p-10 text-center text-sm text-muted-foreground"><Bell className="mx-auto mb-3" />No announcements sent yet.</p>
                : <ul className="divide-y">{history.data.announcements.map(a => <li key={a.id} className="p-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-medium">{a.title}</p><time className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</time></div><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground line-clamp-3">{a.body}</p><p className="mt-3 text-xs text-muted-foreground"><span className="capitalize">{a.category}</span> · {audiences.find(x => x.value === a.audience)?.label} · {a.recipient_count} inboxes · {a.push_sent} pushed{a.push_failed ? ` · ${a.push_failed} push failed` : ''}{a.author_name ? ` · by ${a.author_name}` : ''}</p></li>)}</ul>}
                <div className="flex justify-end gap-2 border-t p-4"><Button variant="outline" size="sm" disabled={history.isFetching || offset === 0} onClick={() => setOffset(v => Math.max(0, v - 25))}>Previous</Button><Button variant="outline" size="sm" disabled={history.isFetching || !history.data?.has_more} onClick={() => setOffset(v => v + 25)}>Next</Button></div>
            </section>
        </div>
    </div>;
}
