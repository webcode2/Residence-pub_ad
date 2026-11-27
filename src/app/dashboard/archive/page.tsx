import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { directoryRequest } from '@/actions/directory';

type ArchivedAccount = { id: string; full_name: string; email: string; archived_at: string; retention_deadline: string; hold_at: string | null; reinstatement_requested?: boolean };

export default async function ArchivePage({ searchParams }: {
    searchParams: Promise<{ hold?: string; reinstated?: string }>;
}) {
    const { hold, reinstated } = await searchParams;
    async function retain(form: FormData) {
        'use server';
        const result = await directoryRequest('archive-hold', String(form.get('account') ?? ''));
        if (result?.error) redirect('/dashboard/archive?hold=failed');
        revalidatePath('/dashboard/archive');
        redirect('/dashboard/archive?hold=saved');
    }
    async function reinstate(form: FormData) {
        'use server';
        const result = await directoryRequest('archive-reinstate', String(form.get('account') ?? ''));
        if (result?.error) redirect('/dashboard/archive?reinstated=failed');
        revalidatePath('/dashboard/archive');
        revalidatePath('/dashboard/residents');
        redirect('/dashboard/archive?reinstated=saved');
    }
    const result = await directoryRequest('archive-list');
    const accounts: ArchivedAccount[] = Array.isArray(result) ? result : [];
    return <section className="space-y-6">
        <header>
            <h1 className="text-3xl font-medium tracking-tight">Archive</h1>
            <p className="mt-2 text-sm text-muted-foreground">Accounts removed from the resident directory.</p>
        </header>
        {reinstated === 'saved' && <p role="status" className="text-sm">Account returned to the resident directory.</p>}
        {reinstated === 'failed' && <p role="alert" className="text-sm text-destructive">Could not reinstate the account. The window may have ended or a new account may use the email.</p>}
        {hold === 'saved' && <p role="status" className="text-sm">Retention hold saved.</p>}
        {hold === 'failed' && <p role="alert" className="text-sm text-destructive">Could not retain the account. Check whether the 30-day window is still open.</p>}
        {result?.error ? <p role="alert" className="text-sm text-destructive">{result.error}</p>
            : accounts.length === 0 ? <p className="text-sm text-muted-foreground">No archived accounts.</p>
            : <ul className="divide-y rounded-lg border border-border">
                {accounts.map(account => <li key={account.id} className="flex flex-wrap justify-between gap-3 px-4 py-3">
                    <div><p className="font-medium">{account.full_name}</p><p className="text-sm text-muted-foreground">{account.email}</p></div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <time dateTime={account.archived_at}>
                            Archived {new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeZone: 'Africa/Lagos' }).format(new Date(account.archived_at))}
                        </time>
                        {account.reinstatement_requested && <p className="font-medium text-primary">Reinstatement requested</p>}
                        {account.hold_at ? <p>Retained by caretaker</p>
                            : Date.now() < Date.parse(account.retention_deadline) && <form action={retain}>
                                <input type="hidden" name="account" value={account.id} />
                                <button type="submit" className="rounded-md border border-border px-3 py-2 text-foreground">Retain record</button>
                            </form>}
                        {Date.now() < Date.parse(account.retention_deadline) && <form action={reinstate}>
                            <input type="hidden" name="account" value={account.id} />
                            <button type="submit" className="rounded-md border border-border px-3 py-2 text-foreground">Reinstate account</button>
                        </form>}
                    </div>
                </li>)}
            </ul>}
    </section>;
}
