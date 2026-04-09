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
                if (result.data?.token?.access_token) {
                    localStorage.setItem('access_token', result.data.token.access_token);
                }

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
                <h1 className="text-3xl font-black text-blue-900 tracking-tight">Welcome back</h1>
                <p className="text-slate-500 font-medium">Log in to manage your estate operations.</p>
            </div>

            <div className="grid gap-4">
                <Button variant="outline" className="h-12 border-slate-200 gap-3 font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-900 transition-all rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24" height="24">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    Continue with Google
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-50 px-2 text-slate-400 font-bold tracking-widest">Or continue with email</span>
                    </div>
                </div>
            </div>

            {errorMessage && (
                <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50 text-red-900">
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
                                <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Estate App ID</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input placeholder="RP-XXXXX" {...field} className="pl-10 h-12 bg-white border-slate-100 rounded-xl focus:ring-blue-900" />
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
                                <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input placeholder="admin@estate.com" {...field} className="pl-10 h-12 bg-white border-slate-100 rounded-xl focus:ring-blue-900" />
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
                                    <FormLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Password</FormLabel>
                                    <Link href="/forgot-password" className="text-xs font-bold text-blue-900 hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input type="password" placeholder="••••••••" {...field} className="pl-10 h-12 bg-white border-slate-100 rounded-xl focus:ring-blue-900" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-blue-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
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
                <Link href="/register" className="text-blue-900 font-bold hover:underline">
                    Register New Estate
                </Link>
            </div>
        </div>
    );
}
