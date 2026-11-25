"use client";
import { useEffect, useState } from 'react';
import { User, Mail, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { updateProfileAction, changePasswordAction } from '@/actions/profile';

const field = 'w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm';

export default function ProfilePage() {
    const { user, refreshUser } = useUser();
    const [details, setDetails] = useState({ full_name: '', email: '', current_password: '' });
    const [password, setPassword] = useState({ current_password: '', new_password: '', confirm: '' });
    const [saving, setSaving] = useState<'details' | 'password' | null>(null);
    useEffect(() => { if (user) setDetails({ full_name: user.full_name || '', email: user.email, current_password: '' }); }, [user]);
    if (!user) return null;
    const emailChanged = details.email.trim().toLowerCase() !== user.email.toLowerCase();

    async function saveDetails(event: React.FormEvent) {
        event.preventDefault(); setSaving('details');
        try {
            const r = await updateProfileAction({ full_name: details.full_name, email: details.email, current_password: emailChanged ? details.current_password : undefined });
            if (r.error) { toast.error(r.error); return; }
            toast.success('Profile updated.'); await refreshUser();
        } finally { setSaving(null); }
    }
    async function savePassword(event: React.FormEvent) {
        event.preventDefault();
        if (password.new_password !== password.confirm) { toast.error('The new passwords do not match.'); return; }
        setSaving('password');
        try {
            const r = await changePasswordAction({ current_password: password.current_password, new_password: password.new_password });
            if (r.error) { toast.error(r.error); return; }
            toast.success('Password changed.'); setPassword({ current_password: '', new_password: '', confirm: '' });
        } finally { setSaving(null); }
    }

    return <div className="mx-auto w-full max-w-4xl space-y-6">
        <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Your account</p><h1 className="mt-2 text-3xl font-semibold">Profile</h1><p className="mt-2 text-sm text-muted-foreground">{user.roles.join(', ')} · {user.app_id}</p></div>
        <form onSubmit={saveDetails} className="space-y-5 rounded-xl border bg-card p-6">
            <h2 className="flex items-center gap-2 font-semibold"><User size={17} />Account details</h2>
            <label className="block text-sm font-medium">Full name<input required maxLength={255} value={details.full_name} onChange={e => setDetails({ ...details, full_name: e.target.value })} className={`${field} mt-2`} autoComplete="name" /></label>
            <label className="block text-sm font-medium">Email address<input required type="email" value={details.email} onChange={e => setDetails({ ...details, email: e.target.value })} className={`${field} mt-2`} autoComplete="email" /></label>
            {emailChanged && <label className="block text-sm font-medium"><span className="flex items-center gap-2"><Mail size={14} />Current password to confirm the new email</span><input required type="password" value={details.current_password} onChange={e => setDetails({ ...details, current_password: e.target.value })} className={`${field} mt-2`} autoComplete="current-password" /></label>}
            <div className="flex justify-end"><Button type="submit" disabled={saving !== null}>{saving === 'details' ? 'Saving…' : 'Save details'}</Button></div>
        </form>
        <form onSubmit={savePassword} className="space-y-5 rounded-xl border bg-card p-6">
            <h2 className="flex items-center gap-2 font-semibold"><KeyRound size={17} />Change password</h2>
            <label className="block text-sm font-medium">Current password<input required type="password" value={password.current_password} onChange={e => setPassword({ ...password, current_password: e.target.value })} className={`${field} mt-2`} autoComplete="current-password" /></label>
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium">New password<input required type="password" minLength={8} maxLength={72} value={password.new_password} onChange={e => setPassword({ ...password, new_password: e.target.value })} className={`${field} mt-2`} autoComplete="new-password" /></label>
                <label className="block text-sm font-medium">Confirm new password<input required type="password" minLength={8} maxLength={72} value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} className={`${field} mt-2`} autoComplete="new-password" /></label>
            </div>
            <p className="text-xs text-muted-foreground">At least 8 characters. Other signed-in sessions using your old password stay valid until they expire.</p>
            <div className="flex justify-end"><Button type="submit" disabled={saving !== null}>{saving === 'password' ? 'Saving…' : 'Change password'}</Button></div>
        </form>
    </div>;
}
