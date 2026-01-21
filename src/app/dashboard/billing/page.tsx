"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Send,
    FileText,
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { useEstate } from '@/contexts/EstateContext';
import { cn } from '@/lib/utils';

interface Invoice {
    id: string;
    unit: string;
    residentName: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    dueDate: string;
    paidDate?: string;
}

const mockInvoices: Invoice[] = [
    { id: 'INV-001', unit: '12A', residentName: 'Chief Adebayo Williams', amount: 50000, status: 'paid', dueDate: '2024-01-15', paidDate: '2024-01-12' },
    { id: 'INV-002', unit: '8B', residentName: 'Dr. Emeka Okonkwo', amount: 50000, status: 'paid', dueDate: '2024-01-15', paidDate: '2024-01-10' },
    { id: 'INV-003', unit: '15C', residentName: 'Sarah Johnson', amount: 50000, status: 'pending', dueDate: '2024-01-20' },
    { id: 'INV-004', unit: '3D', residentName: 'Alhaji Musa Ibrahim', amount: 50000, status: 'overdue', dueDate: '2024-01-05' },
    { id: 'INV-005', unit: '7E', residentName: 'Mrs. Folake Adeleke', amount: 50000, status: 'pending', dueDate: '2024-01-25' },
    { id: 'INV-006', unit: '21F', residentName: 'Engineer Kola Bamidele', amount: 50000, status: 'paid', dueDate: '2024-01-15', paidDate: '2024-01-14' },
];

export default function Billing() {
    const { estate } = useEstate();
    const [sendingReminders, setSendingReminders] = useState(false);

    const stats = [
        {
            title: 'Total Revenue',
            value: `₦${(estate.globalFee * 127).toLocaleString()}`,
            icon: DollarSign,
            subtitle: 'This month',
        },
        {
            title: 'Paid Invoices',
            value: '127',
            icon: CheckCircle2,
            subtitle: '71% of total',
        },
        {
            title: 'Pending',
            value: '34',
            icon: Clock,
            subtitle: 'Awaiting payment',
        },
        {
            title: 'Overdue',
            value: '18',
            icon: AlertCircle,
            subtitle: 'Need attention',
        },
    ];

    const handleSendReminders = () => {
        setSendingReminders(true);
        setTimeout(() => setSendingReminders(false), 2000);
    };

    const statusColors = {
        paid: 'bg-success/10 text-success border-success/20',
        pending: 'bg-warning/10 text-warning border-warning/20',
        overdue: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                        Billing Hub
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage service charges and payments
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Invoices
                    </Button>
                    <Button
                        variant="hero"
                        onClick={handleSendReminders}
                        disabled={sendingReminders}
                    >
                        <Send className={cn("h-4 w-4 mr-2", sendingReminders && "animate-pulse")} />
                        {sendingReminders ? 'Sending...' : 'Send Reminders'}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Invoices Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
            >
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-lg font-display font-semibold text-foreground">
                        Recent Invoices
                    </h3>
                    <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30">
                                <th className="text-left p-4 font-semibold text-foreground text-sm">Invoice</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm">Unit</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm hidden md:table-cell">Resident</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm">Amount</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm hidden lg:table-cell">Due Date</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm">Status</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockInvoices.map((invoice) => (
                                <tr
                                    key={invoice.id}
                                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                                >
                                    <td className="p-4">
                                        <span className="font-mono text-sm text-foreground">{invoice.id}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-semibold text-foreground">{invoice.unit}</span>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <span className="text-foreground">{invoice.residentName}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-semibold text-foreground">
                                            ₦{invoice.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-4 hidden lg:table-cell">
                                        <span className="text-muted-foreground">
                                            {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={cn(
                                            "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border capitalize",
                                            statusColors[invoice.status]
                                        )}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Showing 6 of 179 invoices
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
            </motion.div>

            {/* Invoice Generation History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="stat-card"
            >
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                    Invoice Generation History
                </h3>
                <div className="space-y-3">
                    {[
                        { date: 'January 1, 2024', count: 179, total: 8950000 },
                        { date: 'December 1, 2023', count: 175, total: 8750000 },
                        { date: 'November 1, 2023', count: 172, total: 8600000 },
                    ].map((batch, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
                        >
                            <div>
                                <p className="font-medium text-foreground">{batch.date}</p>
                                <p className="text-sm text-muted-foreground">{batch.count} invoices generated</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-foreground">₦{batch.total.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">Total billed</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
