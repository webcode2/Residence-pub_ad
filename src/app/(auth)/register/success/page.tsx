"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, Zap, Users, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterSuccessPage() {
    return (
        <div className="space-y-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center relative">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-black text-blue-900 tracking-tight">Registration Complete!</h1>
                <p className="text-slate-500 font-medium text-lg">Your 14-day free trial has been activated.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm text-left space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Included in your trial:</h4>

                <div className="grid gap-4">
                    {[
                        { icon: Users, title: "Unlimited Residents", desc: "Onboard your entire community." },
                        { icon: Zap, title: "IoT RFID Gate Access", desc: "Instant sync with hardware." },
                        { icon: CreditCard, title: "Automated Billing", desc: "Collect fees digitally." },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                <item.icon className="w-5 h-5 text-blue-900" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-700 text-sm">{item.title}</p>
                                <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Button className="w-full h-14 bg-blue-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-900/20 text-lg gap-2" asChild>
                    <Link href="/dashboard">
                        Enter Your Dashboard <ArrowRight className="w-5 h-5" />
                    </Link>
                </Button>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Trial expires in 14 days. No credit card required.
                </p>
            </div>
        </div>
    );
}
