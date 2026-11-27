import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import CardActivation from '@/components/CardActivation';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession().catch(() => null);
    if (!session?.token || !session.user?.app_id ||
        !session.user.roles?.includes('caretaker')) {
        redirect('/login?reason=caretaker');
    }
    if (session.user.must_change_password) redirect('/change-password');
    return <DashboardShell><CardActivation>{children}</CardActivation></DashboardShell>;
}
