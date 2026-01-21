"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { verify2FAAction } from "@/actions/auth";
import { toast } from "sonner";
import { Brand } from "@/components/shared/Brand";
import { motion } from "framer-motion";

const OtpSchema = z.object({
    pin: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
});

export default function TwoFactorPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof OtpSchema>>({
        resolver: zodResolver(OtpSchema),
        defaultValues: {
            pin: "",
        },
    });

    async function onSubmit(data: z.infer<typeof OtpSchema>) {
        setIsLoading(true);
        try {
            const result = await verify2FAAction(data.pin);
            if (result.success) {
                toast.success("Verification successful!");
                router.push("/dashboard");
            } else {
                toast.error("Invalid verification code. Please try again.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 rounded-2xl bg-primary/10 mb-2">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Two-Step Verification</h1>
                    <p className="text-muted-foreground max-w-[300px]">
                        Please enter the 6-digit code sent to your registered device.
                    </p>
                </div>

                <div className="bg-card border rounded-3xl p-8 shadow-sm">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center justify-center space-y-4">
                                        <FormControl>
                                            <InputOTP
                                                maxLength={6}
                                                {...field}
                                                className="gap-2"
                                            >
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} className="w-12 h-14 text-lg" />
                                                    <InputOTPSlot index={1} className="w-12 h-14 text-lg" />
                                                    <InputOTPSlot index={2} className="w-12 h-14 text-lg" />
                                                    <InputOTPSlot index={3} className="w-12 h-14 text-lg" />
                                                    <InputOTPSlot index={4} className="w-12 h-14 text-lg" />
                                                    <InputOTPSlot index={5} className="w-12 h-14 text-lg" />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify Code
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-8 pt-6 border-t text-center">
                        <p className="text-sm text-muted-foreground">
                            Didn't receive a code?{" "}
                            <button className="text-primary font-semibold hover:underline">
                                Resend code
                            </button>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                    <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                        Make sure to check your authentication app or registered email.
                    </p>
                </div>

                <div className="flex justify-center">
                    <Brand size="sm" variant="default" />
                </div>
            </motion.div>
        </div>
    );
}
