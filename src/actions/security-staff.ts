"use server";

import api from '@/lib/api';
import { caretakerHeaders } from '@/lib/caretaker';
import { z } from 'zod';

export type SecurityOfficer = {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    status: 'active' | 'awaiting_first_sign_in' | 'suspended';
    created_at: string;
};
export type OfficerCredentials = SecurityOfficer & { temporary_password: string; email_status: string; message: string };

type Result<T> = { data: T; error?: undefined } | { data?: undefined; error: string };

// Server actions hide thrown messages in production, so failures are returned as text.
function failure(error: unknown, fallback: string): { error: string } {
    const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
    return { error: typeof detail === 'string' ? detail : fallback };
}

const officerInput = z.object({
    full_name: z.string().trim().min(1, 'Enter the officer’s full name').max(255),
    email: z.string().trim().email('Enter a valid email address'),
    phone: z.string().trim().max(40).optional(),
});

export async function listSecurityStaff(): Promise<Result<SecurityOfficer[]>> {
    try {
        return { data: (await api.get('security-staff', { headers: await caretakerHeaders(), timeout: 15000 })).data };
    } catch (error) {
        return failure(error, 'Unable to load security staff. Please retry.');
    }
}

export async function registerSecurityOfficer(input: unknown): Promise<Result<OfficerCredentials>> {
    const parsed = officerInput.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Check the officer details.' };
    try {
        const body = { ...parsed.data, phone: parsed.data.phone || undefined };
        return { data: (await api.post('security-staff', body, { headers: await caretakerHeaders(), timeout: 20000 })).data };
    } catch (error) {
        return failure(error, 'Unable to register this officer. Please retry.');
    }
}

export async function resetOfficerPassword(id: string): Promise<Result<OfficerCredentials>> {
    if (!z.string().uuid().safeParse(id).success) return { error: 'Invalid officer.' };
    try {
        return { data: (await api.post(`security-staff/${id}/reset-password`, {}, { headers: await caretakerHeaders(), timeout: 20000 })).data };
    } catch (error) {
        return failure(error, 'Unable to reset this officer’s password. Please retry.');
    }
}

export async function setOfficerSuspended(id: string, suspended: boolean): Promise<Result<true>> {
    if (!z.string().uuid().safeParse(id).success) return { error: 'Invalid officer.' };
    try {
        await api.patch(`users/${id}/status`, { is_revoked: suspended }, { headers: await caretakerHeaders(), timeout: 15000 });
        return { data: true };
    } catch (error) {
        return failure(error, suspended ? 'Unable to suspend this officer.' : 'Unable to reinstate this officer.');
    }
}
