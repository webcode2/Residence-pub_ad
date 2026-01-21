"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wifi,
    Plus,
    Trash2,
    Edit2,
    Copy,
    Check,
    X,
    ArrowLeft,
    Search,
    ChevronRight,
    Signal,
    Activity,
    Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DevicesPage() {
    const [devices, setDevices] = useState([
        { id: '1', name: 'Main Gate Scanner', status: 'online', apiKey: 'rp_dev_xK9mN3pQ7rS2vT5wY8zA1', lastSync: '2 mins ago', ip: '192.168.1.104', location: 'Estate Main Entrance' },
        { id: '2', name: 'Service Gate Scanner', status: 'online', apiKey: 'rp_dev_mN3pQ7rS2vT5wY8zA1', lastSync: '5 mins ago', ip: '192.168.1.105', location: 'Service Road entrance' },
        { id: '3', name: 'VIP Gate Scanner', status: 'offline', apiKey: 'rp_dev_Q7rS2vT5wY8zA1bC4dE6', lastSync: '1 day ago', ip: '192.168.1.106', location: 'Exclusive Wing Entrance' },
        { id: '4', name: 'West Gate Scanner', status: 'online', apiKey: 'rp_dev_bG4dE6fG0hIqR8sT2uV9v', lastSync: '10 mins ago', ip: '192.168.1.107', location: 'West Residential Block' },
    ]);

    const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0].id);
    const [isAddingDevice, setIsAddingDevice] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [newDeviceLocation, setNewDeviceLocation] = useState('');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const selectedDevice = devices.find(d => d.id === selectedDeviceId) || devices[0];

    const handleCopyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleAddDevice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeviceName.trim()) return;

        const newDevice = {
            id: Math.random().toString(36).substr(2, 9),
            name: newDeviceName,
            status: 'online',
            apiKey: `rp_dev_${Math.random().toString(36).substr(2, 12)}`,
            lastSync: 'Just now',
            ip: `192.168.1.${100 + devices.length + 1}`,
            location: newDeviceLocation || 'Unassigned'
        };

        setDevices([...devices, newDevice]);
        setNewDeviceName('');
        setNewDeviceLocation('');
        setIsAddingDevice(false);
        setSelectedDeviceId(newDevice.id);
    };

    const handleRemoveDevice = (id: string) => {
        const updatedDevices = devices.filter(d => d.id !== id);
        setDevices(updatedDevices);
        if (selectedDeviceId === id && updatedDevices.length > 0) {
            setSelectedDeviceId(updatedDevices[0].id);
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-foreground">IoT Scanner Directory</h1>
                        <p className="text-sm text-muted-foreground">Manage and monitor your estate's hardware scanners</p>
                    </div>
                </div>
                <Button variant="hero" onClick={() => setIsAddingDevice(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                </Button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left side: List */}
                <div className="w-1/3 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search devices..."
                            className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {devices.map((device) => (
                            <button
                                key={device.id}
                                onClick={() => setSelectedDeviceId(device.id)}
                                className={cn(
                                    "w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group",
                                    selectedDeviceId === device.id
                                        ? "bg-accent/10 border-accent shadow-sm"
                                        : "bg-card border-border hover:border-accent/30"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                        selectedDeviceId === device.id ? "bg-accent text-white" : "bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
                                    )}>
                                        <Wifi className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{device.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                device.status === 'online' ? "bg-success animate-pulse" : "bg-muted-foreground"
                                            )} />
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{device.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-accent/10 hover:text-accent"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Handle edit - we'll just set the name for now as a mock
                                            setNewDeviceName(device.name);
                                            setNewDeviceLocation(device.location);
                                            // Ideally we'd have a separate edit state
                                            setIsAddingDevice(true);
                                        }}
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveDevice(device.id);
                                        }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                                <ChevronRight className={cn(
                                    "h-4 w-4 transition-transform group-hover:translate-x-1 shrink-0",
                                    selectedDeviceId === device.id ? "text-accent" : "text-muted-foreground"
                                )} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right side: Details */}
                <div className="flex-1 overflow-y-auto">
                    {selectedDevice ? (
                        <motion.div
                            key={selectedDevice.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-card rounded-2xl border border-border p-8 h-full shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                        <Wifi className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-foreground">{selectedDevice.name}</h2>
                                        <p className="text-muted-foreground">{selectedDevice.location}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Rename
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveDevice(selectedDevice.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Activity className="h-5 w-5 text-accent" />
                                        <h3 className="font-semibold text-foreground">Hardware Status</h3>
                                    </div>
                                    <div className="space-y-3 font-medium">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">IP Address</span>
                                            <span className="text-foreground">{selectedDevice.ip}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Connection Status</span>
                                            <span className={selectedDevice.status === 'online' ? "text-success" : "text-muted-foreground"}>{selectedDevice.status}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Last Ping Sync</span>
                                            <span className="text-foreground">{selectedDevice.lastSync}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="h-5 w-5 text-success" />
                                        <h3 className="font-semibold text-foreground">Security Credentials</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase font-black mb-1.5 block tracking-widest">Device API Key</label>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 px-3 py-2 rounded-lg bg-background border border-border font-mono text-xs text-foreground truncate">
                                                    {selectedDevice.apiKey}
                                                </code>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleCopyKey(selectedDevice.apiKey)}
                                                >
                                                    {copiedKey === selectedDevice.apiKey ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                                            This key is used by the hardware scanner to authenticate with the Residence cloud. Keep it private.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center">
                                <Signal className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <h3 className="font-semibold text-foreground mb-2">Live Logs Interface</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                                    Real-time access logs from this specific hardware unit will appear here once connected and performing scans.
                                </p>
                                <Button variant="outline" size="sm" disabled>
                                    Open Live Stream
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl">
                            <p className="text-muted-foreground">Select a device to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Device Modal */}
            <AnimatePresence>
                {isAddingDevice && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddingDevice(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[70] px-4"
                        >
                            <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
                                <form onSubmit={handleAddDevice}>
                                    <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                                <Plus className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-display font-bold text-foreground">Connect New Scanner</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingDevice(false)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-foreground">Device Name</label>
                                            <input
                                                type="text"
                                                value={newDeviceName}
                                                onChange={(e) => setNewDeviceName(e.target.value)}
                                                placeholder="e.g. South Gate Main"
                                                className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                                autoFocus
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-foreground">Physical Location</label>
                                            <input
                                                type="text"
                                                value={newDeviceLocation}
                                                onChange={(e) => setNewDeviceLocation(e.target.value)}
                                                placeholder="e.g. Main Entrance Pedestrian"
                                                className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                            />
                                        </div>

                                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mt-4">
                                            <p className="text-xs text-amber-800 leading-relaxed italic">
                                                A unique API key will be generated for this device once added. You will need to flash this key onto the hardware scanner.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-6 flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setIsAddingDevice(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="hero"
                                            className="flex-1 shadow-lg shadow-accent/20"
                                        >
                                            Connect Device
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
