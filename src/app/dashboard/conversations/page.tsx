"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessagesSquare, RefreshCw, Search, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { listConversations, getConversation } from '@/actions/conversations';

function timestamp(value: string | null) {
    if (!value) return '—';
    // The backend stores UTC timestamps without a timezone suffix.
    return new Date(/(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value}Z`).toLocaleString();
}

export default function ConversationsPage() {
    const { user } = useUser();
    const [draft, setDraft] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [offset, setOffset] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    useEffect(() => {
        const id = new URLSearchParams(window.location.search).get('thread');
        if (id && /^[0-9a-f-]{36}$/i.test(id)) setSelected(id);
    }, []);
    const enabled = !!user?.app_id && user.roles.includes('caretaker');
    const list = useQuery({
        queryKey: ['conversation-audit', user?.id, user?.app_id, search, status, offset],
        enabled,
        queryFn: async () => {
            const result = await listConversations({ search, status, offset });
            if (!result.data) throw new Error(result.error);
            return result.data;
        },
        refetchOnWindowFocus: false, retry: false,
    });
    const detail = useQuery({
        queryKey: ['conversation-audit-detail', user?.id, user?.app_id, selected],
        enabled: enabled && !!selected,
        queryFn: async () => {
            const result = await getConversation(selected!);
            if (!result.data) throw new Error(result.error);
            return result.data;
        },
        refetchOnWindowFocus: false, retry: false,
    });
    const refresh = () => { void list.refetch(); if (selected) void detail.refetch(); };

    return <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-medium tracking-tight">Conversation Logs</h1>
                <p className="text-muted-foreground mt-1">A clear record of the conversations that keep your estate connected.</p>
                <p className="text-sm text-muted-foreground mt-2">Read-only history. Viewing a log does not mark participants’ messages as read.</p>
            </div>
            <Button variant="outline" onClick={refresh} disabled={!enabled || list.isFetching || detail.isFetching}>
                <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
        </header>
        <form className="flex flex-wrap gap-3 items-end" onSubmit={e => { e.preventDefault(); setSearch(draft); setOffset(0); setSelected(null); }}>
            <label className="flex-1 min-w-48 text-sm font-medium">Search conversations
                <input value={draft} onChange={e => setDraft(e.target.value)} maxLength={200}
                    placeholder="Resident, unit, officer, badge, or message"
                    className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background" />
            </label>
            <label className="text-sm font-medium">Status
                <select value={status} onChange={e => { setStatus(e.target.value); setOffset(0); setSelected(null); }}
                    className="mt-1 block h-11 px-3 rounded-md border border-input bg-background">
                    <option value="">All statuses</option><option value="open">Open</option>
                    <option value="resolved">Resolved</option><option value="closed">Closed</option>
                </select>
            </label>
            <Button type="submit" className="h-11"><Search className="mr-2 h-4 w-4" />Search</Button>
        </form>
        <div className="grid lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)] gap-5 items-start">
            <section aria-label="Conversations" className={`${selected ? 'hidden lg:block' : ''} rounded-xl border border-border bg-card overflow-hidden`}>
                {list.isLoading && <p role="status" className="p-6">Loading conversations…</p>}
                {list.error && <div role="alert" className="p-6"><p>{list.error.message}</p><Button variant="outline" onClick={() => list.refetch()} className="mt-3">Retry</Button></div>}
                {list.data?.threads.length === 0 && <p className="p-6 text-muted-foreground">No conversations match these filters.</p>}
                {list.data?.threads.map(thread => <button key={thread.id} onClick={() => setSelected(thread.id)}
                    aria-pressed={selected === thread.id}
                    className={`w-full text-left p-4 border-b border-border hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${selected === thread.id ? 'bg-muted' : ''}`}>
                    <span className="flex items-center justify-between gap-2 font-semibold">
                        {thread.resident_name || 'Resident'}
                        {thread.has_active_emergency && <ShieldAlert aria-label="Active emergency" className="h-5 w-5 text-destructive shrink-0" />}
                    </span>
                    <span className="block text-sm text-muted-foreground">{[thread.unit_address, thread.gate_site_name].filter(Boolean).join(' • ')}</span>
                    <span className="block text-sm mt-2 line-clamp-2">{thread.last_message_text || thread.subject || 'Conversation'}</span>
                    <span className="block text-xs text-muted-foreground mt-2">{thread.status} • {timestamp(thread.last_message_at)}</span>
                </button>)}
                <div className="p-3 flex items-center justify-between gap-2">
                    <Button variant="outline" disabled={offset === 0 || list.isFetching} onClick={() => setOffset(Math.max(0, offset - 50))}>Previous</Button>
                    <span className="text-sm">Page {offset / 50 + 1}</span>
                    <Button variant="outline" disabled={!list.data?.has_more || list.isFetching} onClick={() => setOffset(offset + 50)}>Next</Button>
                </div>
            </section>
            <section aria-label="Conversation history" className={`${!selected ? 'hidden lg:block' : ''} rounded-xl border border-border bg-card p-4 sm:p-6 min-w-0`}>
                {!selected && <div className="py-16 text-center text-muted-foreground"><MessagesSquare className="mx-auto mb-3 h-8 w-8" /><p>Select a conversation to view its full history.</p></div>}
                {selected && <Button variant="ghost" className="mb-4 lg:hidden" onClick={() => setSelected(null)}><ArrowLeft className="mr-2 h-4 w-4" />Conversations</Button>}
                {selected && detail.isLoading && <p role="status">Loading message history…</p>}
                {selected && detail.error && <div role="alert"><p>{detail.error.message}</p><Button variant="outline" onClick={() => detail.refetch()} className="mt-3">Retry</Button></div>}
                {selected && detail.data && <>
                    <div className="border-b border-border pb-4 mb-5">
                        <h2 className="font-semibold text-lg">{detail.data.resident_name || 'Resident'} · {detail.data.gate_site_name || 'Gatehouse'}</h2>
                        <p className="text-sm text-muted-foreground">{detail.data.unit_address} · {detail.data.status}</p>
                        {detail.data.subject && <p className="mt-2">{detail.data.subject}</p>}
                        <p className="mt-2 text-xs text-muted-foreground break-all">Conversation ID: {detail.data.id}<br />Started {timestamp(detail.data.created_at)} · {detail.data.messages.length} messages</p>
                    </div>
                    <ol className="space-y-4">
                        {detail.data.messages.map(message => <li key={message.id} className="rounded-lg border border-border p-4">
                            <div className="flex flex-wrap justify-between gap-2">
                                <span className="font-semibold">{message.sender_name} <span className="text-sm font-normal text-muted-foreground">({message.sender_role === 'security' ? 'Guard' : message.sender_role})</span></span>
                                <time className="text-xs text-muted-foreground">{timestamp(message.created_at)}</time>
                            </div>
                            {(message.officer_badge || message.officer_post) && <p className="text-sm text-muted-foreground mt-1">{[message.officer_badge && `Badge: ${message.officer_badge}`, message.officer_post && `Post: ${message.officer_post}`].filter(Boolean).join(' · ')}</p>}
                            {message.status_tag && <span className="inline-block text-xs font-semibold rounded bg-muted px-2 py-1 mt-2">{message.status_tag}</span>}
                            <p className="whitespace-pre-wrap break-words mt-2">{message.message}</p>
                            <p className="text-xs text-muted-foreground mt-3">{message.is_read ? `Read ${timestamp(message.read_at)}` : 'Not marked as read'}</p>
                        </li>)}
                    </ol>
                    {detail.data.messages.length === 0 && <p className="text-muted-foreground">No messages recorded.</p>}
                </>}
            </section>
        </div>
    </div>;
}
