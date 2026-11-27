"use client";

import React, { Suspense, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ChevronDown,
    ChevronUp,
    UserX,
    UserCheck,
    KeyRound,
    Users,
    MoreHorizontal,
    Copy,
    Check,
    AlertTriangle,
    Download,
    UserMinus,
    UserPlus,
    Upload,
    FileText,
    X,
    Edit,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';
import {uploadLandlordFile} from '@/actions/directory';
import {LandlordImportStatus,LandlordOnboardingTracker} from '@/components/LandlordOnboardingTracker';


import { useResidents, useCreateLandlord, useImportLandlords, useRevokeUser, useRestoreUser, useUpdateUser, useArchiveUser } from '@/hooks/use-residents';
import { useUser } from '@/contexts/UserContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type PasswordReset = { id: string; status: 'queued' | 'retrying' | 'sent' | 'cancelled' };

function PasswordResetStatus({ job }: { job?: PasswordReset | null }) {
    if (!job) return null;
    const labels = {
        queued: "Password email queued",
        retrying: "Password email delivery will retry",
        sent: "Temporary password email accepted",
        cancelled: "Password reset cancelled",
    };
    return <p className="mt-1 text-xs text-muted-foreground" title={`Reset request ${job.id}`}>
        {labels[job.status]}
    </p>;
}

interface Occupant {
    id: string;
    full_name: string;
    roles: string[];
    returning_user?: boolean;
    password_reset?: PasswordReset | null;
    email: string;
    is_revoked: boolean;
    relationship_type?: string;
    invitation_id?: string;
}

interface Resident {
    id: string;
    full_name: string;
    returning_user?: boolean;
    password_reset?: PasswordReset | null;
    email: string;
    house_number: string | null;
    street_name: string | null;
    phone?: string;
    registration_token: string;
    status: 'active' | 'suspended' | 'pending';
    type: 'permanent' | 'tenant' | 'caretaker';
    occupants: Occupant[];
}

export default function ResidentsPage() {
    return <Suspense fallback={<p role="status" className="text-sm text-muted-foreground">Loading directory…</p>}>
        <Residents />
    </Suspense>;
}

function Residents() {
    const view = useSearchParams().get('view');
    const accountFilter = view === 'password-resets' || view === 'returning-users' ? view : null;
    const [search, setSearch] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [suspensionReason, setSuspensionReason] = useState('');
    const [revokeModal, setRevokeModal] = useState<{id: string; name: string; action: 'revoke'|'restore'} | null>(null);
    const [offboardModal, setOffboardModal] = useState<string | null>(null);
    const [importModal, setImportModal] = useState(false);
    const [importTab, setImportTab] = useState<'upload' | 'tracker'>('upload');
    const [manualModal, setManualModal] = useState(false);
    const [resetPassword, setResetPassword] = useState(false);
    const [editModal, setEditModal] = useState<Resident | null>(null);
    const [archiveModal, setArchiveModal] = useState<Resident | null>(null);
    const [manualFormData, setManualFormData] = useState({
        name: '',
        phone: '',
        email: '',
        house_number: '',
        street_name: ''
    });
    const [isImporting, setIsImporting] = useState(false);
    const [trackerVersion,setTrackerVersion]=useState(0);
    const [importError,setImportError]=useState('');
    const { user: currentUser } = useUser();

    const appId = currentUser?.app_id || '';
    const { data: residents = [], isLoading, isError, refetch } = useResidents(appId);
    const createLandlordMutation = useCreateLandlord(appId);
    const importMutation = useImportLandlords(appId);
    const revokeMutation = useRevokeUser(appId);
    const restoreMutation = useRestoreUser(appId);
    const updateMutation = useUpdateUser(appId);
    const archiveMutation = useArchiveUser(appId);

    const filteredResidents = useMemo<Resident[]>(() => {
        const searchLower = search.trim().toLowerCase();
        return residents.filter((resident: Resident) => {
            const accounts = [resident, ...(resident.occupants ?? [])];
            if (accountFilter === 'password-resets' && !accounts.some(account =>
                account.password_reset?.status === 'queued' || account.password_reset?.status === 'retrying')) return false;
            if (accountFilter === 'returning-users' && !accounts.some(account => account.returning_user)) return false;

            return !searchLower ||
                (resident.house_number ?? '').toLowerCase().includes(searchLower) ||
                accounts.some(account => account.full_name.toLowerCase().includes(searchLower) ||
                    account.email.toLowerCase().includes(searchLower));
        });
    }, [accountFilter, search, residents]);

    const handleRevoke = async () => {
        if (!revokeModal || (revokeModal.action === 'revoke' && !suspensionReason.trim())) return;
        try {
            if (revokeModal.action === 'restore') {
                await restoreMutation.mutateAsync(revokeModal.id);
                toast.success("Account restored successfully");
            } else {
                await revokeMutation.mutateAsync({userId: revokeModal.id, reason: suspensionReason.trim()});
                toast.success("Account suspended successfully");
            }
            setRevokeModal(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to update account status");
        }
    };

    const handleExport = () => {
        const csvData = residents.map((r: any) => ({
            Unit: r.house_number || 'N/A',
            'Host / Property Owner': r.full_name,
            Email: r.email,
            Status: r.status,
            Type: r.type,
            Occupants: r.occupants.length,
            Street: r.street_name || ''
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `resident_directory_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file=event.target.files?.[0];
        if(!file)return;
        setIsImporting(true);setImportError('');
        try {
            const form=new FormData();form.set('file',file);
            const results=await uploadLandlordFile(form);
            if(!Array.isArray(results)){setImportError(results.error);return;}
            const importing=results.filter((r:{status:string})=>r.status!=='skipped').length;
            const skipped=results.length-importing;
            toast.success(importing?`Importing ${importing} ${importing===1?'host / property owner':'hosts / property owners'}${skipped?`; ${skipped} already handled`:''}.`:'Nothing new to import: every row was already handled.');
            setTrackerVersion(v=>v+1);
            setImportTab('tracker');
        } catch(error) {setImportError(error instanceof Error?error.message:'Import failed. Check the file and retry.');}
        finally {setIsImporting(false);event.target.value='';}
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsImporting(true);
        try {
            const result: any = await createLandlordMutation.mutateAsync(manualFormData);
            if (result?.email_warning || result?.email_status === 'retrying' || result?.email_status === 'failed') {
                toast.warning(result?.email_warning || "Host / Property Owner added, but the welcome email was not sent.");
            } else {
                toast.success(result?.message || "Host / Property Owner added successfully");
            }
            setManualModal(false);
            setManualFormData({ name: '', phone: '', email: '', house_number: '', street_name: '' });
            refetch();
        } catch (error: any) {
            toast.error(error.message || "Failed to add host / property owner");
        } finally {
            setIsImporting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal) return;
        setIsImporting(true);
        try {
            const updated = await updateMutation.mutateAsync({
                userId: editModal.id,
                data: {
                    full_name: editModal.full_name,
                    email: editModal.email,
                    house_number: editModal.house_number,
                    street_name: editModal.street_name,
                    phone: editModal.phone || null,
                    reset_password: resetPassword
                }
            });
            if (updated?.password_reset?.id) {
                toast.success("Temporary password email queued", {
                    description: `Request reference: ${updated.password_reset.id}`,
                });
            } else {
                toast.success("Account updated successfully");
            }
            setEditModal(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to update host / property owner");
        } finally {
            setIsImporting(false);
        }
    };

    const handleArchive = async () => {
        if (!archiveModal || !suspensionReason.trim()) return;
        try {
            const result = await archiveMutation.mutateAsync({userId: archiveModal.id, reason: suspensionReason.trim()});
            toast.success(result?.message || "Account moved to Archive");
            setArchiveModal(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to archive account");
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedRows((prev: Set<string>) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const copyToken = (token: string) => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(token);
            setCopiedToken(token);
            setTimeout(() => setCopiedToken(null), 2000);
        }
    };

    const statusColors = {
        active: 'bg-success/10 text-success border-success/20',
        pending: 'bg-warning/10 text-warning border-warning/20',
        suspended: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    const typeColors = {
        permanent: 'bg-primary/15 text-foreground border-primary/30',
        tenant: 'bg-purple-100 text-purple-700 border-purple-200',
        caretaker: 'bg-amber-100 text-amber-700 border-amber-200',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                        Resident Directory
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage hosts / property owners and their occupants
                    </p>
                </div>
                <div className="flex items-center gap-3">

                    <Button variant="outline" className="hidden lg:flex" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export User Data
                    </Button>
                    <Button variant="hero" onClick={() => setManualModal(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Host / Property Owner
                    </Button>
                    <Button variant="outline" onClick={() => setImportModal(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Import
                    </Button>
                </div>
            </div>

            <LandlordImportStatus version={trackerVersion} onFinished={refetch} onOpen={()=>{setImportTab('tracker');setImportModal(true);}} />

            {accountFilter && <div className="flex flex-wrap items-center gap-3 text-sm">
                <p>{accountFilter === 'password-resets' ? 'Showing pending password emails' : 'Showing returning users'}</p>
                <Link href="/dashboard/residents" className="text-primary underline underline-offset-2">Clear filter</Link>
            </div>}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, unit, or email..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-accent" />
                            <p className="text-sm font-medium animate-pulse">Fetching directory...</p>
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30">
                                <th className="text-left p-4 font-semibold text-foreground text-sm">Unit</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm">Host / Property Owner</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm hidden md:table-cell">Token</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm hidden lg:table-cell">Type</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm">Status</th>
                                <th className="text-left p-4 font-semibold text-foreground text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isError && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center">
                                        <div className="flex flex-col items-center gap-2 text-destructive">
                                            <AlertCircle className="h-8 w-8" />
                                            <p>Failed to load resident directory</p>
                                            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && !isError && filteredResidents.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No residents found matching your search.
                                    </td>
                                </tr>
                            )}
                            {filteredResidents.map((resident) => (
                                <React.Fragment key={resident.id}>
                                    <tr
                                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                                    >
                                        <td className="p-4">
                                            <span className="font-semibold text-foreground">{resident.house_number || 'N/A'}</span>
                                            {resident.street_name && <p className="text-[10px] text-muted-foreground uppercase">{resident.street_name}</p>}
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {resident.id === currentUser?.id ? (
                                                        <span className="text-accent font-black tracking-widest uppercase">YOU</span>
                                                    ) : resident.full_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {resident.id === currentUser?.id ? (
                                                        <span className="text-accent/70 font-bold tracking-widest uppercase text-[10px]">YOU</span>
                                                    ) : resident.email}
                                                </p>
                                                {resident.returning_user && <span className="text-xs font-medium text-warning">Returning user</span>}
                                                <PasswordResetStatus job={resident.password_reset} />
                                                {resident.phone&&<p className="text-sm text-muted-foreground">{resident.phone}</p>}
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <code className="px-2 py-1 rounded bg-secondary text-sm font-mono">
                                                    {resident.registration_token || '—'}
                                                </code>
                                                <button
                                                    disabled={!resident.registration_token}
                                                    onClick={() => copyToken(resident.registration_token)}
                                                    className="p-1.5 rounded hover:bg-secondary transition-colors"
                                                >
                                                    {copiedToken === resident.registration_token ? (
                                                        <Check className="h-4 w-4 text-success" />
                                                    ) : (
                                                        <Copy className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <span className={cn(
                                                "inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                                                typeColors[resident.type as keyof typeof typeColors] || 'bg-secondary text-muted-foreground border-border'
                                            )}>
                                                {resident.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border capitalize",
                                                statusColors[resident.status as keyof typeof statusColors]
                                            )}>
                                                {resident.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleExpand(resident.id)}
                                                    className="hover:bg-secondary"
                                                    title="View Occupants"
                                                >
                                                    {expandedRows.has(resident.id) ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                {!accountFilter && <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setResetPassword(false); setEditModal(resident); }}
                                                    className="hover:bg-accent/10"
                                                    title="Edit Details"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setSuspensionReason(''); setRevokeModal({id: resident.id, name: resident.full_name, action: resident.status === 'suspended' ? 'restore' : 'revoke'}); }}
                                                    className={cn(resident.status === 'suspended' ? "text-success hover:text-success hover:bg-success/10" : "text-warning hover:text-warning hover:bg-warning/10")}
                                                    title={resident.status === 'suspended' ? "Restore Account" : "Suspend Account"}
                                                >
                                                    {resident.status === 'suspended' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setSuspensionReason(''); setArchiveModal(resident); }}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    title="Move to Archive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <AnimatePresence>
                                        {(expandedRows.has(resident.id) || accountFilter !== null) && (
                                            <tr>
                                                <td colSpan={6} className="bg-secondary/10 px-4 py-0 border-b border-border">
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="py-4 space-y-4">
                                                            <div className="flex items-center justify-between px-4">
                                                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                                    <Users className="h-3 w-3" />
                                                                    Registered Occupants ({resident.occupants.length})
                                                                </h4>
                                                                <p className="text-xs text-muted-foreground">Invited by this host / property owner</p>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 pb-4">
                                                                {resident.occupants.map((occ) => (
                                                                    <div key={occ.id} className="bg-card p-3 rounded-lg border border-border shadow-sm flex items-center justify-between group">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={cn(
                                                                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                                                occ.is_revoked ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                                                                            )}>
                                                                                {occ.full_name.charAt(0)}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-foreground">
                                                                                    {occ.id === currentUser?.id ? (
                                                                                        <span className="text-accent font-black tracking-widest uppercase text-xs">YOU</span>
                                                                                    ) : occ.full_name}
                                                                                    {occ.returning_user && <span className="ml-2 text-xs font-medium text-warning">Returning user</span>}
                                                                                    <PasswordResetStatus job={occ.password_reset} />
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">{occ.email}</p><p className="text-xs text-muted-foreground capitalize">{occ.relationship_type||'Household member'}{occ.invitation_id?` · Invitation ${occ.invitation_id.slice(0,8)}`:''}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className={cn("h-8 w-8", occ.is_revoked ? "text-success hover:text-success" : "text-destructive hover:text-destructive")}
                                                                                onClick={() => { setSuspensionReason(''); setRevokeModal({id: occ.id, name: occ.full_name, action: occ.is_revoked ? 'restore' : 'revoke'}); }}
                                                                                title={occ.is_revoked ? "Restore account" : "Suspend account"}
                                                                            >
                                                                                {occ.is_revoked ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {resident.occupants.length === 0 && (
                                                                    <div className="col-span-full py-4 text-center text-sm text-muted-foreground italic bg-secondary/5 rounded-lg border border-dashed border-border">
                                                                        No additional occupants registered for this unit.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredResidents.length} of {residents.length} residents
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </div>

            {/* Revoke Modal */}
            <AnimatePresence>
                {revokeModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRevokeModal(null)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border p-6 z-10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", revokeModal.action === 'restore' ? "bg-success/10" : "bg-destructive/10")}>
                                    <AlertTriangle className={cn("h-6 w-6", revokeModal.action === 'restore' ? "text-success" : "text-destructive")} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-bold text-foreground">
                                        {revokeModal.action === 'restore' ? 'Restore Account?' : 'Suspend Account?'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {revokeModal.name}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">
                                {revokeModal.action === 'restore'
                                    ? 'This will restore account access. The user will be able to sign in again.'
                                    : 'This will immediately suspend account access. The user will no longer be able to sign in or enter the estate.'}
                            </p>
                            {revokeModal.action === 'revoke' && <label className="block space-y-2 text-sm font-medium">
                                <span>Suspension reason</span>
                                <textarea className="block w-full rounded-md border border-input bg-background p-3" rows={3} maxLength={500} required value={suspensionReason} onChange={event => setSuspensionReason(event.target.value)} />
                            </label>}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setRevokeModal(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant={revokeModal.action === 'restore' ? 'default' : 'destructive'}
                                    className="flex-1"
                                    onClick={handleRevoke}
                                    disabled={revokeMutation.isPending || restoreMutation.isPending || (revokeModal.action === 'revoke' && !suspensionReason.trim())}
                                >
                                    {(revokeMutation.isPending || restoreMutation.isPending) ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        revokeModal.action === 'restore' ? 'Restore Account' : 'Suspend Account'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Offboard Modal */}
            <AnimatePresence>
                {offboardModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOffboardModal(null)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border p-6 z-10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                    <UserMinus className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-bold text-foreground">
                                        Offboard Resident?
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Permanent Member Removal
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">
                                Are you sure you want to offboard this permanent resident? This will remove them from the active directory and archive their data.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setOffboardModal(null)}
                                >
                                    Keep Member
                                </Button>
                                <Button
                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                                    onClick={() => setOffboardModal(null)}
                                >
                                    Confirm Offboard
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Import Modal */}
            <AnimatePresence>
                {importModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isImporting && setImportModal(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-3xl bg-card rounded-2xl shadow-2xl border border-border p-6 z-10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Upload className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-foreground">
                                            Bulk Import Residents
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Upload a CSV or Excel file to batch onboard hosts / property owners
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !isImporting && setImportModal(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Tabs for Upload vs Import Status */}
                            <div className="flex border-b border-border mb-6">
                                <button
                                    type="button"
                                    onClick={() => setImportTab('upload')}
                                    className={cn(
                                        "pb-2 px-4 text-sm font-semibold border-b-2 transition-colors",
                                        importTab === 'upload'
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Upload File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImportTab('tracker')}
                                    className={cn(
                                        "pb-2 px-4 text-sm font-semibold border-b-2 transition-colors",
                                        importTab === 'tracker'
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Import Status
                                </button>
                            </div>

                            {importTab === 'upload' ? (
                                <div className="space-y-6">
                                    <div className="p-8 border-2 border-dashed border-border rounded-xl bg-secondary/30 text-center">
                                        <input
                                            type="file"
                                            id="csv-upload"
                                            className="hidden"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={handleFileUpload}
                                            disabled={isImporting}
                                        />
                                        <label
                                            htmlFor="csv-upload"
                                            className={cn(
                                                "cursor-pointer flex flex-col items-center gap-2",
                                                isImporting && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-2">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <p className="font-semibold text-foreground">
                                                {isImporting ? 'Processing file...' : 'Choose a host / property owner spreadsheet'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                CSV, XLSX or XLS · Maximum 5 MB · 500 hosts / property owners per batch
                                            </p>
                                        </label>
                                    </div>

                                    <div className="space-y-4">
                                        {importError&&<p role="alert" className="text-sm text-destructive">{importError}</p>}
                                        <h4 className="text-sm font-semibold text-foreground">Guidelines:</h4>
                                        <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                                            <li>Use the standardized CSV template for best results.</li>
                                            <li>Required: Name, Email, Phone and House Number. Keep phone and house numbers as text in Excel.</li>
                                            <li>Accounts are scoped to your estate. Every host / property owner must change their temporary password on first login.</li>
                                            <li>Existing emails are skipped. Failed jobs can be retried from the tracker.</li>
                                        </ul>
                                        <a
                                            href="/import-template.csv"
                                            download
                                            className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1.5"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Download CSV Template
                                        </a>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setImportModal(false)}
                                            disabled={isImporting}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <LandlordOnboardingTracker version={trackerVersion} />
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manual Add Modal */}
            <AnimatePresence>
                {manualModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isImporting && setManualModal(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border p-6 z-10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <UserPlus className="h-5 w-5 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-foreground">
                                            Add New Host / Property Owner
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Register a new unit host / property owner
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !isImporting && setManualModal(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. John Doe"
                                        required
                                        value={manualFormData.name}
                                        onChange={(e) => setManualFormData({ ...manualFormData, name: e.target.value })}
                                        disabled={isImporting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="e.g. john@example.com"
                                        required
                                        value={manualFormData.email}
                                        onChange={(e) => setManualFormData({ ...manualFormData, email: e.target.value })}
                                        disabled={isImporting}
                                    />
                                </div>
                                <div className="space-y-2"><Label htmlFor="phone">Phone number</Label><Input id="phone" type="tel" required value={manualFormData.phone} onChange={e=>setManualFormData({...manualFormData,phone:e.target.value})} disabled={isImporting}/></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="house_number">House Number</Label>
                                        <Input
                                            id="house_number"
                                            placeholder="e.g. 12A"
                                            required
                                            value={manualFormData.house_number}
                                            onChange={(e) => setManualFormData({ ...manualFormData, house_number: e.target.value })}
                                            disabled={isImporting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="street_name">Street Name</Label>
                                        <Input
                                            id="street_name"
                                            placeholder="e.g. Oak Avenue"
                                            value={manualFormData.street_name}
                                            onChange={(e) => setManualFormData({ ...manualFormData, street_name: e.target.value })}
                                            disabled={isImporting}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setManualModal(false)}
                                        disabled={isImporting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="hero"
                                        className="flex-1"
                                        disabled={isImporting}
                                    >
                                        {isImporting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Add Host / Property Owner"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isImporting && setEditModal(null)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border p-6 z-10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <Edit className="h-5 w-5 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-foreground">
                                            Edit account
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Update host / property owner details
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !isImporting && setEditModal(null)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Full Name</Label>
                                    <Input
                                        id="edit-name"
                                        placeholder="e.g. John Doe"
                                        required
                                        value={editModal.full_name}
                                        onChange={(e) => setEditModal({ ...editModal, full_name: e.target.value })}
                                        disabled={isImporting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email Address</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        placeholder="e.g. john@example.com"
                                        required
                                        value={editModal.email}
                                        onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                                        disabled={isImporting}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-house_number">House Number</Label>
                                        <Input
                                            id="edit-house_number"
                                            placeholder="e.g. 12A"
                                            required
                                            value={editModal.house_number || ''}
                                            onChange={(e) => setEditModal({ ...editModal, house_number: e.target.value })}
                                            disabled={isImporting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-street_name">Street Name</Label>
                                        <Input
                                            id="edit-street_name"
                                            placeholder="e.g. Oak Avenue"
                                            value={editModal.street_name || ''}
                                            onChange={(e) => setEditModal({ ...editModal, street_name: e.target.value })}
                                            disabled={isImporting}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Phone</Label>
                                    <Input
                                        id="edit-phone"
                                        type="tel"
                                        maxLength={40}
                                        value={editModal.phone || ""}
                                        onChange={(e) => setEditModal({ ...editModal, phone: e.target.value })}
                                        disabled={isImporting}
                                    />
                                </div>
                                <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
                                    <input
                                        type="checkbox"
                                        role="switch"
                                        checked={resetPassword}
                                        onChange={(e) => setResetPassword(e.target.checked)}
                                        disabled={isImporting || editModal.status === "suspended"}
                                    />
                                    <span>
                                        <span className="block font-medium">Reset password</span>
                                        Queue a generated temporary password. The existing password stays active until the email provider accepts delivery.
                                    </span>
                                </label>
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setEditModal(null)}
                                        disabled={isImporting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="hero"
                                        className="flex-1"
                                        disabled={isImporting}
                                    >
                                        {isImporting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save account"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Archive Confirmation Modal */}
            <AnimatePresence>
                {archiveModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setArchiveModal(null)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border p-6 z-10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <Trash2 className="h-6 w-6 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-bold text-foreground">
                                        Move account to Archive?
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Account access will be suspended.
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">
                                Move <b>{archiveModal.full_name}</b> out of the resident directory and into Archive?
                            </p>
                            <label className="block space-y-2 text-sm font-medium">
                                <span>Suspension reason</span>
                                <textarea className="block w-full rounded-md border border-input bg-background p-3" rows={3} maxLength={500} required value={suspensionReason} onChange={event => setSuspensionReason(event.target.value)} />
                            </label>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setArchiveModal(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleArchive}
                                    disabled={archiveMutation.isPending || !suspensionReason.trim()}
                                >
                                    {archiveMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Move to Archive"
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
