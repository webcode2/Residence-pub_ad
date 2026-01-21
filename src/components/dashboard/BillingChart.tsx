"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface BillingChartProps {
  data?: { name: string; value: number; color: string }[];
  loading?: boolean;
}

const defaultData = [
  { name: 'Paid', value: 127, color: 'hsl(160, 84%, 39%)' },
  { name: 'Unpaid', value: 34, color: 'hsl(0, 84%, 60%)' },
  { name: 'Pending', value: 18, color: 'hsl(38, 92%, 50%)' },
];

export function BillingChart({ data = defaultData, loading }: BillingChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="stat-card h-80">
        <div className="h-6 w-40 animate-shimmer rounded mb-6" />
        <div className="flex items-center justify-center h-56">
          <div className="w-48 h-48 rounded-full animate-shimmer" />
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="stat-card h-80"
    >
      <h3 className="text-lg font-display font-semibold text-foreground mb-2">
        Billing Status
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {total} total units
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-all duration-200 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '14px',
            }}
            formatter={(value: number, name: string) => [
              `${value} units (${((value / total) * 100).toFixed(1)}%)`,
              name
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
