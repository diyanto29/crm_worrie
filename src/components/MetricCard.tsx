import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

const variants = {
  emerald: {
    border: 'border-slate-200/90 hover:border-emerald-300',
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-50',
  },
  blue: {
    border: 'border-slate-200/90 hover:border-blue-300',
    iconColor: 'text-blue-700',
    iconBg: 'bg-blue-50',
  },
  purple: {
    border: 'border-slate-200/90 hover:border-purple-300',
    iconColor: 'text-purple-700',
    iconBg: 'bg-purple-50',
  },
  amber: {
    border: 'border-slate-200/90 hover:border-amber-300',
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-50',
  },
  rose: {
    border: 'border-slate-200/90 hover:border-rose-300',
    iconColor: 'text-rose-700',
    iconBg: 'bg-rose-50',
  },
};

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'emerald',
  trend,
}: MetricCardProps) {
  const v = variants[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-5 border ${v.border} shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${v.iconBg} ${v.iconColor} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
          {trend && (
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                trend.isPositive !== false
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtext && <span className="text-slate-500 truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
