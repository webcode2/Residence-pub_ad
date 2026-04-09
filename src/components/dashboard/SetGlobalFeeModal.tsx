"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Banknote, Loader2, Plus, Trash2, Pencil, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFeeConfigs, useCreateFeeConfig, useDeleteFeeConfig, useUpdateFeeConfig } from '@/hooks/use-billings';
import { useEstate } from '@/contexts/EstateContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SetGlobalFeeModalProps {
  open: boolean;
  onClose: () => void;
}

export function SetGlobalFeeModal({ open, onClose }: SetGlobalFeeModalProps) {
  const { estate } = useEstate();
  const { data: feeConfigs = [], isLoading } = useFeeConfigs(estate.appId);
  const createFeeMutation = useCreateFeeConfig();
  const deleteFeeMutation = useDeleteFeeConfig();
  const updateFeeMutation = useUpdateFeeConfig();

  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    try {
      console.log("[SetGlobalFeeModal] Submitting form data:", { editingFeeId, ...formData });
      if (editingFeeId) {
        await updateFeeMutation.mutateAsync({
          id: editingFeeId,
          appId: estate.appId,
          data: {
            name: formData.name,
            amount: parseFloat(formData.amount),
            description: formData.description
          }
        });
        toast.success("Fee configuration updated");
        setEditingFeeId(null);
      } else {
        const payload = {
          name: formData.name,
          amount: parseFloat(formData.amount),
          description: formData.description,
          app_id: estate.appId,
          is_global: true,
          is_recurring: true,
          frequency: 'monthly'
        };
        console.log("[SetGlobalFeeModal] Creating fee with payload:", payload);
        await createFeeMutation.mutateAsync(payload);
        toast.success("Fee configuration added");
      }
      setFormData({ name: '', amount: '', description: '' });
    } catch (error: any) {
      console.error("[SetGlobalFeeModal] Action failed:", error);
      if (error.response) {
        console.error("[SetGlobalFeeModal] Error response:", error.response.data);
      } else if (error.request) {
        console.error("[SetGlobalFeeModal] No response received:", error.request);
      } else {
        console.error("[SetGlobalFeeModal] Request setup error:", error.message);
      }
      toast.error(error.response?.data?.detail || "Action failed. Check console for details.");
    }
  };

  const startEdit = (fee: any) => {
    setEditingFeeId(fee.id);
    setFormData({
      name: fee.name,
      amount: fee.amount.toString(),
      description: fee.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingFeeId(null);
    setFormData({ name: '', amount: '', description: '' });
  };

  const handleDeleteFee = async (id: string) => {
    try {
      await deleteFeeMutation.mutateAsync({ id, appId: estate.appId });
      toast.success("Fee configuration removed");
    } catch (error) {
      toast.error("Failed to remove fee");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] z-10"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-foreground">
                      Estate Fee Management
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure monthly charges for all landlords
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Current Fees List */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Global Fees
                </h4>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : feeConfigs.length > 0 ? (
                  <div className="space-y-3">
                    {feeConfigs.filter((f: any) => f.is_global).map((fee: any) => (
                      <div
                        key={fee.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl transition-all border group",
                          editingFeeId === fee.id
                            ? "bg-accent/10 border-accent"
                            : "bg-secondary/30 border-border"
                        )}
                      >
                        <div>
                          <p className="font-semibold text-foreground">{fee.name}</p>
                          <p className="text-sm text-muted-foreground">₦{fee.amount.toLocaleString()} / month</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(fee)}
                            className={cn(
                              "transition-opacity",
                              editingFeeId === fee.id ? "text-accent" : "opacity-0 group-hover:opacity-100 text-muted-foreground"
                            )}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFee(fee.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl border border-dashed border-border bg-secondary/10">
                    <p className="text-muted-foreground text-sm">No global fees configured yet.</p>
                  </div>
                )}
              </div>

              {/* Add/Edit Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {editingFeeId ? 'Edit Fee' : 'Add New Fee'}
                  </h4>
                  {editingFeeId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="text-xs h-7 gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fee-name">Fee Name</Label>
                    <Input
                      id="fee-name"
                      placeholder="e.g. Security Fee"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee-amount">Amount (₦)</Label>
                    <Input
                      id="fee-amount"
                      type="number"
                      placeholder="0.00"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-desc">Description (Optional)</Label>
                  <Input
                    id="fee-desc"
                    placeholder="Brief detail about the fee"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  variant={editingFeeId ? "outline" : "hero"}
                  className={cn("w-full transition-all", editingFeeId && "border-accent text-accent hover:bg-accent/5")}
                  disabled={createFeeMutation.isPending || updateFeeMutation.isPending}
                >
                  {createFeeMutation.isPending || updateFeeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingFeeId ? (
                    <>
                      <Pencil className="h-4 w-4 mr-2" />
                      Update Fee Configuration
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Global Fee
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="p-6 border-t border-border bg-secondary/10 rounded-b-2xl">
              <Button
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                Close Manager
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
