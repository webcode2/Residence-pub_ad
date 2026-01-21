"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, DoorOpen, DollarSign, Settings2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { BillingChart } from '@/components/dashboard/BillingChart';
import { SetGlobalFeeModal } from '@/components/dashboard/SetGlobalFeeModal';
import { Button } from '@/components/ui/button';
import { useEstate } from '@/contexts/EstateContext';

export default function Overview() {
    const [loading, setLoading] = useState(true);
    const [feeModalOpen, setFeeModalOpen] = useState(false);
    const { estate } = useEstate();

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const stats = [
        {
            title: 'Total Residents',
            value: '1,248',
            icon: Users,
            trend: { value: 12, isPositive: true },
            subtitle: '179 units registered',
        },
        {
            title: 'Active Visitors',
            value: '47',
            icon: UserCheck,
            trend: { value: 8, isPositive: true },
            subtitle: 'Currently on premises',
        },
        {
            title: 'Today\'s Check-ins',
            value: '234',
            icon: DoorOpen,
            trend: { value: 5, isPositive: false },
            subtitle: 'vs 247 yesterday',
        },
        {
            title: 'Monthly Revenue',
            value: `₦${new Intl.NumberFormat('en-NG').format(estate.globalFee * 127)}`,
            icon: DollarSign,
            trend: { value: 15, isPositive: true },
            subtitle: '127 payments received',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                        Dashboard Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back! Here's what's happening today.
                    </p>
                </div>
                <Button variant="hero" onClick={() => setFeeModalOpen(true)}>
                    <Settings2 className="h-4 w-4 mr-2" />
                    Set Global Fee
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={stat.title} {...stat} loading={loading} />
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BillingChart loading={loading} />

                {/* Quick Actions Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="stat-card"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-display font-semibold text-foreground">
                        Recent Activity
                    </h3>
                    <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="space-y-3">
                    {[
                        { action: 'Visitor checked in', details: 'Token 4829 - John Doe visiting Unit 12A', time: '2 min ago', type: 'entry' },
                        { action: 'Payment received', details: '₦50,000 from Unit 8B - Service charge', time: '15 min ago', type: 'payment' },
                        { action: 'New resident registered', details: 'Sarah Johnson - Unit 15C', time: '1 hour ago', type: 'register' },
                        { action: 'Visitor checked out', details: 'Token 3721 - Delivery agent', time: '2 hours ago', type: 'exit' },
                    ].map((activity, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                            <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'entry' ? 'bg-accent' :
                                    activity.type === 'exit' ? 'bg-muted-foreground' :
                                        activity.type === 'payment' ? 'bg-success' :
                                            'bg-primary'
                                }`} />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground">{activity.action}</p>
                                <p className="text-sm text-muted-foreground truncate">{activity.details}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <SetGlobalFeeModal open={feeModalOpen} onClose={() => setFeeModalOpen(false)} />
        </div>
    );
}
