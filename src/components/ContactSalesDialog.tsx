'use client';
import {useState} from 'react';
import {CheckCircle2,Mail} from 'lucide-react';
import {contactSales} from '@/actions/community';
import {useUser} from '@/contexts/UserContext';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';

/** Enterprise (offline deployment) lead form; submissions appear in the owner console under Sales leads. */
export default function ContactSalesDialog(){
 const {user}=useUser();
 const [open,setOpen]=useState(false); const [busy,setBusy]=useState(false);
 const [error,setError]=useState(''); const [sent,setSent]=useState(false);

 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault(); const f=new FormData(e.currentTarget); const homes=Number(f.get('homes'));
  setBusy(true);setError('');
  try{
   const r=await contactSales({contact_name:String(f.get('name')),contact_email:String(f.get('email')),
    phone:String(f.get('phone')||'')||undefined,homes:homes>0?homes:undefined,message:String(f.get('message'))});
   if(r.error)setError(r.error);else setSent(true);
  }finally{setBusy(false);}
 }

 return <Dialog open={open} onOpenChange={o=>{setOpen(o);if(!o){setError('');setSent(false);}}}>
  <DialogTrigger asChild><Button type="button" variant="outline" className="shrink-0"><Mail className="h-4 w-4 mr-2"/>Contact sales team</Button></DialogTrigger>
  <DialogContent className="sm:max-w-lg">
   {sent?<div className="py-6 text-center space-y-3" role="status"><CheckCircle2 className="h-10 w-10 mx-auto text-primary"/><DialogTitle>Request sent</DialogTitle><DialogDescription>Our sales team will contact you within one business day to plan your offline deployment.</DialogDescription><Button onClick={()=>setOpen(false)}>Done</Button></div>
   :<><DialogHeader><DialogTitle>Talk to sales about Enterprise</DialogTitle><DialogDescription>Tell us about your estate and we’ll plan an offline, on-site deployment with you.</DialogDescription></DialogHeader>
    <form onSubmit={submit} className="space-y-4">
     <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5"><Label htmlFor="cs-name">Your name</Label><Input id="cs-name" name="name" required minLength={2} maxLength={255} defaultValue={user?.full_name??''}/></div>
      <div className="space-y-1.5"><Label htmlFor="cs-email">Work email</Label><Input id="cs-email" name="email" type="email" required maxLength={255} defaultValue={user?.email??''}/></div>
      <div className="space-y-1.5"><Label htmlFor="cs-phone">Phone (optional)</Label><Input id="cs-phone" name="phone" type="tel" maxLength={40} pattern="[0-9+()\-\s]*"/></div>
      <div className="space-y-1.5"><Label htmlFor="cs-homes">Homes in the estate (optional)</Label><Input id="cs-homes" name="homes" type="number" min={1} max={100000}/></div>
     </div>
     <div className="space-y-1.5"><Label htmlFor="cs-message">What do you need?</Label><Textarea id="cs-message" name="message" required minLength={10} maxLength={2000} rows={4} placeholder="Number of gates, internet reliability on site, timeline…"/></div>
     {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
     <Button type="submit" className="w-full" disabled={busy}>{busy?'Sending…':'Send to sales team'}</Button>
    </form></>}
  </DialogContent>
 </Dialog>;
}
