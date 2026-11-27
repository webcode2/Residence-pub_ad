import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { changePasswordAction } from '@/actions/profile';
import { Button } from '@/components/ui/button';

export default async function ChangePasswordPage({ searchParams }: {
    searchParams: Promise<{ error?: string }>;
}) {
    const session = await getSession();
    if (!session?.token) redirect('/login');
    if (!session.user.must_change_password) redirect('/dashboard');
    const { error } = await searchParams;

    async function submit(form: FormData) {
        'use server';
        const password = String(form.get('new_password') ?? '');
        if (password !== form.get('confirmation')) {
            redirect('/change-password?error=mismatch');
        }
        const result = await changePasswordAction({
            current_password: String(form.get('current_password') ?? ''),
            new_password: password,
        });
        if (result.error) {
            redirect('/change-password?error=failed');
        }
        redirect('/dashboard');
    }

    return <div className="space-y-5">
        <h1 className="text-3xl font-medium">Change your password</h1>
        <p className="text-sm text-muted-foreground">Choose a new password before opening your estate dashboard.</p>
        <form action={submit} className="space-y-4">
            <label className="block text-sm">Temporary password
                <input name="current_password" type="password" autoComplete="current-password" required className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" />
            </label>
            <label className="block text-sm">New password
                <input name="new_password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" />
            </label>
            <label className="block text-sm">Confirm new password
                <input name="confirmation" type="password" autoComplete="new-password" required className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" />
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error === 'mismatch'
                ? 'The new passwords do not match.'
                : 'Unable to change your password. Check your temporary password and try again.'}</p>}
            <Button type="submit" className="w-full">Save new password</Button>
        </form>
    </div>;
}
