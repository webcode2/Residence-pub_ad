"use server";

import { z } from 'zod';
import api from '@/lib/api';
import { getOwnerSession, setOwnerSession, clearOwnerSession } from '@/lib/owner-session';
import { redirect } from 'next/navigation';

export interface OwnerSubscription { estate_id: string; estate_name?: string; app_id?: string; tier: string; status: string; expiry_date: string; monthly_verifications_limit: number | null; current_month_verifications: number; rfid_enabled: boolean; realtime_alerts_enabled: boolean; log_retention_days: number; price_monthly: number; }
export interface OwnerEstate { id: string; name: string; app_id: string; is_active: boolean; user_count: number; active_visitors_count: number; total_verifications: number; subscription: OwnerSubscription | null; }
export interface OwnerOverview { total_estates: number; active_estates: number; suspended_estates: number; total_users: number; estimated_mrr: number; total_verifications_this_month: number; total_active_visitors: number; subscriptions_by_tier: Record<string, number>; users_by_role: Record<string, number>; }
export interface OwnerUser { id: string; full_name: string | null; email: string; app_id: string; estate_name: string; roles: string[]; is_revoked: boolean; }
export interface OwnerAudit { id: string; actor_email: string; action: string; target_type: string; target_id: string; changes: Record<string, { before: unknown; after: unknown }>; created_at: string; }
export interface OwnerAccessLog { id: string; created_at: string; app_id: string; event_type: string; identifier: string; status: 'authorized' | 'denied'; denial_reason: string | null; visitor_name: string | null; details: string | null; }
export interface PlanQuote { billing_months: number; discount_percent: number; subtotal: number; amount: number; savings: number; currency: string; }
export interface OwnerPlan { discount_6_months:number; discount_12_months:number; version:number; quotes:PlanQuote[]; tier: string; name: string; description: string; price_monthly: number; monthly_verifications_limit: number | null; rfid_enabled: boolean; log_retention_days: number; realtime_alerts_enabled: boolean; }
interface Result<T> { data?: T; error?: string; }
const idSchema = z.string().uuid();
async function request<T>(path: string, body?: unknown, method: 'get' | 'post' | 'patch' = 'get'): Promise<Result<T>> {
    const session = await getOwnerSession();
    if (!session) return { error: 'Platform owner sign-in required.' };
    try {
        const response = await api.request<T>({ url: `admin/${path}`, method, data: body, timeout: 15000,
            headers: { Authorization: `Bearer ${session.token}` } });
        return { data: response.data };
    } catch (e) {
        const error = e as { response?: { status?: number; data?: { detail?: string } } };
        if (error.response?.status === 401) { await clearOwnerSession(); return { error: 'Your owner session has expired. Please sign in again.' }; }
        return { error: typeof error.response?.data?.detail === 'string' ? error.response.data.detail : 'Unable to complete the platform request. Please try again.' };
    }
}
export async function ownerLogin(values: { email: string; password: string }) {
    const valid = z.object({ email: z.string().email(), password: z.string().min(8).max(128) }).safeParse(values);
    if (!valid.success) return { error: 'Enter your owner email and password.' };
    try {
        const response = await api.post('admin/auth/login', valid.data, { timeout: 15000 });
        if (!response.data.user?.roles?.includes('saas_owner')) return { error: 'Platform owner access required.' };
        await setOwnerSession(response.data.user, response.data.token.access_token);
        return { success: true };
    } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 401) return { error: 'The owner email or password is incorrect for this environment. Demo accounts require the isolated demo login.' };
        if (status === 403) return { error: 'This account does not have platform owner access.' };
        if (status === 429) return { error: 'Too many sign-in attempts. Please wait before trying again.' };
        return { error: 'Unable to reach the owner sign-in service. Please try again shortly.' };
    }
}
export async function ownerLogout() {
    await request('auth/logout', {}, 'post');
    await clearOwnerSession();
    redirect('/owner/login');
}
export async function getOwnerOverview() { return request<OwnerOverview>('overview'); }
export async function getOwnerEstates(filters: { search?: string; tier?: string; active?: string }) {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search.slice(0, 200));
    if (filters.tier) params.set('tier', filters.tier);
    if (filters.active === 'true' || filters.active === 'false') params.set('is_active', filters.active);
    return request<OwnerEstate[]>(`estates/?${params}`);
}
export async function setEstateStatus(id: string, active: boolean) {
    if (!idSchema.safeParse(id).success || typeof active !== 'boolean') return { error: 'Invalid estate update.' };
    return request<{ is_active: boolean }>(`estates/${id}/status`, { is_active: active }, 'patch');
}
export async function getOwnerSubscriptions(filters: { status?: string; tier?: string }) {
    const params = new URLSearchParams(); if (filters.status) params.set('status', filters.status); if (filters.tier) params.set('tier', filters.tier);
    return request<OwnerSubscription[]>(`subscriptions/?${params}`);
}
export async function updateOwnerSubscription(id: string, values: unknown) {
    const valid = z.object({ tier: z.enum(['starter', 'standard', 'premium', 'enterprise']), status: z.enum(['active', 'expired', 'cancelled']),
        expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), monthly_verifications_limit: z.number().int().min(0).nullable(),
        rfid_enabled: z.boolean(), realtime_alerts_enabled: z.boolean(), log_retention_days: z.number().int().min(1).max(3650) }).safeParse(values);
    if (!idSchema.safeParse(id).success || !valid.success) return { error: 'Check the subscription dates, limits, and options.' };
    return request<OwnerSubscription>(`subscriptions/${id}`, valid.data, 'patch');
}
export async function getOwnerUsers(filters: { search?: string; role?: string }) {
    const params = new URLSearchParams({ limit: '200' }); if (filters.search) params.set('query', filters.search.slice(0, 200)); if (filters.role) params.set('role', filters.role);
    return request<OwnerUser[]>(`users/?${params}`);
}
export async function setOwnerUserRevocation(id: string, revoked: boolean) {
    if (!idSchema.safeParse(id).success || typeof revoked !== 'boolean') return { error: 'Invalid account update.' };
    return request<{ is_revoked: boolean }>(`users/${id}/revoke`, { is_revoked: revoked }, 'patch');
}
export async function getOwnerAudit(offset = 0) { return request<OwnerAudit[]>(`audit/?limit=50&offset=${Math.max(0, offset)}`); }
export async function getOwnerPlans() { return request<OwnerPlan[]>('subscriptions/plans'); }

