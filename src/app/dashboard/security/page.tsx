"use client";

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Plus, KeyRound, Copy, Check, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import {
    listSecurityStaff, registerSecurityOfficer, resetOfficerPassword, setOfficerSuspended, updateSecurityOfficer,
    SecurityOfficer, OfficerCredentials, OfficerDetails,
} from '@/actions/security-staff';

const DETAIL_FIELDS: { key: keyof OfficerDetails; label: string; type?: string; max: number; wide?: boolean; multiline?: boolean; required?: boolean }[] = [
    { key: 'full_name', label: 'Full name', max: 255, required: true },
    { key: 'email', label: 'Sign-in email', type: 'email', max: 255, required: true },
    { key: 'phone', label: 'Phone', max: 40 },
    { key: 'alternate_phone', label: 'Alternate phone', max: 40 },
    { key: 'staff_number', label: 'Staff ID', max: 50 },
    { key: 'home_address', label: 'Home address', max: 500, wide: true, multiline: true },
    { key: 'emergency_contact_name', label: 'Emergency contact name', max: 255 },
    { key: 'emergency_contact_phone', label: 'Emergency contact phone', max: 40 },
    { key: 'notes', label: 'Notes', max: 1000, wide: true, multiline: true },
];

function detailsOf(o: SecurityOfficer): OfficerDetails {
    return {
        full_name: o.full_name ?? '', email: o.email, phone: o.phone ?? '', staff_number: o.staff_number ?? '',
        alternate_phone: o.alternate_phone ?? '', home_address: o.home_address ?? '',
        emergency_contact_name: o.emergency_contact_name ?? '', emergency_contact_phone: o.emergency_contact_phone ?? '',
        notes: o.notes ?? '',
    };
}

