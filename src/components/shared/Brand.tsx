"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandProps {
    className?: string;
    logoClassName?: string;
    textClassName?: string;
    variant?: "default" | "light" | "dark";
    size?: "sm" | "md" | "lg";
    showText?: boolean;
}

export function Brand({
    className,
    logoClassName,
    textClassName,
    variant = "default",
    size = "md",
    showText = true,
}: BrandProps) {
    const sizeClasses = {
        sm: "gap-1.5",
        md: "gap-2",
        lg: "gap-3",
    };

    const logoSizeClasses = {
        sm: "w-8 h-8 rounded-lg",
        md: "w-10 h-10 rounded-xl",
        lg: "w-12 h-12 rounded-2xl",
    };

    const dotSizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
    };

    const textSizeClasses = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-3xl",
    };

    const themeClasses = {
        default: {
            logo: "bg-blue-900",
            dot: "bg-white",
            text: "text-blue-900",
        },
        light: {
            logo: "bg-white",
            dot: "bg-blue-900",
            text: "text-white",
        },
        dark: {
            logo: "bg-slate-900",
            dot: "bg-emerald-400",
            text: "text-white",
        },
    };

    return (
        <Link
            href="/"
            className={cn(
                "flex items-center transition-opacity hover:opacity-90",
                sizeClasses[size],
                className
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-center transition-transform hover:scale-105 shadow-sm",
                    themeClasses[variant].logo,
                    logoSizeClasses[size],
                    logoClassName
                )}
            >
                <div className={cn(
                    "rounded-full shadow-inner",
                    themeClasses[variant].dot,
                    dotSizeClasses[size]
                )} />
            </div>
            {showText && (
                <span
                    className={cn(
                        "font-black tracking-tighter transition-colors",
                        themeClasses[variant].text,
                        textSizeClasses[size],
                        textClassName
                    )}
                >
                    Residence
                </span>
            )}
        </Link>
    );
}
