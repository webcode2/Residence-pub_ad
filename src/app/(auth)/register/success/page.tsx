"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterSuccessPage() {
    const [appId, setAppId] = useState('');
    useEffect(() => { setAppId(localStorage.getItem('app_id') || ''); }, []);
    return <div className="space-y-7"><span className="inline-grid h-14 w-14 place-items-center rounded-xl border border-[#d4ddc9] bg-[#e8eedf] text-primary"><CheckCircle2 size={27} strokeWidth={1.5} /></span><div><p className="text-[10px] tracking-[.16em] text-muted-foreground mb-3">A GOOD PLACE TO START</p><h1 className="text-3xl font-medium tracking-tight">Your estate is registered.</h1><p className="text-sm text-muted-foreground leading-7 mt-4">Sign in with your caretaker email, password, and estate App ID to verify your card and activate your free trial. Your card is securely stored by Bachs, and your selected plan renews automatically after the trial unless you cancel.</p></div>{appId && <div className="bg-card border border-border rounded-lg p-5"><p className="text-[10px] text-muted-foreground tracking-wider">YOUR ESTATE APP ID</p><p className="text-xl font-mono mt-3 select-all">{appId}</p><p className="text-xs text-muted-foreground mt-3">Keep this ID for your next sign-in.</p></div>}<Button asChild className="w-full h-12"><Link href="/login">Sign in to your estate<ArrowRight size={17} /></Link></Button><Link href="/" className="block text-center text-xs text-muted-foreground hover:text-primary">Back to Residence</Link></div>;
}
