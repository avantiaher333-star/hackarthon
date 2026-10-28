import React from 'react';
import { ReportStatus, SeverityLevel } from '../types';

interface StatusBadgeProps {
  status: ReportStatus;
  isDemo?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isDemo }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'new':
        return {
          label: 'Suspected Defect',
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          dot: 'bg-rose-500',
        };
      case 'under_review':
        return {
          label: 'Under Review',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          dot: 'bg-amber-500',
        };
      case 'inspection_scheduled':
        return {
          label: 'Inspection Scheduled',
          bg: 'bg-blue-500/15',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          dot: 'bg-blue-400',
        };
      case 'resolved':
        return {
          label: 'Resolved',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          dot: 'bg-emerald-500',
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-700/20',
          border: 'border-slate-600/30',
          text: 'text-slate-300',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
      {isDemo && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-300 uppercase tracking-wider">
          Demo
        </span>
      )}
    </div>
  );
};

export const SeverityBadge: React.FC<{ severity: SeverityLevel }> = ({ severity }) => {
  switch (severity) {
    case 'high':
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wide">
          High Jolt
        </span>
      );
    case 'medium':
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
          Moderate
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-700/40 text-slate-300 border border-slate-600/30 uppercase tracking-wide">
          Mild
        </span>
      );
  }
};

