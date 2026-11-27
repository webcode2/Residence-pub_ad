"use client";

import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQuery, type InfiniteData } from '@tanstack/react-query';
import { MessagesSquare, RefreshCw, Search, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { listConversations, getConversation, type ConversationMessage, type ConversationPage } from '@/actions/conversations';

function timestamp(value: string | null) {
    if (!value) return '—';
    // The backend stores UTC timestamps without a timezone suffix.
    return new Date(/(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value}Z`).toLocaleString();
}

function initials(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
}

function MessageBubble({ message }: { message: ConversationMessage }) {
    const isGuard = message.sender_role === 'security';
    const isSystem = message.sender_role === 'system';
    const role = isGuard ? 'Guard' : isSystem ? 'System' : 'Resident';

    return <li className={`flex ${isSystem ? 'justify-center' : isGuard ? 'justify-end' : 'justify-start'}`}>
        <article className={`min-w-0 max-w-[92%] sm:max-w-[78%] ${isSystem ? 'text-center' : isGuard ? 'text-right' : ''}`}>
            <p className="mb-1 px-1 text-xs font-semibold [overflow-wrap:anywhere]">
                {message.sender_name || role}
                {message.sender_name && <span className="ml-1.5 font-normal text-muted-foreground">{role}</span>}
            </p>
            <div className={`inline-block max-w-full rounded-2xl px-4 py-2.5 [overflow-wrap:anywhere] ${isSystem
                ? 'border border-border bg-card text-center'
                : isGuard ? 'rounded-tr-sm bg-primary text-left text-primary-foreground'
                : 'rounded-tl-sm border border-border bg-card text-left'}`}>
                {message.status_tag && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide">{message.status_tag}</p>}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
            </div>
            {(message.officer_badge || message.officer_post) && <p className="mt-1 px-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">{[message.officer_badge && `Badge: ${message.officer_badge}`, message.officer_post && `Post: ${message.officer_post}`].filter(Boolean).join(' · ')}</p>}
            <p className="mt-1 flex flex-wrap gap-x-2 px-1 text-xs text-muted-foreground" style={{ justifyContent: isSystem ? 'center' : isGuard ? 'flex-end' : 'flex-start' }}>
                <time>{timestamp(message.created_at)}</time>
                <span>{message.is_read ? `Read ${timestamp(message.read_at)}` : 'Not marked as read'}</span>
            </p>
        </article>
    </li>;
}

export default function ConversationsPage() {
    const { user } = useUser();
    const [draft, setDraft] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const listEnd = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = useState<string | null>(null);
    useEffect(() => {
        const id = new URLSearchParams(window.location.search).get('thread');
        if (id && /^[0-9a-f-]{36}$/i.test(id)) setSelected(id);
    }, []);
    const enabled = !!user?.app_id && user.roles.includes('caretaker');
    const list = useInfiniteQuery<ConversationPage, Error, InfiniteData<ConversationPage, number>, readonly unknown[], number>({
        queryKey: ['conversation-audit', user?.id, user?.app_id, search, status],
        enabled,
        initialPageParam: 0,
        getNextPageParam: (lastPage, _pages, offset) => lastPage.has_more ? offset + 50 : undefined,
        queryFn: async ({ pageParam }): Promise<ConversationPage> => {
            const result = await listConversations({ search, status, offset: pageParam });
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
    const { fetchNextPage, hasNextPage, isFetching, isFetchNextPageError } = list;
    useEffect(() => {
        const end = listEnd.current;
        if (!end || !hasNextPage || isFetching || isFetchNextPageError) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) void fetchNextPage({ cancelRefetch: false });
        }, { threshold: 0.5 });
        observer.observe(end);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetching, isFetchNextPageError]);
    const threads = list.data?.pages.flatMap(page => page.threads) ?? [];
    const refresh = () => { void list.refetch(); if (selected) void detail.refetch(); };

    return <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-medium tracking-tight">Conversation Logs</h1>
                <p className="text-sm text-muted-foreground mt-2">Read-only history. Viewing a log does not mark participants’ messages as read.</p>
            </div>
            <Button variant="outline" onClick={refresh} disabled={!enabled || list.isFetching || detail.isFetching}>
                <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
        </header>
        <div className="grid min-w-0 overflow-hidden rounded-2xl border bg-card lg:h-[max(36rem,calc(100dvh-13.5rem))] lg:grid-cols-[minmax(16rem,21rem)_minmax(0,1fr)]">
            <section aria-label="Conversations" className={`${selected ? 'hidden lg:flex' : 'flex'} min-h-0 min-w-0 flex-col lg:border-r`}>
                <div className="shrink-0 space-y-3 border-b p-4">
                    <h2 className="font-semibold">Conversations</h2>
                    <form className="grid grid-cols-[minmax(0,1fr)_auto] gap-2" onSubmit={e => { e.preventDefault(); setSearch(draft); setSelected(null); }}>
                        <label className="col-span-2 flex h-10 min-w-0 items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="sr-only">Search conversations</span>
                            <input value={draft} onChange={e => setDraft(e.target.value)} maxLength={200}
                                placeholder="Resident, unit, officer, badge, or message"
                                className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                        </label>
                        <select aria-label="Status" value={status} onChange={e => { setStatus(e.target.value); setSelected(null); }}
                            className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm">
                            <option value="">All statuses</option><option value="open">Open</option>
                            <option value="resolved">Resolved</option><option value="closed">Closed</option>
                        </select>
                        <Button type="submit" size="sm">Search</Button>
                    </form>
                </div>
                <div className="min-h-0 flex-1 space-y-1 p-2 lg:overflow-y-auto">
                    {list.isLoading && <p role="status" className="p-6">Loading conversations…</p>}
                    {list.isLoadingError && list.error && <div role="alert" className="p-6"><p>{list.error.message}</p><Button variant="outline" onClick={() => list.refetch()} className="mt-3">Retry</Button></div>}
                    {list.isSuccess && threads.length === 0 && <p className="p-6 text-muted-foreground">No conversations match these filters.</p>}
                    {threads.map(thread => <button key={thread.id} type="button" onClick={() => setSelected(thread.id)}
                        aria-pressed={selected === thread.id}
                        className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-transparent p-3 text-left hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring aria-pressed:border-primary/20 aria-pressed:bg-primary/10">
                        <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(thread.resident_name || 'Resident')}</span>
                        <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                                <span className="truncate">{thread.resident_name || 'Resident'}</span>
                                {thread.has_active_emergency && <ShieldAlert aria-label="Active emergency" className="h-4 w-4 shrink-0 text-destructive" />}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">{[thread.unit_address, thread.gate_site_name].filter(Boolean).join(' · ')}</span>
                            <span className="mt-1 block truncate text-sm">{thread.last_message_text || thread.subject || 'Conversation'}</span>
                            <span className="mt-1 block text-xs capitalize text-muted-foreground">{thread.status} · {timestamp(thread.last_message_at)}</span>
                        </span>
                    </button>)}
                    {hasNextPage && <div ref={listEnd} className="grid min-h-8 place-items-center">
                        {list.isFetchingNextPage && <p role="status" className="text-xs text-muted-foreground">Loading more conversations…</p>}
                        {isFetchNextPageError && <Button variant="outline" size="sm" onClick={() => void fetchNextPage()}>Retry loading more</Button>}
                    </div>}
                </div>
            </section>
            <section aria-label="Conversation history" className={`${!selected ? 'hidden lg:flex' : 'flex'} min-h-0 min-w-0 flex-col bg-muted/30`}>
                {!selected && <div className="m-auto px-6 py-16 text-center text-muted-foreground"><MessagesSquare className="mx-auto mb-3 h-8 w-8" /><p>Select a conversation to view its full history.</p></div>}
                {selected && <Button variant="ghost" className="m-3 self-start lg:hidden" onClick={() => setSelected(null)}><ArrowLeft className="mr-2 h-4 w-4" />Conversations</Button>}
                {selected && detail.isLoading && <p role="status" className="p-5">Loading message history…</p>}
                {selected && detail.error && <div role="alert" className="p-5"><p>{detail.error.message}</p><Button variant="outline" onClick={() => detail.refetch()} className="mt-3">Retry</Button></div>}
                {selected && detail.data && <>
                    <div className="shrink-0 border-b bg-card px-4 py-4 sm:px-6">
                        <h2 className="font-semibold text-lg">{detail.data.resident_name || 'Resident'} · {detail.data.gate_site_name || 'Gatehouse'}</h2>
                        <p className="text-sm text-muted-foreground">{detail.data.unit_address} · {detail.data.status}</p>
                        {detail.data.subject && <p className="mt-2">{detail.data.subject}</p>}
                        <p className="mt-2 text-xs text-muted-foreground break-all">Conversation ID: {detail.data.id}<br />Started {timestamp(detail.data.created_at)} · {detail.data.messages.length} messages</p>
                    </div>
                    <div key={selected} className="min-h-0 flex-1 p-4 sm:p-6 lg:overflow-y-auto">
                        <ol aria-label="Messages" className="space-y-5">
                            {detail.data.messages.map(message => <MessageBubble key={message.id} message={message} />)}
                        </ol>
                        {detail.data.messages.length === 0 && <p className="text-center text-sm text-muted-foreground">No messages recorded.</p>}
                    </div>
                </>}
            </section>
        </div>
    </div>;
}
