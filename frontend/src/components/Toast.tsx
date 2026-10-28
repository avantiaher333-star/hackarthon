import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => {
        const getStyles = () => {
          switch (toast.type) {
            case 'success':
              return {
                border: 'border-emerald-200',
                iconColor: 'text-emerald-600',
                icon: CheckCircle,
              };
            case 'warning':
              return {
                border: 'border-amber-200',
                iconColor: 'text-amber-600',
                icon: AlertCircle,
              };
            case 'error':
              return {
                border: 'border-rose-200',
                iconColor: 'text-rose-600',
                icon: AlertCircle,
              };
            default:
              return {
                border: 'border-blue-200',
                iconColor: 'text-blue-600',
                icon: Info,
              };
          }
        };

        const { border, iconColor, icon: Icon } = getStyles();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border ${border} shadow-lg shadow-blue-500/10 backdrop-blur-md transition-all animate-in slide-in-from-top-2`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900">{toast.title}</h4>
              {toast.message && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
