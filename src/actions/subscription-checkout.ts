"use server";
import {appOrigin} from '@/lib/app-url';
import api from '@/lib/api';
import {caretakerHeaders} from '@/lib/caretaker';
import {OwnerPlan} from '@/actions/owner';
export async function getRenewalPlans(){
 try{return {data:(await api.get<OwnerPlan[]>('subscriptions/tiers',{headers:await caretakerHeaders(),timeout:15000})).data};}
 catch{return {error:'Unable to load renewal prices. Please retry.'};}
}
export async function startEstateCheckout(tier:string,billingMonths:number){
 if(!['starter','standard','premium','enterprise'].includes(tier)||![1,6,12].includes(billingMonths))return {error:'Select a plan and payment period.'};
 try{
  const origin=await appOrigin();
  if(!origin)return {error:'Please reload this page before starting checkout.'};
  const response=await api.post('subscriptions/checkout',{tier,billing_months:billingMonths,success_url:new URL('/dashboard/settings?checkout=success#subscription',origin).href,cancel_url:new URL('/dashboard/settings?checkout=cancelled#subscription',origin).href},{headers:await caretakerHeaders(),timeout:20000});
  if(response.data.is_simulated)return {error:'Online payments are not configured. Contact the platform owner to arrange renewal.'};
  return {data:response.data as {session_id:string;checkout_url:string;is_sandbox:boolean;returns_to_app:boolean}};
 }catch(error){
  const failure=error as {code?:string;response?:{status?:number;data?:{detail?:unknown}}};
  if(failure.response?.status===401)return {error:'Your session has expired. Please sign in again to renew.'};
  if(failure.response?.status===403)return {error:'Estate caretaker access is required to renew this subscription.'};
  if(failure.code==='ECONNABORTED')return {error:'The payment service took too long to respond. Please try again.'};
  const detail=failure.response?.data?.detail;
  return {error:typeof detail==='string'?detail:'Unable to reach the checkout service. Please retry shortly.'};
 }

}
export async function confirmEstateCheckout(sessionId:string){
 if(!/^[A-Za-z0-9_-]{1,255}$/.test(sessionId))return {error:'Invalid payment reference.'};
 try{const response=await api.get(`subscriptions/checkout/${sessionId}/verify`,{headers:await caretakerHeaders(),timeout:20000});return {data:response.data as {is_active:boolean;message:string}};}
 catch{return {error:'Payment could not be confirmed yet. Please retry or contact support.'};}
}
