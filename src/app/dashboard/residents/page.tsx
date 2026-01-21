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
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';

interface Occupant {
    id: string;
    name: string;
    relationship: string;
    phone: string;
}

interface Resident {
    id: string;
    unit: string;
    landlordName: string;
    landlordPhone: string;
    landlordEmail: string;
    registrationToken: string;
    status: 'active' | 'suspended' | 'pending';
    type: 'permanent' | 'tenant';
    occupants: Occupant[];
    lastPayment: string;
}

const mockResidents: Resident[] = [
    {
        id: '1',
        unit: '12A',
        landlordName: 'Chief Adebayo Williams',
        landlordPhone: '+234 803 456 7890',
        landlordEmail: 'adebayo.w@email.com',
        registrationToken: 'REG7X9K2M',
        status: 'active',
        type: 'permanent',
        occupants: [
            { id: '1a', name: 'Mrs. Funke Williams', relationship: 'Spouse', phone: '+234 805 123 4567' },
            { id: '1b', name: 'Tunde Williams', relationship: 'Son', phone: '+234 809 876 5432' },
        ],
        lastPayment: '2024-01-15',
    },
    {
        id: '2',
        unit: '8B',
        landlordName: 'Dr. Emeka Okonkwo',
        landlordPhone: '+234 806 789 0123',
        landlordEmail: 'emeka.o@email.com',
        registrationToken: 'REG4N8P3Q',
        status: 'active',
        type: 'permanent',
        occupants: [
            { id: '2a', name: 'Dr. Ngozi Okonkwo', relationship: 'Spouse', phone: '+234 807 234 5678' },
        ],
        lastPayment: '2024-01-10',
    },
    {
        id: '3',
        unit: '15C',
        landlordName: 'Sarah Johnson',
        landlordPhone: '+234 810 345 6789',
        landlordEmail: 'sarah.j@email.com',
        registrationToken: 'REG2L5W8Y',
        status: 'pending',
        type: 'tenant',
        occupants: [],
        lastPayment: 'N/A',
    },
    {
        id: '4',
        unit: '3D',
        landlordName: 'Alhaji Musa Ibrahim',
        landlordPhone: '+234 802 567 8901',
        landlordEmail: 'musa.i@email.com',
        registrationToken: 'REG9H4T6K',
        status: 'suspended',
        type: 'permanent',
        occupants: [
            { id: '4a', name: 'Hajiya Aisha Ibrahim', relationship: 'Spouse', phone: '+234 803 678 9012' },
            { id: '4b', name: 'Yusuf Ibrahim', relationship: 'Son', phone: '+234 811 789 0123' },
            { id: '4c', name: 'Fatima Ibrahim', relationship: 'Daughter', phone: '+234 812 890 1234' },
        ],
        lastPayment: '2023-11-20',
    },
];

export default function Residents() {
    const [search, setSearch] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [revokeModal, setRevokeModal] = useState<string | null>(null);
    const [offboardModal, setOffboardModal] = useState<string | null>(null);
    const [importModal, setImportModal] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const filteredResidents = useMemo(() => {
        if (!search) return mockResidents;
        const searchLower = search.toLowerCase();
        return mockResidents.filter(
            (r) =>
                r.landlordName.toLowerCase().includes(searchLower) ||
                r.unit.toLowerCase().includes(searchLower) ||
                r.landlordEmail.toLowerCase().includes(searchLower)
        );
    }, [search]);

    const handleExport = () => {
        const csvData = mockResidents.map(r => ({
            Unit: r.unit,
            Landlord: r.landlordName,
            Email: r.landlordEmail,
            Phone: r.landlordPhone,
            Status: r.status,
            Type: r.type,
            Occupants: r.occupants.length,
            LastPayment: r.lastPayment
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
            complete: (results) => {
                console.log('Parsed CSV:', results.data);
                // In a real app, we would send this to the backend
                // with the appId from the context/session
                setTimeout(() => {
                    setIsImporting(false);
                    setImportModal(false);
                    // toast.success(`${results.data.length} residents queued for import`);
                }, 1500);
            },
            error: (error) => {
                console.error('CSV Parsing Error:', error);
                setIsImporting(false);
            }
        });
    };

    const toggleExpand = (id: string) => {
        setExpandedRows((prev) => {
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
        navigator.clipboard.writeText(token);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const statusColors = {
        active: 'bg-success/10 text-success border-success/20',
        pending: 'bg-warning/10 text-warning border-warning/20',
        suspended: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    const typeColors = {
        permanent: 'bg-blue-100 text-blue-700 border-blue-200',
        tenant: 'bg-purple-100 text-purple-700 border-purple-200',
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
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export User Data
                    </Button>
                    <Button variant="hero" onClick={() => setImportModal(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Onboard Resident
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
            <div className="bg-card rounded-xl border border-border overflow-hidden">
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
                            {filteredResidents.map((resident) => (
                                <React.Fragment key={resident.id}>
                                    <tr
                                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                                    >
                                        <td className="p-4">
                                            <span className="font-semibold text-foreground">{resident.unit}</span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-foreground">{resident.landlordName}</p>
                                                <p className="text-sm text-muted-foreground">{resident.landlordEmail}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <code className="px-2 py-1 rounded bg-secondary text-sm font-mono">
                                                    {resident.registrationToken}
                                                </code>
                                                <button
                                                    onClick={() => copyToken(resident.registrationToken)}
                                                    className="p-1.5 rounded hover:bg-secondary transition-colors"
                                                >
                                                    {copiedToken === resident.registrationToken ? (
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
                                                typeColors[resident.type]
                                            )}>
                                                {resident.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border capitalize",
                                                statusColors[resident.status]
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
                                                    onClick={() => setRevokeModal(resident.id)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    title="Revoke Access"
                                                >
                                                    <UserX className="h-4 w-4" />
                                                </Button>
                                                {resident.type === 'permanent' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setOffboardModal(resident.id)}
                                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                        title="Offboard Permanent Resident"
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
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
                                                        <div className="py-4 space-y-3">
                                                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-4"> Registered Occupants </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                                                                {resident.occupants.map((occ) => (
                                                                    <div key={occ.id} className="bg-card p-3 rounded-lg border border-border shadow-sm flex items-center justify-between">
                                                                        <div>
                                                                            <p className="text-sm font-semibold text-foreground">{occ.name}</p>
                                                                            <p className="text-xs text-muted-foreground">{occ.relationship} • {occ.phone}</p>
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                                                <KeyRound className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                                                <UserX className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {resident.occupants.length === 0 && (
                                                                    <div className="col-span-full py-2 text-sm text-muted-foreground italic">
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
                        Showing {filteredResidents.length} of {mockResidents.length} residents
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
            </div>

            {/* Revoke Modal */}
            <AnimatePresence>
                {revokeModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRevokeModal(null)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50"
                        >
                            <div className="bg-card rounded-2xl shadow-xl border border-border p-6">
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
                                        onClick={() => setRevokeModal(null)}
                                    >
                                        Revoke Access
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Offboard Modal */}
            <AnimatePresence>
                {offboardModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOffboardModal(null)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50"
                        >
                            <div className="bg-card rounded-2xl shadow-xl border border-border p-6">
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
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Import Modal */}
            <AnimatePresence>
                {importModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isImporting && setImportModal(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4"
                        >
                            <div className="bg-card rounded-2xl shadow-xl border border-border p-6">
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
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <ChevronDown className="h-5 w-5 rotate-180" />
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
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
