'use client';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {getCardActivation,cardActivationAction} from '@/actions/card-activation';
import {Button} from '@/components/ui/button';
import {useUser} from '@/contexts/UserContext';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import ActivationCheckout from '@/components/ActivationCheckout';

export default function CardActivation({children}:{children:React.ReactNode}) {
 const {user}=useUser(); const pathname=usePathname();
 const q=useQuery({queryKey:['card-activation',user?.app_id],queryFn:getCardActivation,enabled:!!user?.app_id,retry:1,refetchOnWindowFocus:false});
 const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 async function act(action:'confirm'|'cancel') {
  setBusy(true);setError('');try{const r=await cardActivationAction(action);if(r.error)setError(r.error);else await q.refetch();}finally{setBusy(false);}
 }
 if(!user?.app_id||q.isLoading)return <p role="status">Checking estate activation…</p>;
 if(q.error)return <div role="alert" className="p-6 border rounded-xl">Unable to check estate activation. <Button onClick={()=>q.refetch()}>Retry</Button></div>;
 const s=q.data;
 if(!s)return null;
 if(s.activation_required)return <ActivationCheckout status={s} onActivated={()=>q.refetch()}/>;
 if(!s.managed)return <>{children}</>;
 return <>{pathname==='/dashboard/subscription'&&<section className="w-full max-w-3xl mx-auto rounded-xl border border-border bg-card p-7 space-y-5 mb-7">
 <p className="text-xs tracking-widest text-muted-foreground">ESTATE ACTIVATION & AUTOMATIC RENEWAL</p>
 <h1 className="text-2xl font-medium">{s.status==='trialing'?'Your free trial is active':'Your automatic subscription'}</h1>
 <p className="text-sm">Status: <strong>{s.status}</strong> · ${s.price_monthly.toFixed(2)} USD/month</p><p className="text-sm text-muted-foreground">{s.cancel_at_period_end?'Renewal canceled. Access ends':s.status==='trialing'?'First automatic charge':'Current period ends'}: {s.period_end?new Date(s.period_end+'Z').toLocaleString():'Awaiting confirmation'}</p>{s.cancel_at_period_end?<p role="status">No further automatic payments are scheduled.</p>:s.status!=='canceled'&&<Button disabled={busy} variant="outline" onClick={()=>act('cancel')}>Cancel automatic renewal</Button>}<Button disabled={busy} variant="outline" onClick={()=>act('confirm')}>Refresh subscription status</Button>
 {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 </section>}{pathname==='/dashboard/subscription'?<Link href="/dashboard">Back to estate dashboard</Link>:children}</>;
}
