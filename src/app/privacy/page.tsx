"use client";

import React from "react";
import { Brand } from "@/components/shared/Brand";
import { ShieldCheck, Eye, Lock, Database, Globe, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
    const lastUpdated = "January 20, 2026";

    const sections = [
        {
            icon: Database,
            title: "Data We Collect",
            content: "We collect information necessary for estate management, including resident names, addresses, vehicle details, and visitor visitor numbers. We also log time-stamped entry and exit data at gatehouses.",
        },
        {
            icon: Lock,
            title: "How We Protect Your Data",
            content: "ResidentPass implements industry-standard encryption for data at rest and in transit. Our servers are hosted in secure Nigerian data centers with strict access controls and regular security audits.",
        },
        {
            icon: Eye,
            title: "Data Usage",
            content: "Information collected is used solely for enhancing estate security, facilitating resident-visitor communication, and managing estate billing. We never sell your personal data to third parties.",
        },
        {
            icon: Globe,
            title: "NDPR Compliance",
            content: "We are committed to the Nigeria Data Protection Regulation (NDPR). We ensure all processing of personal data is lawful, fair, and transparent, with full respect for the rights of data subjects.",
        },
        {
            icon: UserCheck,
            title: "Your Data Rights",
            content: "Residents have the right to access their personal data, request corrections, and, under certain circumstances, request the deletion of their information through their estate administrator.",
        },
        {
            icon: ShieldCheck,
            title: "Security Measures",
            content: "Our platform uses multi-factor authentication for admins and secure tokens for visitor access. We conduct regular penetration testing to ensure our defenses are robust.",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-20">
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <Brand size="md" variant="default" />
                    <Link href="/register">
                        <Button variant="outline" size="sm" className="font-bold border-emerald-100 text-emerald-600 hover:bg-emerald-50">
                            Back to Registration
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                            Data Privacy & Safety
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-blue-900 tracking-tight">Privacy Policy</h1>
                        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                            At ResidentPass, we believe privacy is a fundamental right. Discover how we safeguard your community's data.
                        </p>
                        <p className="text-slate-400 font-bold text-sm tracking-wide">LAST UPDATED: {lastUpdated}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {sections.map((section, index) => (
                            <section key={index} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                                    <section.icon className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black text-blue-900 mb-3">{section.title}</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {section.content}
                                </p>
                            </section>
                        ))}
                    </div>

                    <div className="p-12 bg-emerald-500 rounded-[3rem] text-center space-y-8 shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-900 opacity-0 group-hover:opacity-10 transition-opacity" />
                        <div className="relative z-10 space-y-4">
                            <h2 className="text-3xl font-black text-white">Trust is our Priority</h2>
                            <p className="text-emerald-50 font-medium max-w-lg mx-auto text-lg leading-relaxed">
                                We are strictly compliant with NDPR and local regulations to ensure your data stays where it belongs: in your hands.
                            </p>
                            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="mailto:privacy@residentpass.com" className="w-full sm:w-auto">
                                    <Button className="w-full h-14 bg-white text-emerald-600 hover:bg-blue-900 hover:text-white transition-all font-black rounded-2xl px-10 text-lg shadow-lg">
                                        Data Access Request
                                    </Button>
                                </Link>
                                <Link href="/terms" className="w-full sm:w-auto">
                                    <Button variant="ghost" className="w-full h-14 text-white hover:bg-white/20 font-bold rounded-2xl px-10">
                                        View Terms of Service
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                    &copy; 2026 ResidentPass Technologies Ltd. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
