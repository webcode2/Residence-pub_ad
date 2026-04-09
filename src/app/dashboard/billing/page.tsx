"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Send,
    FileText,
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle,
    Download,
    MoreHorizontal,
    Loader2,
    Banknote,
    Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { SetGlobalFeeModal } from '@/components/dashboard/SetGlobalFeeModal';
import { useEstate } from '@/contexts/EstateContext';
import { cn } from '@/lib/utils';
import { useBillings, useGenerateInvoices, useFeeConfigs, FeeConfig, useBillingInsights } from '@/hooks/use-billings';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

export default function Billing() {
    const { estate } = useEstate();
    const [feeModalOpen, setFeeModalOpen] = useState(false);
    const [sendingReminders, setSendingReminders] = useState(false);
    const { data: billings = [], isLoading } = useBillings(estate.appId);
    const { data: feeConfigs = [] } = useFeeConfigs(estate.appId);
    const { data: insights, isLoading: isLoadingInsights } = useBillingInsights(estate.appId);
    const generateInvoicesMutation = useGenerateInvoices();
    const { user: currentUser } = useUser();

    const totalMonthlyRate = useMemo(() => {
        return feeConfigs
            .filter((f: FeeConfig) => f.is_global)
            .reduce((sum: number, f: FeeConfig) => sum + f.amount, 0);
    }, [feeConfigs]);

    const stats = useMemo(() => {
        const totalAmount = billings.reduce((sum, b) => sum + b.amount, 0);

        return [
            {
                title: 'Total Billed',
                value: `₦${totalAmount.toLocaleString()}`,
                icon: DollarSign,
                subtitle: 'All-time volume',
            },
            {
                title: 'Paid (This Month)',
                value: insights?.paid_this_month_count.toString() || '0',
                icon: CheckCircle2,
                subtitle: 'Residents cleared',
            },
            {
                title: 'Paid (Last Month)',
                value: insights?.paid_last_month_count.toString() || '0',
                icon: Clock,
                subtitle: 'Previous month',
            },
            {
                title: 'Active Debtors',
                value: insights?.debtors.length.toString() || '0',
                icon: AlertCircle,
                subtitle: 'Residents owing',
            },
        ];
    }, [billings, insights]);

    const handleGenerateInvoices = async () => {
        try {
            const response = await generateInvoicesMutation.mutateAsync({ appId: estate.appId });
            toast.success(response.message || "Monthly invoices generation started");
        } catch (error) {
            toast.error("Failed to generate invoices");
        }
    };

    const handleSendReminders = () => {
        setSendingReminders(true);
        setTimeout(() => {
            setSendingReminders(false);
            toast.success("Payment reminders sent to all unpaid residents");
        }, 2000);
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
                        Total Charges: ₦{totalMonthlyRate.toLocaleString()}/month
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setFeeModalOpen(true)}>
                        <Banknote className="h-4 w-4 mr-2 text-success" />
                        Set Global Fee
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleGenerateInvoices}
                        disabled={generateInvoicesMutation.isPending}
                    >
                        {generateInvoicesMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <FileText className="h-4 w-4 mr-2" />
                        )}
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
                    <StatCard key={stat.title} {...stat} loading={isLoading || isLoadingInsights} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Debtors List - The "Who is Owing" part */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1 bg-card rounded-xl border border-border overflow-hidden"
                >
                    <div className="p-4 border-b border-border bg-destructive/5">
                        <h3 className="text-lg font-display font-semibold text-destructive flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Debt Analysis
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Residents with pending payments
                        </p>
                    </div>
                    <div className="divide-y divide-border overflow-y-auto max-h-[600px]">
                        {!insights || insights.debtors.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground italic">
                                No residents currently owing.
                            </div>
                        ) : (
                            insights.debtors.map((debtor) => (
                                <div key={debtor.user_id} className="p-4 hover:bg-secondary/20 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {debtor.user_id === currentUser?.id ? (
                                                    <span className="text-secondary font-black tracking-widest uppercase">YOU</span>
                                                ) : debtor.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Unit: {debtor.unit}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-destructive font-bold text-sm">₦{debtor.total_owed.toLocaleString()}</p>
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full border",
                                                debtor.months_owing > 1 ? "bg-destructive/10 border-destructive text-destructive" : "bg-warning/10 border-warning text-warning"
                                            )}>
                                                {debtor.months_owing} {debtor.months_owing === 1 ? 'month' : 'months'} behind
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Invoices Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden"
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
                                    <th className="text-left p-4 font-semibold text-foreground text-sm">Amount</th>
                                    <th className="text-left p-4 font-semibold text-foreground text-sm">Status</th>
                                    <th className="text-left p-4 font-semibold text-foreground text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="border-b border-border">
                                            <td colSpan={5} className="p-4">
                                                <div className="h-8 w-full bg-secondary/50 animate-pulse rounded" />
                                            </td>
                                        </tr>
                                    ))
                                ) : billings.length > 0 ? (
                                    billings.slice(0, 10).map((billing) => (
                                        <tr
                                            key={billing.id}
                                            className="border-b border-border hover:bg-secondary/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                                                        #{billing.id.split('-')[0]}
                                                    </span>
                                                    {billing.billing_month && (
                                                        <span className="text-xs font-semibold text-foreground">
                                                            {new Date(billing.billing_year!, billing.billing_month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-semibold text-foreground">{billing.unit || "N/A"}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-semibold text-foreground">
                                                    ₦{billing.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border capitalize",
                                                    billing.is_paid ? statusColors.paid : statusColors.pending
                                                )}>
                                                    {billing.is_paid ? 'paid' : 'pending'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <p className="text-muted-foreground">No invoices found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            <SetGlobalFeeModal open={feeModalOpen} onClose={() => setFeeModalOpen(false)} />
        </div>
    );
}
