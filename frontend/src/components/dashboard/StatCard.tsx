'use client';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'brand' | 'success' | 'warning' | 'danger';
  trend?: number;
}

const colorMap = {
  brand:   { bg: 'bg-brand-50',   icon: 'text-brand-500',   border: 'border-brand-100' },
  success: { bg: 'bg-success-100', icon: 'text-success-600', border: 'border-green-100' },
  warning: { bg: 'bg-warning-100', icon: 'text-warning-600', border: 'border-yellow-100' },
  danger:  { bg: 'bg-danger-100',  icon: 'text-danger-600',  border: 'border-red-100' },
};

export function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend !== undefined && (
            <div className={clsx('flex items-center gap-1 text-xs mt-2', trend >= 0 ? 'text-success-600' : 'text-danger-600')}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', c.bg)}>
          <Icon className={clsx('w-5 h-5', c.icon)} />
        </div>
      </div>
    </div>
  );
}
