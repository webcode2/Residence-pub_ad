import 'server-only';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/session';

export interface OwnerIdentity { id: string; email: string; full_name: string | null; roles: string[]; app_id: string; }
export async function setOwnerSession(user: OwnerIdentity, token: string) {
    if (!user.roles.includes('saas_owner') || !token) throw new Error('Platform owner access required.');
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const value = await encrypt({ kind: 'owner', user, token });
    (await cookies()).set('owner_session', value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires });
}
export async function getOwnerSession() {
    const value = (await cookies()).get('owner_session')?.value;
    if (!value) return null;
    try {
        const data = await decrypt(value);
        if (data.kind !== 'owner' || !data.token || !data.user?.roles?.includes('saas_owner')) return null;
        return data as { user: OwnerIdentity; token: string };
    } catch { return null; }
}
export async function clearOwnerSession() { (await cookies()).delete('owner_session'); }
