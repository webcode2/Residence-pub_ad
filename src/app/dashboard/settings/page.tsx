"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ArrowUpRight, Save, KeyRound, ShieldCheck, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { getEstateSettings, saveTokenLength } from '@/actions/conversations';

export default function SettingsPage() {
    const { user } = useUser();
    const cache = useQueryClient();
    const [length, setLength] = useState(6);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);
    const queryKey = ['estate-settings', user?.id, user?.app_id];
    const settings = useQuery({ queryKey, enabled: !!user?.app_id, queryFn: async () => { const result = await getEstateSettings(); if (!result.data) throw new Error(result.error); return result.data; }, refetchOnWindowFocus: false, retry: false });
    useEffect(() => { if (settings.data) setLength(settings.data.token_code_length); }, [settings.data]);
    async function save() {
        setSaving(true); setMessage('');
        try { const result = await saveTokenLength(length); if (!result.data) { setMessage(result.error || 'Unable to save settings.'); return; } cache.setQueryData(queryKey, result.data); setMessage('Visitor code length saved.'); }
        finally { setSaving(false); }
    }
    return <div className="w-full max-w-5xl mx-auto space-y-6"><header><p className="text-[10px] tracking-[.16em] text-muted-foreground mb-2">THE FOUNDATIONS OF YOUR WORKSPACE</p><h1 className="text-3xl font-medium tracking-tight">Estate settings</h1><p className="text-xs text-muted-foreground mt-3">Keep your estate’s identity and access preferences in order.</p></header>{settings.error && <div role="alert" className="border border-amber-200 bg-amber-50 rounded-lg p-5 text-sm"><p>{settings.error.message}</p><Button variant="outline" className="mt-3" onClick={() => settings.refetch()}>Retry</Button></div>}{settings.isLoading && <div role="status" className="h-52 rounded-xl bg-muted animate-pulse" />}{settings.data && <><section className="bg-card border border-border rounded-xl p-6"><div className="flex items-center gap-3 mb-6"><Building2 size={20} strokeWidth={1.5} className="text-primary" /><h2 className="text-sm font-medium">Your estate</h2></div><dl className="grid sm:grid-cols-2 gap-7 text-xs"><div><dt className="text-muted-foreground text-[10px]">ESTATE NAME</dt><dd className="mt-2 font-medium text-base">{settings.data.name}</dd></div><div><dt className="text-muted-foreground text-[10px]">ESTATE APP ID</dt><dd className="mt-2 flex items-center gap-3 font-mono">{settings.data.app_id}<button aria-label="Copy estate App ID" onClick={async () => { try { await navigator.clipboard.writeText(settings.data!.app_id); setCopied(true); } catch { setMessage('Unable to copy. Select and copy the App ID manually.'); } }} className="p-2 text-muted-foreground hover:text-primary">{copied ? <Check size={14} /> : <Copy size={14} />}</button></dd></div><div><dt className="text-muted-foreground text-[10px]">SUBSCRIPTION</dt><dd className="mt-2 capitalize">{settings.data.tier}</dd></div><div><dt className="text-muted-foreground text-[10px]">ESTATE STATUS</dt><dd className="mt-2">{settings.data.is_active ? 'Active' : 'Inactive'}</dd></div></dl></section><section className="bg-card border border-border rounded-xl p-6"><div className="flex items-center gap-3 mb-6"><KeyRound size={20} strokeWidth={1.5} className="text-primary" /><h2 className="text-sm font-medium">Visitor access codes</h2></div><div className="flex flex-wrap items-end justify-between gap-5"><label className="text-xs font-medium">Code length<select value={length} onChange={event => { setLength(Number(event.target.value)); setMessage(''); }} className="block mt-2 border border-input rounded-md px-4 py-2.5 bg-background min-w-48">{[4, 5, 6].map(value => <option key={value} value={value}>{value} characters</option>)}</select><span className="block text-[11px] text-muted-foreground mt-3 font-normal">Used by your estate’s visitor access workflow.</span></label><Button disabled={saving || length === settings.data.token_code_length} onClick={save}><Save size={15} />{saving ? 'Saving…' : 'Save preference'}</Button></div></section></>}{message && <p role="status" className="text-sm border border-border bg-card p-4 rounded-lg">{message}</p>}<section className="grid sm:grid-cols-2 gap-4">{[{ title: 'Gate sites', text: 'Define the gates residents can contact.', href: '/dashboard/settings/devices', icon: Building2 }, { title: 'Account details', text: 'Review and manage your caretaker profile.', href: '/dashboard/profile', icon: ShieldCheck }].map(item => <Link href={item.href} key={item.href} className="flex items-center gap-4 p-6 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"><item.icon size={21} strokeWidth={1.5} className="text-primary" /><div><h2 className="text-sm font-medium">{item.title}</h2><p className="text-[11px] text-muted-foreground mt-2">{item.text}</p></div><ArrowUpRight className="ml-auto shrink-0 text-muted-foreground" size={17} /></Link>)}</section></div>;
}
