"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Send,
    Users,
    Shield,
    Wrench,
    AlertTriangle,
    Megaphone,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

const NOTIFICATION_TYPES = [
    { value: "general", label: "General", icon: Megaphone, color: "text-accent", bg: "bg-accent/10" },
    { value: "alert", label: "Alert", icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
    { value: "maintenance", label: "Maintenance", icon: Wrench, color: "text-primary", bg: "bg-primary/10" },
    { value: "security", label: "Security", icon: Shield, color: "text-destructive", bg: "bg-destructive/10" },
];

const TARGET_OPTIONS = [
    { value: "", label: "All Users", description: "Broadcast to everyone in the estate" },
    { value: "resident", label: "Residents", description: "Only residents will receive this" },
    { value: "landlord", label: "Landlords", description: "Only landlords will receive this" },
    { value: "security", label: "Security", description: "Only security staff will receive this" },
];

export default function NotificationsPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [type, setType] = useState("general");
    const [targetRole, setTargetRole] = useState("");
    const [sending, setSending] = useState(false);

    const canSend = title.trim().length > 0 && body.trim().length > 0;

    const handleSend = async () => {
        if (!canSend || sending) return;

        setSending(true);

        try {
            await api.post("notifications/notifications", {
                title: title.trim(),
                body: body.trim(),
                type,
                target_role: targetRole || null,
            });

            toast.success("Notification sent successfully!");
            setTitle("");
            setBody("");
            setType("general");
            setTargetRole("");
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ||
                err?.message ||
                "Failed to send notification";
            toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setSending(false);
        }
    };

    const selectedType = NOTIFICATION_TYPES.find((t) => t.value === type)!;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
                        Send Notification
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Broadcast notifications to estate members via push and in-app alerts
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Form Column ──────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Notification Type */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card rounded-xl border border-border p-6"
                    >
                        <label className="text-sm font-medium text-foreground block mb-4">
                            Notification Type
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {NOTIFICATION_TYPES.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setType(t.value)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                                        type === t.value
                                            ? "border-accent bg-accent/5 shadow-sm"
                                            : "border-transparent bg-secondary/30 hover:bg-secondary/50"
                                    )}
                                >
                                    <div className={cn("p-2.5 rounded-xl", t.bg)}>
                                        <t.icon className={cn("h-5 w-5", t.color)} />
                                    </div>
                                    <span className="text-sm font-medium text-foreground">
                                        {t.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-card rounded-xl border border-border p-6"
                    >
                        <div className="space-y-2">
                            <label htmlFor="notif-title" className="text-sm font-medium text-foreground">
                                Title
                            </label>
                            <input
                                id="notif-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Scheduled Maintenance Notice"
                                maxLength={120}
                                className="w-full p-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent outline-none transition"
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {title.length}/120
                            </p>
                        </div>
                    </motion.div>

                    {/* Body / Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-xl border border-border p-6"
                    >
                        <div className="space-y-2">
                            <label htmlFor="notif-body" className="text-sm font-medium text-foreground">
                                Message
                            </label>
                            <textarea
                                id="notif-body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Write your notification message..."
                                rows={5}
                                maxLength={500}
                                className="w-full p-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent outline-none transition resize-none"
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {body.length}/500
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* ── Sidebar Column ───────────────────────────────── */}
                <div className="space-y-6">
                    {/* Target Audience */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-card rounded-xl border border-border p-6"
                    >
                        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-4">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Target Audience
                        </label>
                        <div className="space-y-2">
                            {TARGET_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setTargetRole(opt.value)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg border-2 transition-all duration-200",
                                        targetRole === opt.value
                                            ? "border-accent bg-accent/5"
                                            : "border-transparent bg-secondary/20 hover:bg-secondary/40"
                                    )}
                                >
                                    <p className="font-medium text-sm text-foreground">
                                        {opt.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {opt.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Preview Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card rounded-xl border border-border p-6"
                    >
                        <h3 className="text-sm font-medium text-foreground mb-4">Preview</h3>
                        <div className="bg-background rounded-lg border border-border p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={cn("p-1.5 rounded-md", selectedType.bg)}>
                                    <selectedType.icon className={cn("h-4 w-4", selectedType.color)} />
                                </div>
                                <p className="font-semibold text-sm text-foreground truncate">
                                    {title || "Notification Title"}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-3">
                                {body || "Your message will appear here..."}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-2">
                                {targetRole
                                    ? TARGET_OPTIONS.find((o) => o.value === targetRole)?.label
                                    : "All Users"}{" "}
                                • Just now
                            </p>
                        </div>
                    </motion.div>

                    {/* Send Button */}
                    <Button
                        onClick={handleSend}
                        disabled={!canSend || sending}
                        variant="hero"
                        className="w-full py-6"
                    >
                        {sending ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                            <Send className="h-5 w-5 mr-2" />
                        )}
                        {sending ? "Sending..." : "Send Notification"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
