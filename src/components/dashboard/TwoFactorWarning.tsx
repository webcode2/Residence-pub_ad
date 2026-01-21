"use client";

import React from "react";
import { ShieldAlert, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface TwoFactorWarningProps {
    onEnable?: () => void;
    onDismiss?: () => void;
}

export function TwoFactorWarning({ onEnable, onDismiss }: TwoFactorWarningProps) {
    const [isVisible, setIsVisible] = React.useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-amber-50 border-b border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30 overflow-hidden"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex-1 flex items-center gap-3">
                            <div className="hidden sm:flex p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                <ShieldAlert className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                    Secure your estate with Two-Factor Authentication
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                                    Your account is currently less secure. Enable 2FA to protect sensitive estate data.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/settings">
                                <Button
                                    size="sm"
                                    className="bg-amber-600 hover:bg-amber-700 text-white border-none h-8 text-xs font-bold rounded-lg px-4"
                                    onClick={onEnable}
                                >
                                    Enable Now
                                    <ArrowRight className="ml-1.5 h-3 w-3" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-700 hover:bg-amber-100 dark:text-amber-500 dark:hover:bg-amber-900/30"
                                onClick={() => {
                                    setIsVisible(false);
                                    onDismiss?.();
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
