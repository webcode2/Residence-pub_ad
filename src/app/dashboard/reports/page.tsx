"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    Bell,
    Send,
    Plus,
    Clock,
    MapPin,
    User,
    FileText,
    X,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReports, useCreateReport, useUpdateReport, Report } from '@/hooks/use-reports';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

/* 
interface Incident {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    location: string;
    reportedBy: string;
    timestamp: string;
    status: 'open' | 'investigating' | 'resolved';
}

const mockIncidents: Incident[] = [
    {
        id: '1',
        title: 'Unauthorized Entry Attempt',
        description: 'Individual attempted to enter through service gate without valid credentials. Security intervened.',
        severity: 'high',
        location: 'Service Gate',
        reportedBy: 'Officer Ade',
        timestamp: '2024-01-18T14:30:00',
        status: 'investigating',
    },
    ...
];
*/

export default function Reports() {
    const [broadcastOpen, setBroadcastOpen] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastSent, setBroadcastSent] = useState(false);
    const [newIncidentOpen, setNewIncidentOpen] = useState(false);

    // New Incident State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: 'low' as 'low' | 'medium' | 'high',
        location: '',
        is_anonymous: false
    });

    const { user } = useUser();
    const appId = user?.app_id || '';
    const { data: reports = [], isLoading } = useReports(appId);
    const createMutation = useCreateReport(appId);
    const updateMutation = useUpdateReport(appId);
    const isAdmin = user?.roles?.some(r => r.toLowerCase() === 'caretaker' || r.toLowerCase() === 'saas_owner');

    const handleBroadcast = () => {
        if (!broadcastMessage.trim()) return;
        setBroadcastSent(true);
        setTimeout(() => {
            setBroadcastSent(false);
            setBroadcastMessage('');
            setBroadcastOpen(false);
        }, 2000);
    };

    const handleCreateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMutation.mutateAsync(formData);
            toast.success("Incident reported successfully");
            setNewIncidentOpen(false);
            setFormData({ title: '', description: '', severity: 'low', location: '', is_anonymous: false });
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to submit report");
        }
    };

    const handleStatusUpdate = async (id: string, status: Report['status']) => {
        try {
            await updateMutation.mutateAsync({ id, data: { status } });
            toast.success(`Report status updated to ${status}`);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to update status");
        }
    };

    const severityColors = {
        low: 'bg-muted text-muted-foreground border-muted',
        medium: 'bg-warning/10 text-warning border-warning/20',
        high: 'bg-destructive/10 text-destructive border-destructive/20',
    };

    const statusColors = {
        open: 'bg-destructive/10 text-destructive',
        investigating: 'bg-warning/10 text-warning',
        resolved: 'bg-success/10 text-success',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                        Security Reports
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Incident logging and estate-wide broadcasts
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setNewIncidentOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Incident
                    </Button>
                    <Button variant="hero" onClick={() => setBroadcastOpen(true)}>
                        <Bell className="h-4 w-4 mr-2" />
                        Broadcast
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Open Incidents</span>
                    </div>
                    <span className="text-3xl font-display font-bold text-foreground">
                        {reports.filter(r => r.status === 'open').length}
                    </span>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-warning" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Investigating</span>
                    </div>
                    <span className="text-3xl font-display font-bold text-foreground">
                        {reports.filter(r => r.status === 'investigating').length}
                    </span>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                            <Check className="h-5 w-5 text-success" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Resolved (Total)</span>
                    </div>
                    <span className="text-3xl font-display font-bold text-foreground">
                        {reports.filter(r => r.status === 'resolved').length}
                    </span>
                </div>
            </div>

            {/* Incidents List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
            >
                <div className="p-4 border-b border-border">
                    <h3 className="text-lg font-display font-semibold text-foreground">
                        Incident Log
                    </h3>
                </div>

                <div className="divide-y divide-border">
                    {isLoading ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-accent" />
                            <p>Loading security reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            No security incidents reported yet.
                        </div>
                    ) : reports.map((incident) => (
                        <div
                            key={incident.id}
                            className="p-4 hover:bg-secondary/30 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={cn(
                                            "inline-flex px-2 py-0.5 rounded text-xs font-semibold border",
                                            severityColors[incident.severity]
                                        )}>
                                            {incident.severity.toUpperCase()}
                                        </span>
                                        <span className={cn(
                                            "inline-flex px-2 py-0.5 rounded text-xs font-semibold capitalize",
                                            statusColors[incident.status]
                                        )}>
                                            {incident.status}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-foreground mb-1">{incident.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {incident.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5" />
                                            {incident.reported_by_name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {new Date(incident.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                                {isAdmin && incident.status !== 'resolved' && (
                                    <div className="flex flex-col gap-2">
                                        {incident.status === 'open' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStatusUpdate(incident.id, 'investigating')}
                                                disabled={updateMutation.isPending}
                                            >
                                                Investigate
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-success hover:text-success hover:bg-success/10"
                                            onClick={() => handleStatusUpdate(incident.id, 'resolved')}
                                            disabled={updateMutation.isPending}
                                        >
                                            Resolve
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* New Incident Modal */}
            <AnimatePresence>
                {newIncidentOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setNewIncidentOpen(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-10"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-border">
                                <h3 className="text-xl font-display font-bold text-foreground">Report Incident</h3>
                                <Button variant="ghost" size="icon" onClick={() => setNewIncidentOpen(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <form onSubmit={handleCreateReport} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Incident Title</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Suspicious activity near Gate A"
                                        className="w-full p-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-accent outline-none"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Location</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Block C Parking"
                                            className="w-full p-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-accent outline-none"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Severity</label>
                                        <select
                                            className="w-full p-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-accent outline-none appearance-none"
                                            value={formData.severity}
                                            onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Details</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Describe what happened..."
                                        className="w-full p-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-accent outline-none resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="anonymous"
                                        className="w-4 h-4 rounded border-input bg-background text-accent focus:ring-accent"
                                        checked={formData.is_anonymous}
                                        onChange={e => setFormData({ ...formData, is_anonymous: e.target.checked })}
                                    />
                                    <label htmlFor="anonymous" className="text-sm font-medium text-foreground cursor-pointer">
                                        Report Anonymously
                                    </label>
                                    <span className="text-[10px] text-muted-foreground ml-auto bg-background/50 px-2 py-0.5 rounded">
                                        Identity hidden from residents
                                    </span>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full py-6"
                                    variant="hero"
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        "Submit Security Report"
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
