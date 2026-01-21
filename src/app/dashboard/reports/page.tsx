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
    {
        id: '2',
        title: 'Power Outage - Generator Malfunction',
        description: 'Backup generator failed to start during scheduled PHCN outage. Affected blocks A-D.',
        severity: 'medium',
        location: 'Generator House',
        reportedBy: 'Facility Manager',
        timestamp: '2024-01-17T09:15:00',
        status: 'resolved',
    },
    {
        id: '3',
        title: 'Suspicious Package Found',
        description: 'Unattended package discovered near main gate. Package was inspected and found to be harmless.',
        severity: 'high',
        location: 'Main Gate',
        reportedBy: 'Officer Chidi',
        timestamp: '2024-01-16T16:45:00',
        status: 'resolved',
    },
    {
        id: '4',
        title: 'Noise Complaint - Unit 15C',
        description: 'Multiple complaints about loud music from unit 15C. Resident was warned.',
        severity: 'low',
        location: 'Block C',
        reportedBy: 'Estate Admin',
        timestamp: '2024-01-15T21:00:00',
        status: 'resolved',
    },
];

export default function Reports() {
    const [broadcastOpen, setBroadcastOpen] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastSent, setBroadcastSent] = useState(false);
    const [newIncidentOpen, setNewIncidentOpen] = useState(false);

    const handleBroadcast = () => {
        if (!broadcastMessage.trim()) return;
        setBroadcastSent(true);
        setTimeout(() => {
            setBroadcastSent(false);
            setBroadcastMessage('');
            setBroadcastOpen(false);
        }, 2000);
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
                    <span className="text-3xl font-display font-bold text-foreground">3</span>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-warning" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Investigating</span>
                    </div>
                    <span className="text-3xl font-display font-bold text-foreground">1</span>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                            <Check className="h-5 w-5 text-success" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Resolved (30d)</span>
                    </div>
                    <span className="text-3xl font-display font-bold text-foreground">24</span>
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
                    {mockIncidents.map((incident) => (
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
                                            {incident.reportedBy}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {new Date(incident.timestamp).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <FileText className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Broadcast Modal */}
            <AnimatePresence>
                {broadcastOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setBroadcastOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                        >
                            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                                <div className="flex items-center justify-between p-6 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                            <Bell className="h-5 w-5 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-display font-bold text-foreground">
                                                Estate Broadcast
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Send to all 1,248 residents
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setBroadcastOpen(false)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="p-6">
                                    <textarea
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        placeholder="Type your broadcast message..."
                                        rows={4}
                                        className="w-full p-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        This message will be sent via push notification and SMS to all registered residents.
                                    </p>
                                    <Button
                                        variant={broadcastSent ? "success" : "hero"}
                                        size="lg"
                                        className="w-full mt-4"
                                        onClick={handleBroadcast}
                                        disabled={broadcastSent || !broadcastMessage.trim()}
                                    >
                                        {broadcastSent ? (
                                            <>
                                                <Check className="h-5 w-5" />
                                                Broadcast Sent!
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5" />
                                                Send Broadcast
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