export async function updateOwnerPlan(plan: OwnerPlan) {
    const valid = z.object({tier:z.enum(['starter','standard','premium','enterprise']),name:z.string().trim().min(1).max(80),description:z.string().trim().min(1).max(1000),
        price_monthly:z.number().finite().positive().max(99999999),monthly_verifications_limit:z.number().int().min(0).max(2147483647).nullable(),
        log_retention_days:z.number().int().min(1).max(3650),rfid_enabled:z.boolean(),realtime_alerts_enabled:z.boolean(),
        discount_6_months:z.number().finite().min(0).max(99.99),discount_12_months:z.number().finite().min(0).max(99.99),version:z.number().int().min(0)}).safeParse(plan);
    if(!valid.success)return {error:'Check the plan price, limits, and discount percentages.'};
    const {tier,...body}=valid.data;
    return request<OwnerPlan>(`subscriptions/plans/${tier}`,body,'patch');
}

export async function getOwnerAccessLogs(filters: { status?: string; appId?: string; offset?: number }) {
    const params = new URLSearchParams({ limit: '50', offset: String(Math.max(0, filters.offset ?? 0)) });
    if (filters.status === 'authorized' || filters.status === 'denied') params.set('status', filters.status);
    const appId = filters.appId?.trim();
    if (appId) params.set('app_id', appId.slice(0, 50));
    return request<OwnerAccessLog[]>(`access-logs/?${params}`);
}

export type SalesInquiryStatus = 'new' | 'contacted' | 'closed';
export interface SalesInquiry { id: string; app_id: string; estate_name: string | null; tier: string; contact_name: string; contact_email: string; phone: string | null; homes: number | null; message: string; status: SalesInquiryStatus; owner_note: string | null; created_at: string; updated_at: string; }
export interface SalesInquiryPage { inquiries: SalesInquiry[]; has_more: boolean; counts: Record<SalesInquiryStatus, number>; }
const inquiryStatus = z.enum(['new', 'contacted', 'closed']);

export async function getSalesInquiries(filters: { status?: string; offset?: number }) {
    const params = new URLSearchParams({ limit: '25', offset: String(Math.max(0, filters.offset ?? 0)) });
    if (inquiryStatus.safeParse(filters.status).success) params.set('status', filters.status!);
    return request<SalesInquiryPage>(`sales-inquiries?${params}`);
}

export async function setSalesInquiryStatus(id: string, status: SalesInquiryStatus) {
    if (!idSchema.safeParse(id).success || !inquiryStatus.safeParse(status).success) return { error: 'Invalid inquiry update.' };
    return request<SalesInquiry>(`sales-inquiries/${id}`, { status }, 'patch');
}
