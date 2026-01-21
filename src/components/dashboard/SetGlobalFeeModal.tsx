"use client";

import { useState } from 'react';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEstate } from '@/contexts/EstateContext';
import { cn } from '@/lib/utils';

const FeeSchema = z.object({
  fee: z.number().min(0, 'Fee must be positive').max(10000000, 'Fee too high'),
  confirmFee: z.number(),
}).refine((data) => data.fee === data.confirmFee, {
  message: "Fees must match",
  path: ["confirmFee"],
});

interface SetGlobalFeeModalProps {
  open: boolean;
  onClose: () => void;
}

export function SetGlobalFeeModal({ open, onClose }: SetGlobalFeeModalProps) {
  const { estate, setGlobalFee } = useEstate();
  const [fee, setFee] = useState('');
  const [confirmFee, setConfirmFee] = useState('');
  const [errors, setErrors] = useState<{ fee?: string; confirmFee?: string }>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const feeNum = parseFloat(fee) || 0;
    const confirmNum = parseFloat(confirmFee) || 0;

    const result = FeeSchema.safeParse({ fee: feeNum, confirmFee: confirmNum });

    if (!result.success) {
      const fieldErrors: { fee?: string; confirmFee?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'fee') fieldErrors.fee = issue.message;
        if (issue.path[0] === 'confirmFee') fieldErrors.confirmFee = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setGlobalFee(feeNum);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setFee('');
      setConfirmFee('');
      onClose();
    }, 1500);
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/,/g, '')) || 0;
    return new Intl.NumberFormat('en-NG').format(num);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">
                    Set Global Fee
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will apply to all units in {estate.estateName}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Current Fee Display */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Current Fee</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    ₦{new Intl.NumberFormat('en-NG').format(estate.globalFee)}
                  </p>
                </div>

                {/* Fee Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Monthly Fee
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₦
                    </div>
                    <input
                      type="text"
                      value={fee}
                      onChange={(e) => setFee(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="50,000"
                      className={cn(
                        "w-full pl-8 pr-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all",
                        errors.fee ? "border-destructive" : "border-input"
                      )}
                    />
                  </div>
                  {errors.fee && (
                    <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.fee}
                    </p>
                  )}
                </div>

                {/* Confirm Fee Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm New Fee
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₦
                    </div>
                    <input
                      type="text"
                      value={confirmFee}
                      onChange={(e) => setConfirmFee(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="50,000"
                      className={cn(
                        "w-full pl-8 pr-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all",
                        errors.confirmFee ? "border-destructive" : "border-input"
                      )}
                    />
                  </div>
                  {errors.confirmFee && (
                    <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.confirmFee}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant={success ? "success" : "hero"}
                  size="lg"
                  className="w-full"
                  disabled={success}
                >
                  {success ? (
                    <>
                      <Check className="h-5 w-5" />
                      Fee Updated!
                    </>
                  ) : (
                    'Update Global Fee'
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
