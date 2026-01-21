"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  loading?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, subtitle, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 animate-shimmer rounded" />
          <div className="h-10 w-10 rounded-full animate-shimmer" />
        </div>
        <div className="h-8 w-32 animate-shimmer rounded mb-2" />
        <div className="h-3 w-20 animate-shimmer rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-accent" />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-display font-bold text-foreground">{value}</span>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium pb-1",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}
