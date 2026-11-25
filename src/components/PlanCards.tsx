'use client';
import {Check} from 'lucide-react';
import type {OwnerPlan} from '@/actions/owner';
import ContactSalesDialog from '@/components/ContactSalesDialog';

type Props={plans:OwnerPlan[];value:string;onChange:(tier:string)=>void;label:string;name:string};

// Enterprise is the offline/edge deployment, sold through sales rather than self-serve checkout.
const SALES_TIER='enterprise';

function features(p:OwnerPlan):string[]{
 return [p.monthly_verifications_limit===null?'Unlimited gate checks':`${p.monthly_verifications_limit.toLocaleString()} gate checks a month`,
  p.rfid_enabled?'RFID gate access':'Passcode gate access',
  `${p.log_retention_days}-day access history`,
  ...(p.realtime_alerts_enabled?['Real-time alerts']:[])];
}

function FeatureList({items}:{items:string[]}){
 return <ul className="mt-4 space-y-1.5 text-xs">{items.map(f=><li key={f} className="flex gap-2"><Check aria-hidden className="mt-0.5 h-3 w-3 shrink-0 text-primary"/>{f}</li>)}</ul>;
}

function SalesCard({plan}:{plan:OwnerPlan}){
 return <div className="rounded-lg border border-dashed border-border bg-muted/40 p-5 sm:col-span-2 lg:col-span-3 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
  <div>
   <span className="block text-sm font-medium">{plan.name} · Offline edge deployment</span>
   <span className="mt-2 block text-xs leading-5 text-muted-foreground max-w-xl">For estates that need gate access running on-site, including when the internet is down. Our team plans the hardware and setup with you. From ${plan.price_monthly.toFixed(2)} USD/month.</span>
   <FeatureList items={['On-premise / offline deployment',...features(plan)]}/>
  </div>
  <ContactSalesDialog/>
 </div>;
}

/** Selectable plan cards backed by a native radio group, so keyboard and screen readers work as a list of options. */
export default function PlanCards({plans,value,onChange,label,name}:Props){
 // An estate already on Enterprise keeps it selectable (renewal); everyone else is routed to sales.
 const sales=value===SALES_TIER?undefined:plans.find(p=>p.tier===SALES_TIER);
 const selectable=plans.filter(p=>p!==sales);
 return <fieldset><legend className="text-sm font-medium mb-3">{label}</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{selectable.map(p=>{const selected=p.tier===value;return <label key={p.tier} className={`relative cursor-pointer rounded-lg border p-5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 ${selected?'border-primary bg-primary/5 shadow-sm':'border-border bg-background hover:border-primary/50'}`}>
  <input type="radio" className="sr-only" name={name} value={p.tier} checked={selected} onChange={()=>onChange(p.tier)}/>
  <span aria-hidden className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${selected?'border-primary bg-primary text-primary-foreground':'border-border'}`}>{selected&&<Check className="h-3 w-3"/>}</span>
  <span className="block text-sm font-medium">{p.name}</span>
  <span className="mt-3 block"><span className="text-2xl font-semibold">${p.price_monthly.toFixed(2)}</span><span className="text-xs text-muted-foreground"> USD/month</span></span>
  {p.description&&<span className="mt-2 block text-xs leading-5 text-muted-foreground">{p.description}</span>}
  <FeatureList items={features(p)}/>
 </label>;})}{sales&&<SalesCard plan={sales}/>}</div></fieldset>;
}
