"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Building2, Check, Copy, KeyRound, Save, ShieldCheck, UserRound } from 'lucide-react';
import { getEstateSettings, saveTokenLength } from '@/actions/conversations';
import EstatePlan from '@/components/EstatePlan';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';

const managementLinks = [
    { title: 'Field staff', text: 'Manage security staff accounts.', href: '/dashboard/security', icon: ShieldCheck },
    { title: 'Gate sites', text: 'Manage the gates residents can contact.', href: '/dashboard/settings/devices', icon: Building2 },
    { title: 'Account details', text: 'Manage your caretaker profile.', href: '/dashboard/profile', icon: UserRound },
];

export default function SettingsPage() {
    const { user } = useUser();
    const cache = useQueryClient();
    const [length, setLength] = useState(6);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);
    const queryKey = ['estate-settings', user?.id, user?.app_id];
    const settings = useQuery({
        queryKey,
        enabled: !!user?.app_id,
        queryFn: async () => {
            const result = await getEstateSettings();
            if (!result.data) throw new Error(result.error);
            return result.data;
        },
        refetchOnWindowFocus: false,
        retry: false,
    });
    const estate = settings.data;

    useEffect(() => {
        if (estate) setLength(estate.token_code_length);
    }, [estate]);

    async function copyAppId(appId: string) {
        try {
            await navigator.clipboard.writeText(appId);
            setCopied(true);
        } catch {
            setMessage('Unable to copy. Select and copy the App ID manually.');
        }
    }

    async function save() {
        setSaving(true);
        setMessage('');
        try {
            const result = await saveTokenLength(length);
            if (!result.data) {
                setMessage(result.error || 'Unable to save settings.');
                return;
            }
            cache.setQueryData(queryKey, result.data);
            setMessage('Visitor code length saved.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8">
            <header>
                <h1 className="text-3xl font-medium tracking-tight">Estate settings</h1>
            </header>

            {settings.error && (
                <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm">
                    <p>{settings.error.message}</p>
                    <Button variant="outline" className="mt-3" onClick={() => settings.refetch()}>Retry</Button>
                </div>
            )}
            {settings.isLoading && <p role="status" className="rounded-xl border bg-card p-6 text-sm">Loading estate profile…</p>}
            {estate && (
                <section aria-labelledby="estate-profile" className="rounded-xl border bg-card p-6">
                    <h2 id="estate-profile" className="flex items-center gap-3 text-xl font-semibold">
                        <Building2 size={20} className="text-primary" /> Estate profile
                    </h2>
                    <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-3">
                        <div><dt className="text-muted-foreground">Estate name</dt><dd className="mt-1 font-medium">{estate.name}</dd></div>
                        <div>
                            <dt className="text-muted-foreground">Estate App ID</dt>
                            <dd className="flex flex-wrap items-center gap-2 font-mono">
                                {estate.app_id}
                                <button type="button" aria-label={copied ? 'Estate App ID copied' : 'Copy estate App ID'} onClick={() => copyAppId(estate.app_id)} className="p-2 text-muted-foreground hover:text-primary">
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </dd>
                        </div>
                        <div><dt className="text-muted-foreground">Status</dt><dd className="mt-1">{estate.is_active ? 'Active' : 'Inactive'}</dd></div>
                    </dl>
                </section>
            )}

            <EstatePlan />

            {estate && (
                <section aria-labelledby="access-control" className="rounded-xl border bg-card p-6">
                    <h2 id="access-control" className="flex items-center gap-3 text-xl font-semibold">
                        <KeyRound size={20} className="text-primary" /> Access control
                    </h2>
                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                        <label className="text-sm font-medium">
                            Visitor access code length
                            <select value={length} onChange={event => { setLength(Number(event.target.value)); setMessage(''); }} className="mt-2 block min-w-48 rounded-md border border-input bg-background px-4 py-2">
                                {[4, 5, 6].map(value => <option key={value} value={value}>{value} characters</option>)}
                            </select>
                        </label>
                        <Button disabled={saving || length === estate.token_code_length} onClick={save}>
                            <Save size={15} /> {saving ? 'Saving…' : 'Save preference'}
                        </Button>
                    </div>
                </section>
            )}
            {message && <p role="status" className="rounded-lg border bg-card p-4 text-sm">{message}</p>}

            <section aria-labelledby="estate-operations" className="space-y-3">
                <h2 id="estate-operations" className="text-xl font-semibold">Field staff and gate sites</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {managementLinks.map(item => (
                        <Link href={item.href} key={item.href} className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/30">
                            <item.icon size={20} className="shrink-0 text-primary" />
                            <div><h3 className="text-sm font-medium">{item.title}</h3><p className="mt-1 text-xs text-muted-foreground">{item.text}</p></div>
                            <ArrowUpRight className="ml-auto shrink-0 text-muted-foreground" size={16} />
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
