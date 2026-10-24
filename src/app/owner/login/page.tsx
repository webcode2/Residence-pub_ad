"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { Brand } from '@/components/shared/Brand';
import { Button } from '@/components/ui/button';
import { ownerLogin } from '@/actions/owner';

export default function OwnerLoginPage() {
    const router = useRouter(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [pending, setPending] = useState(false); const [error, setError] = useState('');
    async function submit(event: React.FormEvent) { event.preventDefault(); setPending(true); setError(''); try { const result = await ownerLogin({ email, password }); if (result.error) setError(result.error); else { router.replace('/owner'); router.refresh(); } } finally { setPending(false); } }
    return <main className="min-h-screen bg-[#24372e] grid place-items-center p-6"><div className="w-full max-w-md"><Brand variant="light" size="sm" className="mb-10" /><div className="bg-background rounded-xl p-7 sm:p-9 border border-white/20"><ShieldCheck size={28} strokeWidth={1.5} className="text-primary mb-6" /><p className="text-[10px] tracking-[.17em] text-muted-foreground">RESIDENCE · PLATFORM ADMINISTRATION</p><h1 className="text-3xl font-medium tracking-tight mt-3">Owner console</h1><p className="text-xs text-muted-foreground leading-6 mt-3">Manage estates, subscriptions, and platform access. This sign-in is reserved for the SaaS owner.</p><form onSubmit={submit} className="space-y-5 mt-7"><label className="block text-xs font-medium">Owner email<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className="block mt-2 w-full border border-input bg-card rounded-md px-3 py-3 text-sm" /></label><label className="block text-xs font-medium">Password<input type="password" minLength={8} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="block mt-2 w-full border border-input bg-card rounded-md px-3 py-3 text-sm" /></label>{error && <p role="alert" className="text-xs text-destructive leading-6">{error}</p>}<Button disabled={pending} className="w-full h-12" type="submit">{pending ? 'Signing in…' : 'Sign in to owner console'}<ArrowRight size={16} /></Button></form><Link href="/login" className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"><ArrowLeft size={13} />Estate caretaker sign-in</Link></div><Link href="/" className="block text-center text-xs text-white/60 mt-6 hover:text-white">Back to Residence</Link></div></main>;
}
