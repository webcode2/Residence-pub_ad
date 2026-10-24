'use client';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {getCardActivation,cardActivationAction} from '@/actions/card-activation';
import {Button} from '@/components/ui/button';
import {useUser} from '@/contexts/UserContext';
import {usePathname} from 'next/navigation';
import Link from 'next/link';

export default function CardActivation({children}:{children:React.ReactNode}) {
 const {user}=useUser(); const pathname=usePathname();
 const q=useQuery({queryKey:['card-activation',user?.app_id],queryFn:getCardActivation,enabled:!!user?.app_id,retry:1,refetchOnWindowFocus:false});
 const [consent,setConsent]=useState(false); const [tier,setTier]=useState('starter');
 const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [url,setUrl]=useState('');
 // Public plans are loaded by the same endpoint as subscription renewal.
 const prices=useQuery({queryKey:['activation-prices'],queryFn:async()=>{const {getRenewalPlans}=await import('@/actions/subscription-checkout');const result=await getRenewalPlans();if(!result.data)throw new Error(result.error);return result.data;},enabled:!!q.data?.activation_required});
 async function act(action:'start'|'confirm'|'cancel') {
  setBusy(true);setError('');try{const r=await cardActivationAction(action,q.data?.checkout_url?q.data.tier:tier,q.data?.checkout_url?true:consent,q.data?.checkout_url?q.data.price_monthly:prices.data?.find(p=>p.tier===tier)?.price_monthly);if(r.error)setError(r.error);else {if(action==='confirm'&&r.data?.activation_required)setError('Card setup is awaiting confirmation from Bachs. Please retry shortly.');if(r.data?.checkout_url)setUrl(r.data.checkout_url);await q.refetch();}}finally{setBusy(false);}
 }
 if(!user?.app_id||q.isLoading)return <p role="status">Checking estate activation…</p>;
 if(q.error)return <div role="alert" className="p-6 border rounded-xl">Unable to check estate activation. <Button onClick={()=>q.refetch()}>Retry</Button></div>;
 const s=q.data;
 if(!s)return null;
 if(!s.activation_required&&!s.managed)return <>{children}</>;
 const plan=prices.data?.find(p=>p.tier===tier);
 const checkout=url||s.checkout_url;
 return <>{(s.activation_required||pathname==='/dashboard/subscription')&&<section className="w-full max-w-3xl mx-auto rounded-xl border border-border bg-card p-7 space-y-5 mb-7">
 <p className="text-xs tracking-widest text-muted-foreground">ESTATE ACTIVATION & AUTOMATIC RENEWAL</p>
 <h1 className="text-2xl font-medium">{s.activation_required?'Verify your card to activate your estate':s.status==='trialing'?'Your free trial is active':'Your automatic subscription'}</h1>
 {s.activation_required?<><p className="text-sm text-muted-foreground leading-7">Start your {s.trial_days}-day free trial by adding a credit or debit card through Bachs. No subscription charge today. Your estate access starts after card setup is confirmed.</p>
 {!s.checkout_url&&<><label className="block text-sm">Monthly plan<select className="block w-full border rounded-md p-3 mt-2 bg-background" value={tier} onChange={e=>{setTier(e.target.value);setConsent(false);}}>{prices.data?.map(p=><option key={p.tier} value={p.tier}>{p.name} · ${p.price_monthly.toFixed(2)} USD/month</option>)}</select></label>
 {prices.error&&<p role="alert">Unable to load plans. <Button onClick={()=>prices.refetch()}>Retry</Button></p>}
 <label className="flex gap-3 text-sm leading-6"><input className="mt-1" type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I authorize automatic charges of ${plan?.price_monthly.toFixed(2)??'—'} USD each month starting {s.trial_days} days after card setup. I can cancel before the trial ends to avoid the first charge, or cancel future renewals from this dashboard.</span></label></>}
 {s.checkout_url&&<p className="text-sm">Saved activation: {s.tier} · ${s.price_monthly.toFixed(2)} USD/month after {s.trial_days} free days.</p>}
 <Button disabled={(!s.checkout_url&&(!consent||!plan))||busy} onClick={()=>act('start')}>{busy?'Preparing…':s.checkout_url?'Resume card setup':'Set up card & start free trial'}</Button>
 {checkout&&<div className="space-y-3"><Button asChild><a href={checkout} target="_blank" rel="noopener noreferrer">Open secure card setup</a></Button><p className="text-sm text-muted-foreground">Complete card setup in Bachs, then confirm here. Card details are stored by the payment provider.</p><Button variant="outline" disabled={busy} onClick={()=>act('confirm')}>Confirm card setup</Button></div>}</>:<><p className="text-sm">Status: <strong>{s.status}</strong> · ${s.price_monthly.toFixed(2)} USD/month</p><p className="text-sm text-muted-foreground">{s.cancel_at_period_end?'Renewal canceled. Access ends':s.status==='trialing'?'First automatic charge':'Current period ends'}: {s.period_end?new Date(s.period_end+'Z').toLocaleString():'Awaiting confirmation'}</p>{s.cancel_at_period_end?<p role="status">No further automatic payments are scheduled.</p>:s.status!=='canceled'&&<Button disabled={busy} variant="outline" onClick={()=>act('cancel')}>Cancel automatic renewal</Button>}<Button disabled={busy} variant="outline" onClick={()=>act('confirm')}>Refresh subscription status</Button></>}
 {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 </section>}{!s.activation_required&&<>{pathname==='/dashboard/subscription'?<Link href="/dashboard">Back to estate dashboard</Link>:children}</>}</>;
}
