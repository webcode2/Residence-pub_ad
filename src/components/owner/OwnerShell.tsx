"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, CreditCard, Users, ScrollText, Layers, Activity, Menu, LogOut, ShieldCheck, Inbox } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Brand } from '@/components/shared/Brand';
import { Button } from '@/components/ui/button';
import { ownerLogout } from '@/actions/owner';
const links = [
    { href: '/owner', label: 'Platform overview', icon: LayoutDashboard }, { href: '/owner/estates', label: 'Estates', icon: Building2 },
    { href: '/owner/subscriptions', label: 'Subscriptions', icon: CreditCard }, { href: '/owner/users', label: 'User access', icon: Users },
    { href: '/owner/plans', label: 'Plan catalogue', icon: Layers }, { href: '/owner/security', label: 'Security feed', icon: Activity }, { href: '/owner/sales', label: 'Sales leads', icon: Inbox }, { href: '/owner/audit', label: 'Admin audit trail', icon: ScrollText },
];
export default function OwnerShell({ name, email, children }: { name: string; email: string; children: React.ReactNode }) {
    const path = usePathname(); const [open, setOpen] = useState(false);
    const nav = <div className="h-full flex flex-col"><div className="p-7"><Brand variant="light" size="sm" /><p className="mt-5 text-[9px] text-[#b8caa8] uppercase tracking-[.18em]">Platform owner console</p></div><nav aria-label="Owner navigation" className="px-4 space-y-1 flex-1">{links.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={path === item.href ? 'page' : undefined} className={`flex items-center gap-3 px-3 py-3 rounded-md text-xs ${path === item.href ? 'bg-[#d6e2c3] text-[#283c2d] font-semibold' : 'text-[#b4c0b5] hover:bg-white/5 hover:text-white'}`}><item.icon size={17} strokeWidth={1.6} />{item.label}</Link>)}</nav><div className="m-4 rounded-lg border border-white/10 p-4 text-[10px] leading-6 text-[#9fb096]"><ShieldCheck size={18} className="mb-2" />Platform access is separate from caretaker workspaces. Subscription and access changes are recorded in the audit trail.</div><button onClick={() => ownerLogout()} className="flex items-center gap-3 border-t border-white/10 px-7 py-5 text-xs text-[#a2b0a4] hover:text-white"><LogOut size={16} />Sign out of owner console</button></div>;
    return <div className="min-h-screen bg-background"><aside className="hidden lg:block fixed inset-y-0 left-0 w-[244px] bg-[#24372e]">{nav}</aside><Sheet open={open} onOpenChange={setOpen}><SheetContent side="left" className="bg-[#24372e] text-white p-0 w-[280px]"><SheetTitle className="sr-only">Owner navigation</SheetTitle><SheetDescription className="sr-only">Manage the Residence platform.</SheetDescription>{nav}</SheetContent></Sheet><div className="lg:ml-[244px] min-w-0"><header className="h-[76px] border-b border-border flex items-center justify-between px-5 sm:px-8 bg-background sticky top-0 z-20 gap-4"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open owner navigation" onClick={() => setOpen(true)}><Menu /></Button><p className="text-xs text-muted-foreground">Platform <span className="mx-2">/</span><span className="text-foreground font-medium">{links.find(item => item.href === path)?.label || 'Overview'}</span></p></div><div className="text-right min-w-0"><p className="text-xs font-medium truncate">{name}</p><p className="text-[10px] text-muted-foreground truncate mt-1">{email}</p></div></header><main className="w-full min-w-0 max-w-[1540px] mx-auto p-5 sm:p-8 lg:p-9">{children}</main></div></div>;
}
