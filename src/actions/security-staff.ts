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
    /** Latest sign-in email. The temporary password works only once it is 'sent'. */
    email_status: 'queued' | 'retrying' | 'sent' | 'cancelled' | null;
    staff_number: string | null;
    alternate_phone: string | null;
    home_address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    notes: string | null;
};
export type OfficerCredentials = SecurityOfficer & { temporary_password: string; message: string };
/** After an edit; a temporary password is present only when a changed email got a new welcome. */
export type OfficerUpdated = SecurityOfficer & { temporary_password: string | null; message: string };

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

const officerDetails = z.object({
    full_name: z.string().trim().min(1, 'Enter the officer’s full name').max(255),
    email: z.string().trim().email('Enter a valid email address'),
    phone: z.string().trim().max(40),
    staff_number: z.string().trim().max(50),
    alternate_phone: z.string().trim().max(40),
    home_address: z.string().trim().max(500),
    emergency_contact_name: z.string().trim().max(255),
    emergency_contact_phone: z.string().trim().max(40),
    notes: z.string().trim().max(1000),
});
export type OfficerDetails = z.infer<typeof officerDetails>;

export async function updateSecurityOfficer(id: string, input: unknown): Promise<Result<OfficerUpdated>> {
    if (!z.string().uuid().safeParse(id).success) return { error: 'Invalid officer.' };
    const parsed = officerDetails.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Check the officer details.' };
    try {
        // Blank optional fields are sent as empty text, which clears them.
        return { data: (await api.patch(`security-staff/${id}`, parsed.data, { headers: await caretakerHeaders(), timeout: 20000 })).data };
    } catch (error) {
        return failure(error, 'Unable to save these details. Please retry.');
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

export async function setOfficerSuspended(id: string, suspended: boolean, reason?: string): Promise<Result<true>> {
    if (!z.string().uuid().safeParse(id).success) return { error: 'Invalid officer.' };
    const parsed = z.string().trim().min(1).max(500).safeParse(reason);
    if (suspended && !parsed.success) return { error: 'Enter a suspension reason of 1 to 500 characters.' };
    try {
        await api.patch(`users/${id}/status`, { is_revoked: suspended, reason: suspended ? parsed.data : undefined }, { headers: await caretakerHeaders(), timeout: 15000 });
        return { data: true };
    } catch (error) {
        return failure(error, suspended ? 'Unable to suspend this officer.' : 'Unable to reinstate this officer.');
    }
}