const STATUS: Record<SecurityOfficer['status'], { label: string; tone: string }> = {
    active: { label: 'Active', tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
    awaiting_first_sign_in: { label: 'Awaiting first sign-in', tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
    suspended: { label: 'Suspended', tone: 'bg-muted text-muted-foreground' },
};
const field = 'w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function SecurityStaffPage() {
    const { user } = useUser();
    const cache = useQueryClient();
    const queryKey = ['security-staff', user?.app_id];
    const staff = useQuery({
        queryKey, enabled: !!user?.app_id, retry: false, refetchOnWindowFocus: false,
        queryFn: async () => { const r = await listSecurityStaff(); if (!r.data) throw new Error(r.error); return r.data; },
    });
    const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [credentials, setCredentials] = useState<OfficerCredentials | null>(null);
    const [copied, setCopied] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [confirmSuspend, setConfirmSuspend] = useState<SecurityOfficer | null>(null);
    const [suspensionReason, setSuspensionReason] = useState('');
    const [confirmReset, setConfirmReset] = useState<SecurityOfficer | null>(null);
    const [editing, setEditing] = useState<SecurityOfficer | null>(null);
    const [details, setDetails] = useState<OfficerDetails | null>(null);
    const [editError, setEditError] = useState('');
    const [editSaving, setEditSaving] = useState(false);

    function startEdit(officer: SecurityOfficer) {
        setEditing(officer); setDetails(detailsOf(officer)); setEditError('');
    }

    async function saveDetails(event: React.FormEvent) {
        event.preventDefault();
        if (!editing || !details || editSaving) return;
        setEditSaving(true); setEditError('');
        try {
            const r = await updateSecurityOfficer(editing.id, details);
            if (!r.data) { setEditError(r.error); return; }
            setEditing(null); setDetails(null);
            if (r.data.temporary_password) {
                setCredentials({ ...r.data, temporary_password: r.data.temporary_password }); setCopied(false);
            } else {
                toast.success(r.data.message);
            }
            await cache.invalidateQueries({ queryKey });
        } finally { setEditSaving(false); }
    }

    async function register(event: React.FormEvent) {
        event.preventDefault();
        if (saving) return;
        setSaving(true); setFormError('');
        try {
            const r = await registerSecurityOfficer(form);
            if (!r.data) { setFormError(r.error); return; }
            setForm({ full_name: '', email: '', phone: '' });
            setCredentials(r.data); setCopied(false);
            await cache.invalidateQueries({ queryKey });
        } finally { setSaving(false); }
    }

    async function act(officer: SecurityOfficer, action: 'suspend' | 'reinstate' | 'reset', reason?: string) {
        setBusyId(officer.id);
        try {
            if (action === 'reset') {
                const r = await resetOfficerPassword(officer.id);
                if (!r.data) { toast.error(r.error); return; }
                setCredentials(r.data); setCopied(false);
            } else {
                const r = await setOfficerSuspended(officer.id, action === 'suspend', reason);
                if (!r.data) { toast.error(r.error); return; }
                toast.success(action === 'suspend' ? `${officer.full_name || officer.email} can no longer verify visitors.` : `${officer.full_name || officer.email} is reinstated.`);
            }
            if (action === 'suspend') setConfirmSuspend(null);
            await cache.invalidateQueries({ queryKey });
        } finally { setBusyId(null); }
    }

    return <div className="space-y-6">
        <header>
            <p className="text-[10px] tracking-[.16em] text-muted-foreground mb-2">GATE OFFICERS YOUR ESTATE TRUSTS</p>
            <h1 className="text-3xl font-medium tracking-tight">Security staff</h1>
            <p className="text-xs text-muted-foreground mt-3 max-w-2xl">Only officers you register here can verify visitor codes and RFID tags at the gate. Each officer signs in to the Residence app with a temporary password and must choose their own before they can verify anyone.</p>
        </header>
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
            <section className="rounded-xl border border-border bg-card overflow-hidden" aria-label="Registered officers">
                {staff.isLoading && <p role="status" className="p-6 text-sm text-muted-foreground">Loading officers…</p>}
                {staff.isError && <p role="alert" className="p-6 text-sm text-destructive">{(staff.error as Error).message}</p>}
                {staff.data && staff.data.length === 0 && <div className="p-8 text-center"><ShieldCheck className="mx-auto text-muted-foreground" size={22} /><p className="mt-3 text-sm font-medium">No security officers yet</p><p className="text-xs text-muted-foreground mt-1">Register your first gate officer to start verifying visitors.</p></div>}
                {staff.data && staff.data.length > 0 && <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="p-4 font-medium">Officer</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium text-right">Actions</th></tr></thead>
                    <tbody>{staff.data.map(o => <tr key={o.id} className="border-b border-border last:border-0">
                        <td className="p-4"><p className="font-medium">{o.full_name || '—'}{o.staff_number ? <span className="ml-2 text-xs font-normal text-muted-foreground">ID {o.staff_number}</span> : null}</p><p className="text-xs text-muted-foreground break-all">{o.email}{o.phone ? ` · ${o.phone}` : ''}</p></td>
                        <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS[o.status].tone}`}>{STATUS[o.status].label}</span>
                            {(o.email_status === 'queued' || o.email_status === 'retrying') && <p className="mt-1 text-[11px] text-muted-foreground">{o.email_status === 'retrying' ? 'Email delayed, retrying automatically' : 'Sending sign-in email…'}</p>}</td>
                        <td className="p-4"><div className="flex flex-wrap justify-end gap-2">
                            <Button size="sm" variant="outline" disabled={busyId === o.id} onClick={() => startEdit(o)}><Pencil size={14} />Edit details</Button>
                            {o.status !== 'suspended' &&<Button size="sm" variant="outline" disabled={busyId === o.id} onClick={() => setConfirmReset(o)}><KeyRound size={14} />Reset password</Button>}
                            {o.status === 'suspended'
                                ? <Button size="sm" variant="outline" disabled={busyId === o.id} onClick={() => act(o, 'reinstate')}>Reinstate</Button>
                                : <Button size="sm" variant="outline" disabled={busyId === o.id} onClick={() => { setSuspensionReason(''); setConfirmSuspend(o); }}>Suspend</Button>}
                        </div></td>
                    </tr>)}</tbody>
                </table>}
            </section>
            <section className="rounded-xl border border-border bg-card p-5" aria-label="Register an officer">
                <h2 className="text-sm font-medium">Register an officer</h2>
                <p className="text-xs text-muted-foreground mt-1">They receive their sign-in details by email. You also see the temporary password once.</p>
                <form className="mt-4 space-y-3" onSubmit={register}>
                    <label className="block text-xs">Full name<input className={`${field} mt-1`} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required maxLength={255} /></label>
                    <label className="block text-xs">Email<input type="email" className={`${field} mt-1`} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></label>
                    <label className="block text-xs">Phone (optional)<input className={`${field} mt-1`} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={40} /></label>
                    {formError && <p role="alert" className="text-xs text-destructive">{formError}</p>}
                    <Button type="submit" className="w-full" disabled={saving}><Plus size={15} />{saving ? 'Registering…' : 'Register officer'}</Button>
                </form>
            </section>
        </div>
        <Dialog open={!!confirmSuspend} onOpenChange={open => { if (!open && !busyId) setConfirmSuspend(null); }}>
            <DialogContent>
                <DialogTitle>Suspend {confirmSuspend?.full_name || confirmSuspend?.email}?</DialogTitle>
                <DialogDescription>The officer will lose account access until reinstated. The reason is saved in the audit log.</DialogDescription>
                <form className="space-y-4" onSubmit={event => {
                    event.preventDefault();
                    if (confirmSuspend && suspensionReason.trim() && !busyId) void act(confirmSuspend, 'suspend', suspensionReason.trim());
                }}>
                    <label className="block space-y-2 text-sm font-medium">
                        <span>Suspension reason</span>
                        <textarea className="block w-full rounded-md border border-input bg-background p-3" rows={3} maxLength={500} required value={suspensionReason} onChange={event => setSuspensionReason(event.target.value)} />
                    </label>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" disabled={!!busyId} onClick={() => setConfirmSuspend(null)}>Cancel</Button>
                        <Button type="submit" variant="destructive" disabled={!!busyId || !suspensionReason.trim()}>Suspend officer</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
        <Dialog open={!!editing} onOpenChange={open => { if (!open && !editSaving) { setEditing(null); setDetails(null); } }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogTitle>Edit {editing?.full_name || editing?.email}</DialogTitle>
                <DialogDescription>
                    {editing?.status === 'awaiting_first_sign_in'
                        ? 'This officer has not signed in yet. If you change the email, a new welcome email with a new temporary password goes to the new address.'
                        : 'If you change the email, the officer is signed out and signs in with the new email and their existing password.'} Every change is saved in the audit log.
                </DialogDescription>
                {details && <form className="space-y-4" onSubmit={saveDetails}>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {DETAIL_FIELDS.map(f => <label key={f.key} className={`block text-xs ${f.wide ? 'sm:col-span-2' : ''}`}>{f.label}{f.required ? '' : ' (optional)'}
                            {f.multiline
                                ? <textarea className="mt-1 block w-full rounded-md border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" rows={2} maxLength={f.max} value={details[f.key]} onChange={e => setDetails({ ...details, [f.key]: e.target.value })} />
                                : <input type={f.type ?? 'text'} className={`${field} mt-1`} maxLength={f.max} required={f.required} value={details[f.key]} onChange={e => setDetails({ ...details, [f.key]: e.target.value })} />}
                        </label>)}
                    </div>
                    {editError && <p role="alert" className="text-xs text-destructive">{editError}</p>}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" disabled={editSaving} onClick={() => { setEditing(null); setDetails(null); }}>Cancel</Button>
                        <Button type="submit" disabled={editSaving}>{editSaving ? 'Saving…' : 'Save details'}</Button>
                    </div>
                </form>}
            </DialogContent>
        </Dialog>
        <Dialog open={!!confirmReset} onOpenChange={open => { if (!open) setConfirmReset(null); }}>
            <DialogContent>
                <DialogTitle>Reset password for {confirmReset?.full_name || confirmReset?.email}?</DialogTitle>
                <DialogDescription>This emails the officer a new temporary password. Their current password keeps working until that email is sent, then only the new one works. The officer must set their own password at their next sign-in.</DialogDescription>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setConfirmReset(null)}>Cancel</Button>
                    <Button disabled={!!confirmReset && busyId === confirmReset.id} onClick={async () => { const officer = confirmReset; setConfirmReset(null); if (officer) await act(officer, 'reset'); }}>Reset password</Button>
                </div>
            </DialogContent>
        </Dialog>
        <Dialog open={!!credentials} onOpenChange={open => { if (!open) setCredentials(null); }}>
            <DialogContent>
                <DialogTitle>Sign-in details for {credentials?.full_name || credentials?.email}</DialogTitle>
                <DialogDescription>{credentials?.message} The same details are being emailed to {credentials?.email}; check that address is spelled correctly. This password is shown only once.</DialogDescription>
                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Estate App ID:</span> <span className="font-mono">{user?.app_id}</span></p>
                    <p><span className="text-muted-foreground">Email:</span> {credentials?.email}</p>
                    <p className="flex items-center gap-2"><span className="text-muted-foreground">Temporary password:</span> <span className="font-mono">{credentials?.temporary_password}</span>
                        <button type="button" aria-label="Copy temporary password" className="text-muted-foreground hover:text-foreground" onClick={async () => { if (credentials) { await navigator.clipboard.writeText(credentials.temporary_password); setCopied(true); } }}>{copied ? <Check size={14} /> : <Copy size={14} />}</button></p>
                </div>
                <Button onClick={() => setCredentials(null)}>Done</Button>
            </DialogContent>
        </Dialog>
    </div>;
}
