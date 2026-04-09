"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ChevronDown,
    ChevronUp,
    UserX,
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
    Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';


import { useResidents, useImportLandlords, useRevokeUser, useUpdateUser, useDeleteUser } from '@/hooks/use-residents';
import { useUser } from '@/contexts/UserContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SetGlobalFeeModal } from '@/components/dashboard/SetGlobalFeeModal';

interface Occupant {
    id: string;
    full_name: string;
    roles: string[];
    email: string;
    is_revoked: boolean;
}

interface Resident {
    id: string;
    full_name: string;
    email: string;
    house_number: string | null;
    street_name: string | null;
    registration_token: string;
    status: 'active' | 'suspended' | 'pending';
    type: 'permanent' | 'tenant' | 'caretaker';
    occupants: Occupant[];
}

export default function Residents() {
    const [search, setSearch] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [revokeModal, setRevokeModal] = useState<string | null>(null);
    const [offboardModal, setOffboardModal] = useState<string | null>(null);
    const [importModal, setImportModal] = useState(false);
    const [manualModal, setManualModal] = useState(false);
    const [editModal, setEditModal] = useState<Resident | null>(null);
    const [deleteModal, setDeleteModal] = useState<Resident | null>(null);
    const [feeModal, setFeeModal] = useState(false);
    const [manualFormData, setManualFormData] = useState({
        name: '',
        email: '',
        house_number: '',
        street_name: ''
    });
    const [isImporting, setIsImporting] = useState(false);
    const { user: currentUser } = useUser();

    const appId = currentUser?.app_id || '';
    const { data: residents = [], isLoading, isError } = useResidents(appId);
    const importMutation = useImportLandlords(appId);
    const revokeMutation = useRevokeUser(appId);
    const updateMutation = useUpdateUser(appId);
    const deleteMutation = useDeleteUser(appId);

    const filteredResidents = useMemo<Resident[]>(() => {
        if (!search) return residents;
        const searchLower = search.toLowerCase();
        return residents.filter(
            (r: Resident) =>
                r.full_name.toLowerCase().includes(searchLower) ||
                (r.house_number && r.house_number.toLowerCase().includes(searchLower)) ||
                r.email.toLowerCase().includes(searchLower)
        );
    }, [search, residents]);

    const handleRevoke = async () => {
        if (!revokeModal) return;
        try {
            await revokeMutation.mutateAsync(revokeModal);
            toast.success("Access status updated successfully");
            setRevokeModal(null);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to update access status");
        }
    };

    const handleExport = () => {
        const csvData = residents.map((r: any) => ({
            Unit: r.house_number || 'N/A',
            Landlord: r.full_name,
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

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const formattedData = results.data.map((row: any) => ({
                    email: row.Email || row.email,
                    name: row.Landlord || row.Name || row.full_name || row.name,
                    house_number: row.Unit || row.house_number || row.unit,
                    street_name: row.Street || row.street_name || row.street
                })).filter(r => r.email);

                try {
                    await importMutation.mutateAsync(formattedData);
                    setIsImporting(false);
                    setImportModal(false);
                    toast.success("Residents imported successfully");
                } catch (error) {
                    console.error("Import failed", error);
                    setIsImporting(false);
                    toast.error("Failed to import residents");
                }
            },
            error: (error) => {
                console.error('CSV Parsing Error:', error);
                setIsImporting(false);
            }
        });
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsImporting(true);
        try {
            const results = await importMutation.mutateAsync([manualFormData]);
            const result = results[0];

            if (result.status === 'success') {
                toast.success("Landlord added successfully");
                setManualModal(false);
                setManualFormData({ name: '', email: '', house_number: '', street_name: '' });
            } else if (result.status === 'skipped') {
                toast.warning(`Skipped: ${result.message || "User already exists"}`);
            } else {
                toast.error(`Error: ${result.message || "Failed to add landlord"}`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to add landlord");
        } finally {
            setIsImporting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModal) return;
        setIsImporting(true);
        try {
            await updateMutation.mutateAsync({
                userId: editModal.id,
                data: {
                    full_name: editModal.full_name,
                    email: editModal.email,
                    house_number: editModal.house_number,
                    street_name: editModal.street_name
                }
            });
            toast.success("Landlord updated successfully");
            setEditModal(null);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to update landlord");
        } finally {
            setIsImporting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        try {
            await deleteMutation.mutateAsync(deleteModal.id);
            toast.success("Landlord deleted successfully");
            setDeleteModal(null);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to delete landlord");
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
        permanent: 'bg-blue-100 text-blue-700 border-blue-200',
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
                        Manage landlords and their occupants
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden lg:flex" onClick={() => setFeeModal(true)}>
                        <Banknote className="h-4 w-4 mr-2 text-success" />
                        Set Global Fee
                    </Button>
                    <Button variant="outline" className="hidden lg:flex" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export User Data
                    </Button>
                    <Button variant="hero" onClick={() => setManualModal(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Landlord
                    </Button>
                    <Button variant="outline" onClick={() => setImportModal(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Import
                    </Button>
                </div>
            </div>

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
                                <th className="text-left p-4 font-semibold text-foreground text-sm">Landlord</th>
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
                                            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredResidents.length === 0 && (
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
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <code className="px-2 py-1 rounded bg-secondary text-sm font-mono">
                                                    {resident.registration_token}
                                                </code>
                                                <button
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditModal(resident)}
                                                    className="hover:bg-accent/10"
                                                    title="Edit Details"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteModal(resident)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    title="Delete Resident"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                    <AnimatePresence>
                                        {expandedRows.has(resident.id) && (
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
                                                                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-tighter">
                                                                    <UserPlus className="h-3 w-3 mr-1" /> Add Occupant
                                                                </Button>
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
                                                                                </p>
                                                                                <p className="text-[10px] text-muted-foreground uppercase">{(occ.roles || []).join(', ')}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setRevokeModal(occ.id)}>
                                                                                <UserX className="h-3.5 w-3.5" />
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
                                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-bold text-foreground">
                                        Revoke Access?
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">
                                This will immediately suspend all access tokens for this unit. The resident will no longer be able to enter the estate.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setRevokeModal(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleRevoke}
                                    disabled={revokeMutation.isPending}
                                >
                                    {revokeMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Revoke Access"
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
                            className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border p-6 z-10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Upload className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-foreground">
                                            Bulk Import Residents
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Upload your CSV template to onboard units
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

                            <div className="space-y-6">
                                <div className="p-8 border-2 border-dashed border-border rounded-xl bg-secondary/30 text-center">
                                    <input
                                        type="file"
                                        id="csv-upload"
                                        className="hidden"
                                        accept=".csv"
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
                                            {isImporting ? 'Processing file...' : 'Click to upload or drag and drop'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Maximum file size: 5MB (CSV only)
                                        </p>
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-foreground">Guidelines:</h4>
                                    <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                                        <li>Use the standardized CSV template for best results.</li>
                                        <li>Ensure all mandatory fields (Landlord Name, Email, Unit) are filled.</li>
                                        <li>The <b>app_id</b> will be automatically appended to each entry.</li>
                                        <li>Duplicate units will be skipped or updated based on your settings.</li>
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
                                            Add New Landlord
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Register a new unit landlord
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
                                            "Add Landlord"
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
                                            Edit Landlord
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Update landlord details
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
                                            "Update Landlord"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteModal(null)}
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
                                        Delete Landlord?
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        This action is irreversible
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">
                                Are you sure you want to delete <b>{deleteModal.full_name}</b>? This will remove all associated data and occupants.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setDeleteModal(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global Fee Modal */}
            <SetGlobalFeeModal open={feeModal} onClose={() => setFeeModal(false)} />
        </div>
    );
}
