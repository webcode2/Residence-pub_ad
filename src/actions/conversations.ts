"use server";

import api from '@/lib/api';
import { caretakerHeaders } from '@/lib/caretaker';

export interface ConversationMessage {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'resident' | 'security' | 'system';
    officer_badge: string | null;
    officer_post: string | null;
    message: string;
    status_tag: string | null;
    created_at: string;
    is_read: boolean;
    read_at: string | null;
}

export interface Conversation {
    id: string;
    resident_name: string | null;
    unit_address: string | null;
    gate_site_name: string | null;
    subject: string | null;
    status: 'open' | 'resolved' | 'closed';
    has_active_emergency: boolean;
    last_message_at: string;
    last_message_text: string | null;
    created_at: string;
}
export interface ConversationDetail extends Conversation {
    messages: ConversationMessage[];
}
export interface ConversationPage {
    threads: Conversation[];
    has_more: boolean;
}


function failure(error: unknown): string {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401) return 'Your session has expired. Please sign in again.';
    if (status === 403) return 'Estate caretaker access required.';
    if (status === 404) return 'Conversation not found in your estate.';
    return 'Unable to load conversation logs. Please try again.';
}

export async function listConversations(options: { search?: string; status?: string; offset?: number }) {
    try {
        const response = await api.get<ConversationPage>('chat/audit/threads', {
            headers: await caretakerHeaders(), timeout: 15000,
            params: { search: options.search || undefined, status: options.status || undefined,
                offset: Math.max(0, options.offset ?? 0), limit: 50 },
        });
        return { data: response.data };
    } catch (error) { return { error: failure(error) }; }
}

export async function getConversation(id: string) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: 'Invalid conversation.' };
    try {
        const response = await api.get<ConversationDetail>(`chat/audit/threads/${id}`, {
            headers: await caretakerHeaders(), timeout: 15000,
        });
        return { data: response.data };
    } catch (error) { return { error: failure(error) }; }
}


export interface EstateOverview {
    residents: number; active_gates: number; open_conversations: number; emergencies: number;
    pending_password_resets?: number;
    returning_users?: number;
    archived_accounts?: number;
    retained_accounts?: number;
    gate_activity: { date: string; authorized: number; denied: number; generated: number }[];
    recent_activity: { id: string; title: string; details: string; status: string; created_at: string }[];
    conversations: Conversation[]; updated_at: string;
}

export async function getEstateOverview() {
    try {
        const response = await api.get<EstateOverview>('dashboard/overview', {
            headers: await caretakerHeaders(), timeout: 15000,
        });
        return { data: response.data };
    } catch (error) { return { error: failure(error) }; }
}

export interface AccessLogPage {
    tier: string; log_retention_days: number; earliest_accessible_date: string;
    total_returned: number; next_cursor: string|null; has_more: boolean;
    logs: { id: string; created_at: string; event_type: string; identifier: string;
        status: string; visitor_name: string | null; denial_reason: string | null; details: string | null }[];
}

export async function getEstateAccessLogs(options: { offset?: number; status?: string; cursor?:string; start_at?:string; end_at?:string }) {
    try {
        const response = await api.get<AccessLogPage>('access-logs/', {
            headers: await caretakerHeaders(), timeout: 15000,
            params: { limit: 50, offset: Math.max(0, options.offset ?? 0), status: options.status || undefined, cursor:options.cursor||undefined, start_at:options.start_at,end_at:options.end_at },
        });
        return { data: response.data };
    } catch (error) { return { error: failure(error) }; }
}

export interface EstateSettings {
    name: string; app_id: string; is_active: boolean; token_code_length: number;
    tier: string; monthly_verifications_limit: number | null; current_month_verifications: number; rfid_enabled: boolean;
}
export async function getEstateSettings() {
    try {
        const response = await api.get<EstateSettings>('estates/settings', { headers: await caretakerHeaders(), timeout: 15000 });
        return { data: response.data };
    } catch (error) { return { error: failure(error) }; }
}
export async function saveTokenLength(length: number) {
    if (![4, 5, 6].includes(length)) return { error: 'Choose a supported code length.' };
    try {
        const response = await api.patch<EstateSettings>('estates/settings', { token_code_length: length }, { headers: await caretakerHeaders(), timeout: 15000 });
        return { data: response.data };
    } catch (error) { return { error: failure(error) }; }
}
export interface GateSite { id: string; name: string; code: string | null; description: string | null; is_active: boolean; }
export async function getGateSites() {
    try {
        const response = await api.get<GateSite[]>('chat/gates?include_inactive=true', { headers: await caretakerHeaders(), timeout: 15000 });
        return { data: response.data };
    } catch (error) { return { error: failure(error) }; }
}
export async function createGateSite(data: { name: string; code: string; description: string }) {
    if (!data.name.trim() || data.name.trim().length > 100 || data.code.length > 50 || data.description.length > 255) return { error: 'Check the gate name, code, and description.' };
    try {
        const response = await api.post<GateSite>('chat/gates', { name: data.name.trim(), code: data.code.trim() || null, description: data.description.trim() || null }, { headers: await caretakerHeaders(), timeout: 15000 });
        return { data: response.data };
    } catch (error) { return { error: failure(error) }; }
}

export interface CurrentEstateSubscription {
    id: string; estate_id: string; tier: string; status: string; expiry_date: string;
    monthly_verifications_limit: number | null; current_month_verifications: number;
    verifications_remaining: number | null; billing_cycle_start: string;
    rfid_enabled: boolean; log_retention_days: number; realtime_alerts_enabled: boolean; price_monthly: number;
}
export async function getCurrentEstateSubscription() {
    try {
        const response = await api.get<CurrentEstateSubscription>('subscriptions/current', { headers: await caretakerHeaders(), timeout: 15000 });
        return { data: response.data };
    } catch (error) { return { error: failure(error) }; }
}


export async function manageGate(id: string, action: 'enable'|'disable'|'delete') {
    if (!/^[0-9a-f-]{36}$/i.test(id) || !['enable','disable','delete'].includes(action)) return {error:'Invalid gate operation.'};
    try {
        const headers=await caretakerHeaders();
        if(action==='delete') await api.delete(`chat/gates/${id}`,{headers,timeout:15000});
        else await api.patch(`chat/gates/${id}`,{is_active:action==='enable'},{headers,timeout:15000});
        return {success:true};
    }catch(error){return {error:failure(error)};}
}
