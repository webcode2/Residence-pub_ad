import { redirect } from 'next/navigation';
import { getOwnerSession } from '@/lib/owner-session';
import OwnerShell from '@/components/owner/OwnerShell';
export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
    const session = await getOwnerSession();
    if (!session) redirect('/owner/login');
    return <OwnerShell name={session.user.full_name || 'Platform owner'} email={session.user.email}>{children}</OwnerShell>;
}
