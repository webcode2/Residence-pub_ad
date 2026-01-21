import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'text' | 'card';
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  const baseClasses = "animate-shimmer rounded";
  
  const variantClasses = {
    default: "h-4 w-full",
    circular: "h-10 w-10 rounded-full",
    text: "h-3 w-3/4",
    card: "h-32 w-full rounded-xl",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton variant="circular" className="h-8 w-8" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton variant="text" className="w-20" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4" />
        </td>
      ))}
    </tr>
  );
}

export function ChartSkeleton() {
  return (
    <div className="stat-card h-80">
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="flex items-center justify-center h-56">
        <Skeleton variant="circular" className="h-48 w-48" />
      </div>
    </div>
  );
}
