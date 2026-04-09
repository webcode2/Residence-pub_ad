"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, DoorOpen, DollarSign, Settings2, Loader2, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { BillingChart } from '@/components/dashboard/BillingChart';
import { SetGlobalFeeModal } from '@/components/dashboard/SetGlobalFeeModal';
import { Button } from '@/components/ui/button';
import { useEstate } from '@/contexts/EstateContext';
import { useUser } from '@/contexts/UserContext';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useDashboardActivity, DashboardActivity } from '@/hooks/use-dashboard-activity';
import { formatDistanceToNow } from 'date-fns';

export default function Overview() {
    const [feeModalOpen, setFeeModalOpen] = useState(false);
    const { estate } = useEstate();
    const { user } = useUser();

    // Using TanStack Query to manage server state
    const { data: statsData, isLoading: statsLoading, isError: statsError, error: statsErrorObj } = useDashboardStats(estate.appId);
    const { data: activityData, isLoading: activityLoading } = useDashboardActivity(estate.appId);

    const isCaretaker = user?.roles?.includes('caretaker');
    const isLoading = statsLoading || activityLoading;

    const stats = [
        {
            title: 'Total Residents',
            value: statsData?.totalResidents?.toLocaleString() || '0',
            icon: Users,
            trend: { value: statsData?.residentTrend || 0, isPositive: (statsData?.residentTrend || 0) >= 0 },
            subtitle: 'Registered units',
        },
        {
            title: 'Unpaid Units',
            value: statsData?.unpaidUnitsCount?.toLocaleString() || '0',
            icon: AlertTriangle,
            trend: { value: 0, isPositive: true },
            subtitle: 'Outstanding debts',
        },
        {
            title: 'Monthly Revenue',
            value: `₦${new Intl.NumberFormat('en-NG').format(statsData?.monthlyRevenue || 0)}`,
            icon: DollarSign,
            trend: { value: statsData?.revenueTrend || 0, isPositive: (statsData?.revenueTrend || 0) >= 0 },
            subtitle: 'Collections this month',
        },
        {
            title: 'Active Visitors',
            value: statsData?.activeVisitors?.toLocaleString() || '0',
            icon: UserCheck,
            trend: { value: statsData?.visitorTrend || 0, isPositive: (statsData?.visitorTrend || 0) >= 0 },
            subtitle: 'Currently on premises',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    if (statsError) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <Settings2 className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">Failed to load dashboard</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                    {(statsErrorObj as any)?.message || "There was an error connecting to the server. Please try again later."}
                </p>
                <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
                    Retry Connection
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                        Dashboard Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {user?.full_name || 'Resident'}! Here's what's happening today.
                    </p>
                </div>
                {isCaretaker && (
                    <Button variant="hero" onClick={() => setFeeModalOpen(true)}>
                        <Settings2 className="h-4 w-4 mr-2" />
                        Set Global Fee
                    </Button>
                )}
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} loading={statsLoading} />
                ))}
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                    <BillingChart data={statsData?.billingDistribution} loading={statsLoading} />
                </motion.div>

                {/* Quick Actions Card */}
                <motion.div
                    variants={itemVariants}
                    className="stat-card"
                >
                    <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Generate Token', action: 'New resident registration token' },
                            { label: 'Send Reminders', action: 'Billing payment reminders' },
                            { label: 'View Reports', action: 'Security incident reports' },
                            { label: 'Broadcast', action: 'Send estate-wide notification' },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-colors text-left group"
                            >
                                <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
                                    {item.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">{item.action}</p>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
                variants={itemVariants}
                className="stat-card"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-semibold text-foreground">
                        Recent Activity
                    </h3>
                    <Button variant="ghost" size="sm" disabled={activityLoading}>
                        {activityLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "View All"}
                    </Button>
                </div>
                {activityLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/3 bg-secondary animate-pulse rounded" />
                                    <div className="h-3 w-2/3 bg-secondary animate-pulse rounded" />
                                </div>
                                <div className="h-3 w-16 bg-secondary animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {Array.isArray(activityData) && activityData.length > 0 ? (
                            activityData.map((activity: DashboardActivity, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                    <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'entry' ? 'bg-accent' :
                                        activity.type === 'visitor' ? 'bg-orange-500' :
                                            activity.type === 'payment' ? 'bg-success' :
                                                'bg-primary'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground">
                                            {activity.action.includes(user?.full_name || "") ? (
                                                <span className="flex items-center gap-2">
                                                    {activity.action.replace(user?.full_name || "", "")}
                                                    <span className="text-secondary font-black tracking-widest uppercase text-[10px]">YOU</span>
                                                </span>
                                            ) : activity.action}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">{activity.details}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-muted-foreground">
                                No recent activity found.
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            <SetGlobalFeeModal open={feeModalOpen} onClose={() => setFeeModalOpen(false)} />
        </motion.div>
    );
}
