import React from "react";
import { Brand } from "@/components/shared/Brand";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
            {/* Brand Side - Hidden on Mobile */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-blue-900 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <Brand variant="light" size="lg" className="mb-12" />

                    <h2 className="text-5xl font-black mb-6 leading-tight">
                        Security that feels <br /> <span className="text-emerald-400 italic font-serif">like home.</span>
                    </h2>
                    <p className="text-blue-100/80 text-xl max-w-md font-medium">
                        The ultimate multi-tenant platform for modern estate management and secure visitor access.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-blue-900 bg-slate-200" />
                        ))}
                    </div>
                    <p className="text-sm font-bold text-blue-200">
                        Joined by 200+ estates this month
                    </p>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-800/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>

            {/* Form Side */}
            <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>

                {/* Mobile Logo */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <Brand size="sm" variant="default" />
                </div>
            </div>
        </div>
    );
}
