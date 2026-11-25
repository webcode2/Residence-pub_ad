"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, CreditCard, Settings, Menu, LogOut, Bell, MessagesSquare, ChevronRight, ArrowUpRight, ShieldCheck, Building2, LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useEstate } from '@/contexts/EstateContext';
import { useUser } from '@/contexts/UserContext';
import { Brand } from '@/components/shared/Brand';
import { logoutAction } from '@/actions/auth';

const groups = [
    { label: 'WORKSPACE', items: [
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/dashboard/residents', label: 'Resident directory', icon: Users },
        { path: '/dashboard/security', label: 'Security staff', icon: ShieldCheck },
        { path: '/dashboard/logs', label: 'Access logs', icon: FileText },
        { path: '/dashboard/conversations', label: 'Conversations', icon: MessagesSquare },
        { path: '/dashboard/sos', label: 'SOS alert history', icon: ShieldCheck },
    ] },
    { label: 'ESTATE MANAGEMENT', items: [
        { path: '/dashboard/subscription', label: 'Estate subscription', icon: CreditCard },
        { path: '/dashboard/reports', label: 'Incident reports', icon: ShieldCheck },
        { path: '/dashboard/notifications', label: 'Announcements', icon: Bell },
        { path: '/dashboard/settings', label: 'Estate settings', icon: Settings },
    ] },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { estate } = useEstate();
    const { user } = useUser();
    const current = groups.flatMap(group => group.items).find(item => item.path === pathname);
    const name = user?.full_name || 'Estate caretaker';
    const initials = name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
    const signOut = async () => {
        localStorage.removeItem('access_token'); localStorage.removeItem('app_id');
        await logoutAction();
    };
    const sidebar = <div className="flex h-full flex-col">
        <div className="px-7 pt-8 pb-7"><Brand variant="light" size="sm" textClassName="!font-semibold !tracking-tight" logoClassName="!bg-[#c7d7b5] !rounded-lg" /></div>
        <div className="mx-4 mb-7 rounded-lg border border-white/10 bg-white/[.035] p-3 flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-md border border-white/10 grid place-items-center text-[#c6d4b9]"><Building2 size={17} /></div>
            <div className="min-w-0"><p className="text-xs font-medium text-stone-100 truncate">{estate.appId ? estate.estateName : 'Your estate'}</p><p className="text-[10px] text-[#9dac9e] mt-1">Caretaker workspace</p></div>
        </div>
        <nav aria-label="Dashboard navigation" className="flex-1 px-4 space-y-7 overflow-y-auto scrollbar-hide">
            {groups.map(group => <div key={group.label}><p className="px-3 text-[9px] tracking-[.16em] text-[#8b9c8f] mb-3">{group.label}</p><div className="space-y-1">{group.items.map(item => {
                const active = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(`${item.path}/`));
                return <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)} aria-current={active ? 'page' : undefined}
                    className={cn('flex items-center gap-3 rounded-md px-3 py-3 text-xs transition-colors', active ? 'bg-[#d6e2c3] text-[#283c2d] font-semibold' : 'text-[#b4c0b5] hover:bg-white/[.06] hover:text-white')}><item.icon size={17} strokeWidth={1.65} />{item.label}{active && <span className="ml-auto h-1 w-1 rounded-full bg-[#48653e]" />}</Link>;
            })}</div></div>)}
        </nav>
        <div className="mx-4 my-6 rounded-lg border border-white/10 p-4"><div className="flex gap-2 items-center text-[#d7e1cb]"><ShieldCheck size={16} /><p className="text-xs font-medium">Your estate. Your space.</p></div><p className="mt-2 text-[10px] leading-relaxed text-[#91a192]">Manage your community with a clear view of the details.</p><Link href="/#faq" className="mt-3 inline-flex items-center gap-2 text-[10px] text-[#c5d7b2] hover:text-white">Platform guide<ArrowUpRight size={12} /></Link></div>
        <button onClick={signOut} className="flex items-center gap-3 border-t border-white/10 px-7 py-5 text-xs text-[#a2b0a4] hover:text-white"><LogOut size={16} />Sign out</button>
    </div>;
    return <div className="min-h-screen bg-background">
        <a href="#dashboard-content" className="skip-link">Skip to dashboard content</a>
        <aside className="hidden lg:block fixed inset-y-0 left-0 w-[244px] overflow-hidden bg-[#24372e] z-40">{sidebar}</aside>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetContent side="left" className="w-[280px] p-0 border-0 bg-[#24372e] text-white"><SheetTitle className="sr-only">Estate navigation</SheetTitle><SheetDescription className="sr-only">Navigate your estate management workspace.</SheetDescription>{sidebar}</SheetContent></Sheet>
        <div className="lg:ml-[244px] min-w-0">
            <header className="h-[76px] border-b border-border bg-background/95 backdrop-blur-md flex items-center justify-between gap-4 px-5 sm:px-8 sticky top-0 z-30">
                <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open estate navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></Button><span className="hidden sm:inline">Workspace</span><ChevronRight className="hidden sm:block h-3 w-3" /><span className="text-foreground font-medium truncate">{current?.label || 'Estate settings'}</span></div>
                <div className="flex items-center gap-4"><span className="hidden md:inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[10px] text-muted-foreground"><ShieldCheck size={12} />Estate caretaker</span><Link href="/dashboard/notifications" aria-label="Manage announcements" className="p-2 text-muted-foreground rounded-md hover:bg-muted"><Bell size={18} strokeWidth={1.6} /></Link><div className="h-7 border-l border-border" /><Link href="/dashboard/profile" className="flex items-center gap-3" aria-label={`Profile for ${name}`}><div className="hidden md:block text-right"><p className="text-xs font-medium">{name}</p><p className="text-[10px] text-muted-foreground mt-1">{user?.app_id || 'Estate account'}</p></div><span className="grid h-9 w-9 place-items-center rounded-full border border-[#d4ddc9] bg-[#e8eedf] text-[11px] font-semibold text-[#526c42]">{initials}</span></Link></div>
            </header>
            <main id="dashboard-content" className="w-full min-w-0 p-5 sm:p-8 lg:p-9 max-w-[1540px] mx-auto">{children}</main>
            <footer className="w-full max-w-[1540px] mx-auto px-5 sm:px-8 lg:px-9 pb-6 flex flex-wrap justify-between gap-3 text-[10px] text-muted-foreground"><span>Residence · Estate management, thoughtfully connected.</span><div className="flex gap-5"><Link href="/privacy" className="hover:text-foreground">Privacy</Link><Link href="/#faq" className="inline-flex gap-1.5 items-center hover:text-foreground"><LifeBuoy size={12} />Help & FAQs</Link></div></footer>
        </div>
    </div>;
}
