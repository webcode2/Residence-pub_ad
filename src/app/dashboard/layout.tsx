"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    LayoutDashboard,
    Users,
    FileText,
    CreditCard,
    AlertTriangle,
    Settings,
    Menu,
    X,
    LogOut,
    Bell,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEstate } from '@/contexts/EstateContext';
import { Brand } from '@/components/shared/Brand';
import { TwoFactorWarning } from '@/components/dashboard/TwoFactorWarning';
import { logoutAction } from '@/actions/auth';

const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/residents', label: 'Directory', icon: Users },
    { path: '/dashboard/logs', label: 'Access Logs', icon: FileText },
    { path: '/dashboard/billing', label: 'Billing Hub', icon: CreditCard },
    { path: '/dashboard/reports', label: 'Reports', icon: AlertTriangle },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { estate } = useEstate();

    const NavLink = ({ item }: { item: typeof navItems[0] }) => {
        const isActive = pathname === item.path;

        return (
            <Link
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
            >
                <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                )} />
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="font-medium whitespace-nowrap overflow-hidden"
                        >
                            {item.label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 80 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border fixed inset-y-0 left-0 z-30"
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                    <Brand
                        size="sm"
                        variant="light"
                        showText={sidebarOpen}
                        className="gap-3"
                        logoClassName="w-8 h-8 rounded-lg"
                        textClassName="text-lg"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
                    >
                        <ChevronRight className={cn(
                            "h-5 w-5 transition-transform duration-300",
                            sidebarOpen ? "rotate-180" : ""
                        )} />
                    </Button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink key={item.path} item={item} />
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-sidebar-border">
                    <button
                        onClick={() => logoutAction()}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        {sidebarOpen && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-sidebar border-r border-sidebar-border z-50 lg:hidden flex flex-col"
                        >
                            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                                <Brand size="sm" variant="default" className="gap-2" textClassName="text-lg" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sidebar-foreground/70"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                            pathname === item.path
                                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                                : "text-sidebar-foreground hover:bg-sidebar-accent"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className={cn(
                "flex-1 flex flex-col transition-all duration-300",
                sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[80px]"
            )}>
                <TwoFactorWarning />
                {/* Top Bar */}
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="font-display font-bold text-foreground">{estate.estateName}</h1>
                            <p className="text-xs text-muted-foreground capitalize">{estate.tier} Plan</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
                        </Button>
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary-foreground">AD</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
