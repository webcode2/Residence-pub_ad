"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Save, Check, Loader2, Key, Settings } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useEstate } from '@/contexts/EstateContext';
import { Button } from '@/components/ui/button';
import { updateProfileAction } from '@/actions/profile';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { user, refreshUser } = useUser();
    const { estate } = useEstate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
    });

    // Sync form state when user data is available
    useEffect(() => {
        if (user) {
            setForm({
                full_name: user.full_name,
                email: user.email,
                password: '',
            });
        }
    }, [user]);

    if (!user) return null;

    const handleUpdate = async (e: React.FormEvent) => {
        console.log("[Profile] Submitting form...", form);
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);

        const updateData: any = {
            full_name: form.full_name,
            email: form.email,
        };

        if (form.password) {
            updateData.password = form.password;
        }

        try {
            console.log("[Profile] Calling updateProfileAction with:", updateData);
            const result = await updateProfileAction(user.id, user.app_id, updateData);
            console.log("[Profile] Update result:", result);

            if (result.success) {
                toast.success("Profile updated successfully!");
                await refreshUser();
                setIsSaved(true);
                setIsEditing(false);
                setTimeout(() => setIsSaved(false), 3000);
            } else {
                toast.error(result.error);
            }
        } catch (error: any) {
            console.error("[Profile] Update error:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                        Personal Profile
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account details and security settings
                    </p>
                </div>
                {!isEditing && (
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="rounded-xl font-bold gap-2"
                    >
                        <Settings className="h-4 w-4" />
                        Edit Profile
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="md:col-span-1 stat-card flex flex-col items-center text-center py-10"
                >
                    <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-4 border-2 border-primary/20">
                        <User className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground">
                        {user.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize mt-1">
                        {user.roles.join(', ')}
                    </p>
                    <div className="mt-6 w-full pt-6 border-t border-border space-y-3 text-left">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            <span>ID: {user.id.substring(0, 8)}...</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{user.email}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Edit Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 stat-card"
                >
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={form.full_name}
                                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-background border border-accent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    ) : (
                                        <div className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-xl text-sm text-foreground">
                                            {user.full_name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-background border border-accent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                                            placeholder="admin@estate.com"
                                            required
                                        />
                                    ) : (
                                        <div className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-xl text-sm text-foreground">
                                            {user.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-semibold text-foreground">New Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-background border border-accent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                                            placeholder="Leave blank to keep current"
                                            minLength={8}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Must be at least 8 characters long.
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {isEditing && (
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border relative z-20">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        console.log("Cancel clicked");
                                        setIsEditing(false);
                                        setForm({
                                            full_name: user?.full_name || '',
                                            email: user?.email || '',
                                            password: ''
                                        });
                                    }}
                                    className="rounded-xl"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Update Profile
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
