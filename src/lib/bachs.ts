'use client';

// Bachs overlay checkout: the card form runs in a Bachs iframe, so card details never reach Residence.
// https://docs.bachs.io/guides/checkout/overlay-checkout
export type BachsEvent = {type:string;data?:{reason?:string;message?:string}&Record<string,unknown>};
type BachsGlobal = {
 Initialize:(options:{baseUrl?:string;onEvent?:(event:BachsEvent)=>void})=>BachsGlobal;
 Checkout:{open:(args:{checkoutUrl:string;onEvent?:(event:BachsEvent)=>void;options?:{showCloseButton?:boolean;autoCloseOnComplete?:boolean}})=>Promise<unknown>;close:()=>void;isOpen:()=>boolean};
};
declare global { interface Window { Bachs?: BachsGlobal } }

const SDK_URL='https://checkout.bachs.io/bachs.js';
// Live and sandbox checkout origins; the backend only accepts sessions on these hosts too.
const CHECKOUT_ORIGINS=['https://checkout.bachs.io','https://sandbox-checkout.bachs.io'];
let loading:Promise<BachsGlobal>|null=null;

function loadBachs():Promise<BachsGlobal>{
 if(window.Bachs)return Promise.resolve(window.Bachs);
 loading??=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=SDK_URL;script.async=true;
  script.onload=()=>window.Bachs?resolve(window.Bachs):reject(new Error('Card form unavailable.'));
  script.onerror=()=>{loading=null;script.remove();reject(new Error('Card form unavailable.'));};
  document.head.appendChild(script);
 });
 return loading;
}

/** Opens the card form over the page. Rejects when the SDK can't load or refuses the URL, so callers can fall back to the hosted page. */
export async function openCheckout(checkoutUrl:string,onEvent:(event:BachsEvent)=>void):Promise<void>{
 const origin=new URL(checkoutUrl).origin;
 if(!CHECKOUT_ORIGINS.includes(origin))throw new Error('Unexpected checkout address.');
 // The SDK only accepts checkout URLs on its configured origin, which defaults to live.
 const bachs=(await loadBachs()).Initialize({baseUrl:origin});
 await bachs.Checkout.open({checkoutUrl,onEvent});
}

export function closeCheckout():void{ window.Bachs?.Checkout.close(); }
