"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, Building2, Chrome, ArrowRight, Play, Loader2, AlertCircle } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useEstate } from "@/contexts/EstateContext";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LoginSchema = z.object({
    appId: z.string().min(3, "App ID is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
    const router = useRouter();
    const { refreshUser } = useUser();
    const { updateEstate } = useEstate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            appId: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof LoginSchema>) {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const result = await loginAction(values);

            if (result.twoFactorRequired) {
                toast.success("Please enter your 2FA code.");
                router.push("/2fa");
            } else if (result.error) {
                setErrorMessage(result.error);
                toast.error(result.error);
            } else {
                localStorage.setItem('app_id', values.appId);

                // Refresh contexts before navigation
                updateEstate({ appId: values.appId });
                await refreshUser();

                toast.success("Login successful!");
                router.push("/dashboard");
            }
        } catch (error: any) {
            // Show the real error for debugging
            const msg = error?.message || "Something went wrong. Please check your connection and try again.";
            console.error("[LoginPage] Outer catch error:", error);
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
                <h1 className="text-3xl font-medium text-foreground tracking-tight">Welcome back</h1>
                <p className="text-slate-500 font-medium">Log in to manage your estate operations.</p>
            </div>

            {errorMessage && (
                <Alert variant="destructive" className="rounded-md border-red-200 bg-red-50 text-red-900">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="font-bold">Login Failed</AlertTitle>
                    <AlertDescription className="font-medium">
                        {errorMessage}
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="appId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Estate App ID</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="RP-XXXXX" {...field} className="pl-10 h-12 bg-white border-input rounded-md focus:ring-ring" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="admin@estate.com" {...field} className="pl-10 h-12 bg-white border-input rounded-md focus:ring-ring" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel className="font-medium text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Password</FormLabel>

                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input type="password" placeholder="••••••••" {...field} className="pl-10 h-12 bg-white border-input rounded-md focus:ring-ring" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-md transition-all shadow-lg shadow-primary/25"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            "Sign In to Dashboard"
                        )}
                    </Button>
                </form>
            </Form>

            <div className="text-center text-sm font-medium text-slate-500">
                Don&apos;t have an estate account?{" "}
                <Link href="/register" className="text-foreground font-bold hover:underline">
                    Register New Estate
                </Link>
            </div>
            <p className="text-center text-xs text-muted-foreground pt-3 border-t border-border">Managing the platform? <Link href="/owner/login" className="font-medium text-primary hover:underline">Owner console</Link></p>
        </div>
    );
}
