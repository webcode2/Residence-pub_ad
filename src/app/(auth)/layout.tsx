import React from 'react';
import { Brand } from '@/components/shared/Brand';
import { ShieldCheck, MessagesSquare, Users } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <div className="min-h-screen grid lg:grid-cols-2 bg-background">
        <aside className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-[#253c30] text-[#f1f3e9] relative overflow-hidden">
            <Brand variant="light" size="sm" logoClassName="!bg-[#c7d7b5]" textClassName="!font-semibold !tracking-tight" />
            <div className="py-16"><p className="text-[10px] tracking-[.17em] text-[#aec39e] mb-6">THE PLACE YOU CALL HOME, CONNECTED.</p><h2 className="text-5xl xl:text-6xl font-medium tracking-[-.045em] leading-[1.12]">A little order.<br />A better<br /><span className="serif-word text-[#c5d3b6]">everyday.</span></h2><p className="mt-7 text-sm leading-7 text-[#acbaab] max-w-sm">A considered workspace for estate caretakers, connected to your residents and the team at your gates.</p><div className="mt-10 border-t border-white/15 pt-7 space-y-5">{[[Users, 'Bring your community together'], [ShieldCheck, 'Keep a clear view of gate activity'], [MessagesSquare, 'Every conversation, accounted for']].map(([Icon, text]) => { const I = Icon as typeof Users; return <div key={String(text)} className="flex items-center gap-3 text-xs text-[#c2ceba]"><I size={17} strokeWidth={1.5} />{String(text)}</div>; })}</div></div>
            <p className="text-[10px] text-[#91a58e]">Residence · Thoughtfully connected. Clearly managed.</p>
        </aside>
        <div className="flex flex-col items-center justify-center p-6 pt-28 pb-12 sm:p-12 sm:pt-28 lg:py-14 relative"><div className="absolute top-8 left-6 sm:left-12 lg:hidden"><Brand size="sm" /></div><div className="w-full max-w-[390px]">{children}</div></div>
    </div>;
}
