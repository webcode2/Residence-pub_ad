"use client";

import { useState, useEffect, useMemo } from 'react';
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
    User,
    LogOut,
    Bell,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEstate } from '@/contexts/EstateContext';
import { useUser } from '@/contexts/UserContext';
import { Brand } from '@/components/shared/Brand';
import { TwoFactorWarning } from '@/components/dashboard/TwoFactorWarning';
import { logoutAction } from '@/actions/auth';

const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['caretaker', 'landlord', 'resident'] },
    { path: '/dashboard/residents', label: 'Directory', icon: Users, roles: ['caretaker', 'landlord'] },
    { path: '/dashboard/logs', label: 'Access Logs', icon: FileText, roles: ['caretaker', 'landlord', 'resident'] },
    { path: '/dashboard/billing', label: 'Billing Hub', icon: CreditCard, roles: ['caretaker', 'landlord', 'resident'] },
    { path: '/dashboard/profile', label: 'Profile', icon: User, roles: ['caretaker', 'landlord', 'resident'] },
    { path: '/dashboard/reports', label: 'Reports', icon: AlertTriangle, roles: ['caretaker'] },
    { path: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['caretaker'] },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['caretaker'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { estate } = useEstate();
    const { user, isLoading: userLoading } = useUser();

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredNavItems = useMemo(() => {
        if (!user) return [];
        return navItems.filter(item =>
            item.roles.some(role =>
                user.roles?.some(uRole => uRole.toLowerCase() === role.toLowerCase() || uRole.toLowerCase() === 'saas_owner')
            )
        );
    }, [user]);

    // Provide a default list for SSR to avoid empty nav mismatch
    const displayNavItems = mounted && !userLoading ? filteredNavItems : [];

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

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
                    {userLoading || !mounted ? (
                        // Skeleton loading states
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg animate-pulse bg-sidebar-accent/50 mb-1">
                                <div className="h-5 w-5 rounded bg-sidebar-foreground/20" />
                                {sidebarOpen && <div className="h-4 w-24 rounded bg-sidebar-foreground/20" />}
                            </div>
                        ))
                    ) : (
                        displayNavItems.map((item: any) => (
                            <NavLink key={item.path} item={item} />
                        ))
                    )}
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
                                {userLoading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg animate-pulse bg-sidebar-accent/50 mb-1">
                                            <div className="h-5 w-5 rounded bg-sidebar-foreground/20" />
                                            <div className="h-4 w-24 rounded bg-sidebar-foreground/20" />
                                        </div>
                                    ))
                                ) : (
                                    displayNavItems.map((item: any) => (
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
                                    ))
                                )}
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
                        {mounted && (
                            <div className="flex items-center gap-3 pl-3 border-l border-border">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-semibold text-foreground leading-none">{user?.full_name}</p>
                                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                                        {user?.roles?.[0] || 'User'}
                                    </p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30 shadow-sm">
                                    <span className="text-sm font-bold text-accent">
                                        {user ? getInitials(user.full_name) : '??'}
                                    </span>
                                </div>
                            </div>
                        )}
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
