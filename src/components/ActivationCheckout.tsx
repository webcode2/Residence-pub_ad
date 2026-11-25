'use client';
import {useEffect,useRef,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Lock,ShieldCheck} from 'lucide-react';
import {cardActivationAction,type CardActivationStatus} from '@/actions/card-activation';
import {getRenewalPlans} from '@/actions/subscription-checkout';
import {Button} from '@/components/ui/button';
import PlanCards from '@/components/PlanCards';
import {openCheckout,closeCheckout,type BachsEvent} from '@/lib/bachs';

type Props={status:CardActivationStatus;onActivated:()=>Promise<unknown>};
type Phase='idle'|'open'|'verifying'|'pending'|'unfinished'|'redirecting';
const VERIFY_ATTEMPTS=6, VERIFY_DELAY_MS=2500, FORM_LOAD_TIMEOUT_MS=20000;
const money=(n:number)=>`$${n.toFixed(2)}`;
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));

/** Card-first trial signup: plan choice, order summary, and the Bachs card form opened over this page. */
export default function ActivationCheckout({status:s,onActivated}:Props){
 const plans=useQuery({queryKey:['activation-prices'],queryFn:async()=>{const r=await getRenewalPlans();if(!r.data)throw new Error(r.error);return r.data;}});
 const [tier,setTier]=useState('starter'); const [consent,setConsent]=useState(false);
 const [phase,setPhase]=useState<Phase>('idle'); const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const completed=useRef(false); const watchdog=useRef<number>(undefined);
 useEffect(()=>()=>window.clearTimeout(watchdog.current),[]);
 const saved=!!s.checkout_url;
 const plan=plans.data?.find(p=>p.tier===(saved?s.tier:tier));
 const price=saved?s.price_monthly:plan?.price_monthly;
 const firstCharge=new Date(Date.now()+s.trial_days*864e5).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});

 async function verify(){
  setPhase('verifying');setError('');
  for(let i=0;i<VERIFY_ATTEMPTS;i++){
   const r=await cardActivationAction('confirm');
   if(r.data&&!r.data.activation_required){await onActivated();return;}
   await wait(VERIFY_DELAY_MS);
  }
  setPhase('pending');
 }

 // Returning from the hosted Bachs page (fallback when the overlay can't load): confirm without another click.
 useEffect(()=>{
  if(saved&&new URLSearchParams(window.location.search).get('activation')==='complete')void verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on arrival
 },[]);

 // If the overlay can't run here, finish on the hosted Bachs page; it returns to ?activation=complete.
 function goToHostedPage(url:string){
  window.clearTimeout(watchdog.current);closeCheckout();setPhase('redirecting');window.location.assign(url);
 }

 function onEvent(url:string){
  return (event:BachsEvent)=>{
   if(event.type==='checkout.ready')window.clearTimeout(watchdog.current);
   else if(event.type==='checkout.completed'){completed.current=true;void verify();}
   else if(event.type==='checkout.failed')setError('Your card could not be verified. Please try again or use a different card.');
   else if(event.type==='checkout.expired'){closeCheckout();setError('The card form expired. Select the button again for a fresh one.');setPhase('unfinished');}
   else if(event.type==='checkout.error')goToHostedPage(url);
   else if(event.type==='checkout.closed'&&!completed.current){window.clearTimeout(watchdog.current);setPhase('unfinished');}
  };
 }

 async function addCard(){
  setBusy(true);setError('');completed.current=false;
  try{
   // Always ask the backend: it reuses a live session or replaces an expired one at the agreed price.
   const r=saved?await cardActivationAction('start',s.tier,true,s.price_monthly):await cardActivationAction('start',tier,consent,plan?.price_monthly);
   if(r.error){setError(r.error);return;}
   const url=r.data?.checkout_url;
   if(!url){setError('Card setup could not be started. Please retry.');return;}
   try{
    await openCheckout(url,onEvent(url));setPhase('open');
    watchdog.current=window.setTimeout(()=>goToHostedPage(url),FORM_LOAD_TIMEOUT_MS);
   }catch{goToHostedPage(url);}
   await onActivated();
  }finally{setBusy(false);}
 }

 const canStart=saved||(consent&&!!plan);
 const working=busy||phase==='open'||phase==='verifying'||phase==='redirecting';
 return <section className="w-full max-w-6xl mx-auto mb-7">
  <p className="text-xs tracking-widest text-muted-foreground">ESTATE ACTIVATION</p>
  <h1 className="text-3xl font-medium mt-3">Start your {s.trial_days}-day free trial</h1>
  <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-6">Add a card to activate your estate. Nothing is charged today, and you can cancel any time before the trial ends.</p>
  <div className="grid gap-6 mt-8 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
   <div className="rounded-xl border border-border bg-card p-6 space-y-6">
    {plans.isLoading&&<p role="status" className="text-sm">Loading plans…</p>}
    {plans.error&&<div role="alert" className="text-sm space-y-3"><p>Unable to load plans.</p><Button variant="outline" onClick={()=>plans.refetch()}>Retry</Button></div>}
    {plans.data&&(saved
     ?<>{plan&&<PlanCards plans={[plan]} value={plan.tier} name="activation-plan" label="Your plan" onChange={()=>{}}/>}<p className="text-xs text-muted-foreground leading-5">This plan and price are reserved under the terms you agreed to. Finish adding your card to activate it.</p></>
     :<><PlanCards plans={plans.data} value={tier} name="activation-plan" label="Choose a monthly plan" onChange={t=>{setTier(t);setConsent(false);}}/>
      <label className="flex gap-3 text-sm leading-6 border-t border-border pt-5"><input className="mt-1" type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I authorize Residence to charge {price!==undefined?money(price):'—'} USD each month, starting {s.trial_days} days after my card is added. I can cancel before the trial ends to avoid the first charge, or cancel future renewals from this dashboard.</span></label></>)}
   </div>
   <aside className="rounded-xl border border-border bg-card p-6 xl:sticky xl:top-6 space-y-5">
    <h2 className="text-sm font-medium">Order summary</h2>
    <dl className="text-sm space-y-3">
     <div className="flex justify-between"><dt className="text-muted-foreground">Plan</dt><dd>{plan?.name??s.tier}</dd></div>
     <div className="flex justify-between"><dt className="text-muted-foreground">Monthly price</dt><dd>{price!==undefined?money(price):'—'}</dd></div>
     <div className="flex justify-between"><dt className="text-muted-foreground">Free trial</dt><dd>{s.trial_days} days</dd></div>
     <div className="flex justify-between items-baseline border-t border-border pt-4"><dt className="font-medium">Due today</dt><dd className="text-2xl font-semibold">$0.00</dd></div>
    </dl>
    <p className="text-xs text-muted-foreground leading-5">Then {price!==undefined?money(price):'—'} USD/month from {firstCharge}.</p>
    <Button className="w-full h-11" disabled={!canStart||working} onClick={addCard}><Lock className="h-4 w-4 mr-2"/>{busy?'Preparing secure form…':phase==='verifying'?'Confirming your card…':phase==='open'?'Card form open…':saved||phase==='unfinished'?'Continue adding card':'Add card & start free trial'}</Button>
    {!saved&&!consent&&plans.data&&<p className="text-xs text-muted-foreground">Accept the billing terms to continue.</p>}
    {phase==='unfinished'&&!error&&<p role="status" className="text-sm">Card setup isn’t finished yet. Your plan is saved, so you can continue where you left off.</p>}
    {phase==='pending'&&<div role="status" className="text-sm space-y-3"><p>Your card was added. Bachs is still confirming it, which usually takes under a minute.</p><Button variant="outline" className="w-full" onClick={verify}>Check again</Button></div>}
    {phase==='redirecting'&&<p role="status" className="text-sm">Opening the secure Bachs card page…</p>}
    {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    <p className="flex gap-2 text-xs text-muted-foreground leading-5 border-t border-border pt-4"><ShieldCheck className="h-4 w-4 shrink-0 text-primary"/>You enter your card in Bachs’ encrypted payment form. Residence never sees or stores your card number.</p>
   </aside>
  </div>
 </section>;
}
