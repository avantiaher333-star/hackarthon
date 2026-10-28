import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'blue',
  badge,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
          accent: 'text-emerald-700',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border border-rose-200',
          accent: 'text-rose-700',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
          accent: 'text-amber-700',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-50 text-blue-600 border border-blue-200',
          accent: 'text-blue-700',
        };
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-600 border border-slate-200',
          accent: 'text-slate-700',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="bg-white border border-slate-200/90 hover:border-blue-300 transition-all rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:shadow-blue-500/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs sm:text-sm font-semibold text-slate-500">{label}</span>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {value}
          </span>
          {badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              {badge}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtext}</p>
        )}
      </div>
    </div>
  );
};
