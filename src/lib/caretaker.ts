import 'server-only';
import { getSession } from '@/lib/session';

export async function caretakerHeaders() {
    const session = await getSession();
    if (!session?.token || !session.user?.app_id || !session.user.roles?.includes('caretaker')) {
        throw new Error('Estate caretaker access required. Please sign in again.');
    }
    return { Authorization: `Bearer ${session.token}`, 'X-App-Id': session.user.app_id as string };
}

