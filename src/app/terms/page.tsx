"use client";

import React from "react";
import { Brand } from "@/components/shared/Brand";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
    const lastUpdated = "January 20, 2026";

    const sections = [
        {
            title: "1. Acceptance of Terms",
            content: "By accessing or using ResidentPass (\"the Platform\"), you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.",
        },
        {
            title: "2. Use License",
            content: "Permission is granted to temporarily download one copy of the materials (information or software) on ResidentPass's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.",
        },
        {
            title: "3. User Conduct",
            content: "Users are responsible for maintaining the confidentiality of their account and password and for restricting access to their computer. You agree to accept responsibility for all activities that occur under your account or password.",
        },
        {
            title: "4. Estate Management Responsibilities",
            content: "Estate administrators are responsible for the accuracy of resident data uploaded to the platform. ResidentPass is not liable for errors in access control resulting from incorrect data provided by the estate.",
        },
        {
            title: "5. Service Fees",
            content: "ResidentPass reserves the right to change its service fees at any time. Any fee changes will be communicated to the estate administration at least 30 days in advance.",
        },
        {
            title: "6. Limitation of Liability",
            content: "In no event shall ResidentPass or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the platform.",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-20">
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <Brand size="md" variant="default" />
                    <Link href="/register">
                        <Button variant="outline" size="sm" className="font-bold">
                            Back to Registration
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto space-y-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider">
                            Legal Documentation
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-blue-900 tracking-tight">Terms and Conditions</h1>
                        <p className="text-slate-500 font-medium">Last Updated: {lastUpdated}</p>
                    </div>

                    <div className="prose prose-slate max-w-none space-y-8">
                        {sections.map((section, index) => (
                            <section key={index} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                <h3 className="text-xl font-black text-blue-900 mb-4">{section.title}</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {section.content}
                                </p>
                            </section>
                        ))}
                    </div>

                    <div className="p-8 bg-blue-900 rounded-[2.5rem] text-center space-y-6 shadow-xl shadow-blue-900/20">
                        <h2 className="text-2xl font-black text-white">Questions about our terms?</h2>
                        <p className="text-blue-100/80 font-medium max-w-md mx-auto">
                            Our legal team is here to help you understand your rights and responsibilities.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="mailto:legal@residentpass.com" className="w-full sm:w-auto">
                                <Button className="w-full h-12 bg-white text-blue-900 hover:bg-emerald-400 hover:text-white transition-all font-bold rounded-xl px-8">
                                    Contact Support
                                </Button>
                            </Link>
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
