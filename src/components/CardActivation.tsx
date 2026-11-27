'use client';
import {useState} from 'react';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {getCardActivation,cardActivationAction} from '@/actions/card-activation';
import {Button} from '@/components/ui/button';
import {useUser} from '@/contexts/UserContext';
import ActivationCheckout from '@/components/ActivationCheckout';

function useEstateActivation() {
 const {user}=useUser();
 return useQuery({queryKey:['card-activation',user?.app_id],queryFn:getCardActivation,enabled:!!user?.app_id,retry:1,refetchOnWindowFocus:false});
}

export default function CardActivation({children}:{children:React.ReactNode}) {
 const {user}=useUser();
 const q=useEstateActivation();
 if(!user?.app_id||q.isLoading)return <p role="status">Checking estate activation…</p>;
 if(q.error)return <div role="alert" className="p-6 border rounded-xl">Unable to check estate activation. <Button onClick={()=>q.refetch()}>Retry</Button></div>;
 const s=q.data;
 if(!s)return null;
 if(s.activation_required)return <ActivationCheckout status={s} onActivated={()=>q.refetch()}/>;
 return <>{children}</>;
}

export function AutomaticRenewal({children}:{children:React.ReactNode}) {
 const q=useEstateActivation();
 const cache=useQueryClient();
 const [busy,setBusy]=useState(false); const [error,setError]=useState('');
 async function act(action:'confirm'|'cancel') {
  setBusy(true);setError('');try{const r=await cardActivationAction(action);if(r.error)setError(r.error);else await Promise.all([q.refetch(), cache.invalidateQueries({queryKey:['estate-subscription']})]);}finally{setBusy(false);}
 }
 const s=q.data;
 if(!s?.managed)return <>{children}</>;
 return <section className="rounded-xl border border-border bg-card p-6 space-y-4">
 <p className="text-xs tracking-widest text-muted-foreground">ESTATE ACTIVATION & AUTOMATIC RENEWAL</p>
 <h3 className="text-lg font-medium">{s.status==='trialing'?'Your free trial is active':'Your automatic subscription'}</h3>
 <p className="text-sm">Status: <strong>{s.status}</strong> · ${s.price_monthly.toFixed(2)} USD/month</p><p className="text-sm text-muted-foreground">{s.cancel_at_period_end?'Renewal canceled. Access ends':s.status==='trialing'?'First automatic charge':'Current period ends'}: {s.period_end?new Date(s.period_end+'Z').toLocaleString():'Awaiting confirmation'}</p>{s.cancel_at_period_end?<p role="status">No further automatic payments are scheduled.</p>:s.status!=='canceled'&&<Button disabled={busy} variant="outline" onClick={()=>act('cancel')}>Cancel automatic renewal</Button>}<Button disabled={busy} variant="outline" onClick={()=>act('confirm')}>Refresh subscription status</Button>
 {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 </section>;
}
