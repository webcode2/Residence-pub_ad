"use client";

import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { getCurrentEstateSubscription } from '@/actions/conversations';
import { AutomaticRenewal } from '@/components/CardActivation';
import SubscriptionRenewal from '@/components/SubscriptionRenewal';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';

export default function EstatePlan() {
    const { user } = useUser();
    const plan = useQuery({
        queryKey: ['estate-subscription', user?.id, user?.app_id],
        enabled: !!user?.app_id,
        queryFn: async () => {
            const result = await getCurrentEstateSubscription();
            if (!result.data) throw new Error(result.error);
            return result.data;
        },
        retry: false,
        refetchOnWindowFocus: false,
    });
    const subscription = plan.data;
    const limit = subscription?.monthly_verifications_limit;
    const features = subscription ? [
        subscription.rfid_enabled ? 'RFID access included' : 'RFID access unavailable',
        subscription.realtime_alerts_enabled ? 'Real-time alerts included' : 'Real-time alerts unavailable',
        `${subscription.log_retention_days} days of access-log retention`,
    ] : [];

    return (
        <section id="subscription" aria-labelledby="estate-plan-title" className="scroll-mt-24 space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <h2 id="estate-plan-title" className="text-xl font-semibold">Current plan</h2>
                <Button variant="outline" disabled={plan.isFetching} onClick={() => plan.refetch()}>
                    <RefreshCw size={15} /> Refresh
                </Button>
            </header>
            {plan.error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm">{plan.error.message}</p>}
            {plan.isLoading && <p role="status" className="rounded-xl border bg-card p-6 text-sm">Loading your estate plan…</p>}
            {subscription && <>
                <div className="overflow-hidden rounded-xl border bg-card">
                    <div className="grid md:grid-cols-2">
                        <div className="bg-muted/60 p-6">
                            <h3 className="text-2xl font-semibold capitalize">{subscription.tier}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">$${subscription.price_monthly.toFixed(2)} USD / month</p>
                            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                                <div><dt className="text-muted-foreground">Status</dt><dd className="capitalize">{subscription.status}</dd></div>
                                <div><dt className="text-muted-foreground">Expiry date</dt><dd>{subscription.expiry_date}</dd></div>
                            </dl>
                        </div>
                        <div className="p-6">
                            <h3 className="text-sm font-medium">Monthly verification usage</h3>
                            <p className="mt-2 text-2xl font-semibold tabular-nums">{subscription.current_month_verifications.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">of {limit?.toLocaleString() ?? 'unlimited'} verifications</p>
                            {limit != null && <progress
                                aria-label="Monthly verification usage"
                                className="mt-3 h-2 w-full accent-primary"
                                value={subscription.current_month_verifications}
                                max={Math.max(1, limit)}
                            />}
                            {subscription.verifications_remaining != null && <p className="mt-2 text-sm">{subscription.verifications_remaining.toLocaleString()} remaining</p>}
                            <p className="mt-2 text-xs text-muted-foreground">Billing cycle started {subscription.billing_cycle_start}</p>
                        </div>
                    </div>
                    <ul aria-label="Plan features" className="grid gap-3 border-t p-6 text-sm sm:grid-cols-3">
                        {features.map(feature => (
                            <li key={feature} className="flex items-start gap-2">
                                <ShieldCheck size={16} className="shrink-0 text-primary" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
                <AutomaticRenewal>
                    <SubscriptionRenewal tier={subscription.tier} appId={user?.app_id || ''} />
                </AutomaticRenewal>
            </>}
        </section>
    );
}
