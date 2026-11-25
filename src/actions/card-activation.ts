'use server';
import api from '@/lib/api';
import { caretakerHeaders } from '@/lib/caretaker';
import { appOrigin } from '@/lib/app-url';
export interface CardActivationStatus {
 tier:string; activation_required:boolean; managed:boolean; trial_days:number; status:string;
 period_end:string|null; cancel_at_period_end:boolean; price_monthly:number; checkout_url:string|null;
}
export async function getCardActivation():Promise<CardActivationStatus> {
 const {data}=await api.get('subscriptions/activation',{headers:await caretakerHeaders()}); return data;
}
export async function cardActivationAction(action:'start'|'confirm'|'cancel',tier?:string,consent?:boolean,expectedPrice?:number) {
 try {
  const origin=action==='start'?await appOrigin():null;
  if(action==='start'&&!consent)return {error:'Accept the automatic billing terms to continue.'};
  if(action==='start'&&!origin)return {error:'Please reload this page before starting card setup.'};
  const body=action==='start'?{tier,consent,expected_price_monthly:expectedPrice,success_url:new URL('/dashboard/subscription?activation=complete',origin!).href,cancel_url:new URL('/dashboard/subscription?activation=cancelled',origin!).href}:{};
  const {data}=await api.post('subscriptions/activation'+(action==='start'?'':'/'+action),body,{headers:await caretakerHeaders(),timeout:55000});return {data};
 }catch(error:any){return {error:typeof error.response?.data?.detail==='string'?error.response.data.detail:'Card activation could not be completed. Please retry.'};}
}
