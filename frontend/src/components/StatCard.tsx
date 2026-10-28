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
  variant = 'emerald',
  badge,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
          accent: 'text-emerald-400',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
          accent: 'text-rose-400',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
          accent: 'text-amber-400',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
          accent: 'text-blue-400',
        };
      default:
        return {
          iconBg: 'bg-slate-700/30 text-slate-300 border border-slate-600/30',
          accent: 'text-slate-200',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="bg-navy-850 border border-navy-800 hover:border-slate-700/80 transition-all rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs sm:text-sm font-medium text-slate-400">{label}</span>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</span>
          {badge && (
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {badge}
            </span>
          )}
        </div>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

