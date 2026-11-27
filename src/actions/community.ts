"use server";
import { z } from 'zod';
import api from '@/lib/api';
import { caretakerHeaders } from '@/lib/caretaker';

export type ReportSeverity = 'low' | 'medium' | 'high';
export type ReportStatus = 'open' | 'investigating' | 'resolved';
export interface IncidentReport { id: string; title: string; description: string; location: string; severity: ReportSeverity; status: ReportStatus; is_anonymous: boolean; reporter_role: string; reported_by_name: string; reporter_id?: string | null; reporter_identity?: string | null; is_own: boolean; resolution_note: string | null; created_at: string; updated_at: string; }
export interface ReportPage { reports: IncidentReport[]; has_more: boolean; counts: Record<ReportStatus, number>; }
export interface Announcement { id: string; title: string; body: string; category: string; audience: string; author_name: string | null; recipient_count: number; push_sent: number; push_failed: number; created_at: string; }
interface Result<T> { data?: T; error?: string; }

const severity = z.enum(['low', 'medium', 'high']);
const status = z.enum(['open', 'investigating', 'resolved']);
const reportInput = z.object({ title: z.string().trim().min(3).max(120), description: z.string().trim().min(10).max(2000),
    location: z.string().trim().min(2).max(200), severity, is_anonymous: z.boolean() });
const triageInput = z.object({ status: status.optional(), resolution_note: z.string().max(1000).optional() });
const announcementInput = z.object({ title: z.string().trim().min(3).max(120), body: z.string().trim().min(3).max(2000),
    category: z.enum(['alert', 'maintenance', 'security']), audience: z.enum(['all', 'resident', 'landlord', 'security']) });

function failure(error: unknown): string {
    const response = (error as { response?: { status?: number; data?: { detail?: unknown } } }).response;
    if (response?.status === 401) return 'Your session has expired. Please sign in again.';
    if (response?.status === 403) return 'Estate caretaker access required.';
    return typeof response?.data?.detail === 'string' ? response.data.detail : 'Unable to complete the request. Please retry.';
}

async function call<T>(method: 'get' | 'post' | 'patch', url: string, data?: unknown, params?: Record<string, unknown>): Promise<Result<T>> {
    try {
        const response = await api.request<T>({ method, url, data, params, headers: await caretakerHeaders(), timeout: 15000 });
        return { data: response.data };
    } catch (error) { return { error: failure(error) }; }
}

export async function listReports(filters: { status?: string; severity?: string; offset?: number }) {
    return call<ReportPage>('get', 'reports', undefined, {
        status: status.safeParse(filters.status).success ? filters.status : undefined,
        severity: severity.safeParse(filters.severity).success ? filters.severity : undefined,
        offset: Math.max(0, filters.offset ?? 0), limit: 50,
    });
}

export async function createReport(values: z.infer<typeof reportInput>) {
    const parsed = reportInput.safeParse(values);
    if (!parsed.success) return { error: 'Add a title, a location and a description of at least 10 characters.' };
    return call<IncidentReport>('post', 'reports', parsed.data);
}

export async function triageReport(id: string, values: z.infer<typeof triageInput>) {
    const parsed = triageInput.safeParse(values);
    if (!z.string().uuid().safeParse(id).success || !parsed.success) return { error: 'Invalid report update.' };
    return call<IncidentReport>('patch', `reports/${id}`, parsed.data);
}

export async function listAnnouncements(offset = 0) {
    return call<{ announcements: Announcement[]; has_more: boolean }>('get', 'announcements', undefined, { offset: Math.max(0, offset), limit: 25 });
}

export async function sendAnnouncement(values: z.infer<typeof announcementInput>) {
    const parsed = announcementInput.safeParse(values);
    if (!parsed.success) return { error: 'Add a title and a message of at least 3 characters.' };
    return call<Announcement>('post', 'announcements', parsed.data);
}

const salesInput = z.object({ contact_name: z.string().trim().min(2).max(255), contact_email: z.string().trim().email().max(255),
    phone: z.string().trim().max(40).regex(/^[0-9+()\-\s]*$/, 'Use digits, spaces and + ( ) - only.').optional(),
    homes: z.number().int().min(1).max(100000).optional(), message: z.string().trim().min(10).max(2000) });
export type SalesInquiryInput = z.infer<typeof salesInput>;

export async function contactSales(values: SalesInquiryInput) {
    const parsed = salesInput.safeParse(values);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
    return call<{ id: string }>('post', 'sales-inquiries', { ...parsed.data, phone: parsed.data.phone || undefined });
}
