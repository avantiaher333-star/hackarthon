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
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          dot: 'bg-rose-500',
        };
      case 'under_review':
        return {
          label: 'Under Review',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          dot: 'bg-amber-500',
        };
      case 'inspection_scheduled':
        return {
          label: 'Inspection Scheduled',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          dot: 'bg-blue-600',
        };
      case 'resolved':
        return {
          label: 'Resolved',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          dot: 'bg-emerald-600',
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          text: 'text-slate-700',
          dot: 'bg-slate-500',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.border} ${config.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
      {isDemo && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 border border-purple-200 text-purple-700 uppercase tracking-wider">
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
        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wide">
          High Jolt
        </span>
      );
    case 'medium':
      return (
        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
          Moderate
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
          Mild
        </span>
      );
  }
};
