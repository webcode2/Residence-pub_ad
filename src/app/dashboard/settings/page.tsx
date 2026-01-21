"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    CreditCard,
    Wifi,
    Save,
    Copy,
    Check,
    Eye,
    EyeOff,
    Sparkles,
    ShieldCheck,
    UserMinus,
    Lock,
    Plus,
    Trash2,
    Edit2,
    Settings2,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEstate } from '@/contexts/EstateContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Settings() {
    const { estate, updateEstate } = useEstate();
    const [estateName, setEstateName] = useState(estate.estateName);
    const [showApiKey, setShowApiKey] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [saved, setSaved] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [allowOffboarding, setAllowOffboarding] = useState(true);
    const [devices, setDevices] = useState([
        { id: '1', name: 'Main Gate Scanner', status: 'online', apiKey: 'rp_dev_xK9mN3pQ7rS2vT5wY8zA1' },
        { id: '2', name: 'Service Gate Scanner', status: 'online', apiKey: 'rp_dev_mN3pQ7rS2vT5wY8zA1' },
        { id: '3', name: 'VIP Gate Scanner', status: 'offline', apiKey: 'rp_dev_Q7rS2vT5wY8zA1bC4dE6' },
    ]);
    const [isAddingDevice, setIsAddingDevice] = useState(false);
    const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [isEditingEstate, setIsEditingEstate] = useState(false);

    const mockApiKey = 'rp_live_xK9mN3pQ7rS2vT5wY8zA1bC4dE6fG0hI';

    const handleCopyKey = () => {
        navigator.clipboard.writeText(mockApiKey);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const handleSave = () => {
        updateEstate({ estateName });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleAddDevice = () => {
        if (!newDeviceName.trim()) return;

        if (editingDeviceId) {
            setDevices(devices.map(d => d.id === editingDeviceId ? { ...d, name: newDeviceName } : d));
            setEditingDeviceId(null);
        } else {
            const newDevice = {
                id: Math.random().toString(36).substr(2, 9),
                name: newDeviceName,
                status: 'online',
                apiKey: `rp_dev_${Math.random().toString(36).substr(2, 12)}`
            };
            setDevices([...devices, newDevice]);
        }
        setNewDeviceName('');
        setIsAddingDevice(false);
    };

    const handleEditDevice = (device: any) => {
        setEditingDeviceId(device.id);
        setNewDeviceName(device.name);
        setIsAddingDevice(true);
    };

    const handleRemoveDevice = (id: string) => {
        setDevices(devices.filter(d => d.id !== id));
    };

    const tiers = [
        {
            name: 'Community',
            price: '₦25,000/mo',
            current: estate.tier === 'community',
            features: ['50 units', 'Basic logs', 'Email support']
        },
        {
            name: 'Pro',
            price: '₦75,000/mo',
            current: estate.tier === 'pro',
            features: ['500 units', 'Advanced analytics', 'Priority support', 'IoT integration']
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            current: estate.tier === 'enterprise',
            features: ['Unlimited', 'White-label', 'Dedicated manager', 'SLA guarantee']
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                    Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage your estate configuration and integrations
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Estate Metadata */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="stat-card h-full"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-display font-semibold text-foreground">
                            Estate Information
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Estate Name
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={estateName}
                                    onChange={(e) => setEstateName(e.target.value)}
                                    disabled={!isEditingEstate}
                                    className={cn(
                                        "flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent transition-all",
                                        isEditingEstate
                                            ? "bg-background border-accent shadow-sm"
                                            : "bg-secondary/30 border-input cursor-not-allowed"
                                    )}
                                />
                                {isEditingEstate ? (
                                    <Button
                                        variant="hero"
                                        size="sm"
                                        onClick={() => {
                                            handleSave();
                                            setIsEditingEstate(false);
                                        }}
                                        disabled={saved || estateName === estate.estateName}
                                    >
                                        Update
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditingEstate(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                App ID
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-4 py-3 rounded-lg bg-secondary/50 border border-border font-mono text-sm text-muted-foreground cursor-not-allowed">
                                    {estate.appId}
                                </code>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Unique identifier for your estate (non-editable)
                            </p>
                        </div>
                        <AnimatePresence>
                            {saved && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-2 text-center"
                                >
                                    <p className="text-xs font-semibold text-success flex items-center justify-center gap-1">
                                        <Check className="h-3 w-3" />
                                        Estate name updated successfully
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Security Section (2FA) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card h-full"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-success" />
                        </div>
                        <h3 className="text-lg font-display font-semibold text-foreground">
                            Security & Access
                        </h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                            <div>
                                <h4 className="font-semibold text-foreground">Two-Factor Authentication</h4>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                            </div>
                            <button
                                onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                                className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                    is2FAEnabled ? "bg-success" : "bg-muted"
                                )}
                            >
                                <span className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    is2FAEnabled ? "translate-x-6" : "translate-x-1"
                                )} />
                            </button>
                        </div>

                        <div className="p-4 rounded-xl border border-dashed border-border">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-foreground">Trusted Devices</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        You have 3 trusted devices authorized to access this caretaker account.
                                    </p>
                                    <Button variant="link" className="h-auto p-0 text-xs text-primary mt-2">
                                        Manage Devices
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Member Lifecycle (Unboarding) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stat-card"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <UserMinus className="h-5 w-5 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-display font-semibold text-foreground">
                            Member Lifecycle
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-semibold text-foreground">Resident Offboarding</h4>
                                <p className="text-xs text-muted-foreground italic">Permanent resident unboarding option</p>
                            </div>
                            <button
                                onClick={() => setAllowOffboarding(!allowOffboarding)}
                                className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                    allowOffboarding ? "bg-accent" : "bg-muted"
                                )}
                            >
                                <span className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    allowOffboarding ? "translate-x-6" : "translate-x-1"
                                )} />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg border border-border">
                            When enabled, admins can permanently offboard residents, which revokes all tokens and archives their historical data from the active directory.
                        </p>
                    </div>
                </motion.div>

                {/* IoT Integration */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="stat-card"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                <Wifi className="h-5 w-5 text-accent" />
                            </div>
                            <h3 className="text-lg font-display font-semibold text-foreground">
                                Scan Hardware
                            </h3>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/dashboard/settings/devices">
                                <Button variant="ghost" size="sm" className="h-9">
                                    Show all
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddingDevice(true)}
                                className="h-9 px-3"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Connect
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-3">
                            {devices.slice(0, 2).map((device) => (
                                <div
                                    key={device.id}
                                    className="p-4 rounded-xl bg-secondary/30 border border-border group hover:border-accent/30 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "w-2 h-2 rounded-full",
                                                device.status === 'online' ? 'bg-success animate-pulse' : 'bg-muted-foreground'
                                            )} />
                                            <span className="font-semibold text-foreground">{device.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto relative z-10">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-accent/10 hover:text-accent"
                                                onClick={() => handleEditDevice(device)}
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemoveDevice(device.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 px-3 py-1.5 rounded bg-secondary border border-border/50 font-mono text-[11px] text-muted-foreground truncate">
                                            {device.apiKey}
                                        </code>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                            navigator.clipboard.writeText(device.apiKey);
                                        }}>
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Global Modals */}
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
                                <form onSubmit={(e) => { e.preventDefault(); handleAddDevice(); }}>
                                    <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                                <Plus className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-display font-bold text-foreground">
                                                {editingDeviceId ? 'Update Device' : 'Connect New Scanner'}
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingDevice(false);
                                                setEditingDeviceId(null);
                                                setNewDeviceName('');
                                            }}
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

                                        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 mt-4">
                                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                                                {editingDeviceId
                                                    ? "Updating the name will not change the device's API credentials."
                                                    : "A unique API key will be generated for this device once added. You will need to flash this key onto the hardware scanner."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-6 flex gap-3 text-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setIsAddingDevice(false);
                                                setEditingDeviceId(null);
                                                setNewDeviceName('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="hero"
                                            className="flex-1"
                                        >
                                            {editingDeviceId ? 'Update' : 'Connect Device'}
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
