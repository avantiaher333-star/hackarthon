import React, { useState } from 'react';
import { MotionState, GeolocationState } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Sliders,
  Trash2,
  Cpu,
  Compass,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Smartphone,
  Wifi,
} from 'lucide-react';

interface SettingsViewProps {
  motionState: MotionState;
  geoState: GeolocationState;
  threshold: number;
  onThresholdChange: (value: number) => void;
  cooldownMs: number;
  onCooldownChange: (value: number) => void;
  onClearDemoData: () => Promise<void>;
  demoCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  motionState,
  geoState,
  threshold,
  onThresholdChange,
  cooldownMs,
  onCooldownChange,
  onClearDemoData,
  demoCount,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmClear = async () => {
    setIsDeleting(true);
    try {
      await onClearDemoData();
      setIsConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="bg-navy-850 border border-navy-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Settings & Hardware Calibration
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Fine-tune accelerometer bump detection sensitivity, view browser security context, and manage test data.
        </p>
      </div>

      {/* Sensor Calibration Settings */}
      <div className="bg-navy-850 border border-navy-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" /> Sensor Trigger Calibration
        </h3>

        {/* Jolt Threshold Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200">
              Jolt Detection Threshold
            </span>
            <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              {threshold.toFixed(1)} m/s²
            </span>
          </div>
          <input
            type="range"
            min="12.0"
            max="35.0"
            step="0.5"
            value={threshold}
            onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>High Sensitivity (12 m/s²)</span>
            <span>Recommended (19.5 m/s²)</span>
            <span>Severe Impacts Only (35 m/s²)</span>
          </div>
        </div>

        {/* Cooldown Duration */}
        <div className="space-y-2 pt-3 border-t border-navy-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200">
              Trigger Cooldown Interval
            </span>
            <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              {(cooldownMs / 1000).toFixed(1)} seconds
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="8000"
            step="500"
            value={cooldownMs}
            onChange={(e) => onCooldownChange(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Prevents multiple duplicate reports being registered for a single pothole or speed bump.
          </p>
        </div>
      </div>

      {/* Hardware Diagnostics */}
      <div className="bg-navy-850 border border-navy-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400" /> Device Hardware & Security Diagnostics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Security Context */}
          <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
            <span className="text-slate-400 block">Browser Context</span>
            <div className="flex items-center gap-1.5 font-bold">
              {isSecureContext ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Secure (HTTPS / Localhost)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Insecure HTTP Context</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Required for DeviceMotion & Geolocation APIs
            </p>
          </div>

          {/* Accelerometer Hardware */}
          <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
            <span className="text-slate-400 block">Motion Accelerometer</span>
            <div className="flex items-center gap-1.5 font-bold">
              {motionState.isSupported ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Sensor Supported</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Sensor Unavailable</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Permission: {motionState.permissionState}
            </p>
          </div>

          {/* GPS Hardware */}
          <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
            <span className="text-slate-400 block">GPS Geolocation</span>
            <div className="flex items-center gap-1.5 font-bold">
              {geoState.status === 'granted' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Fix Acquired</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 capitalize">{geoState.status}</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Accuracy: {geoState.accuracy ? `±${Math.round(geoState.accuracy)}m` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Mobile testing note */}
        <div className="p-3.5 rounded-xl bg-navy-900/60 border border-navy-800 text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-emerald-400" />
            Testing on Smartphone on Same Local Wi-Fi:
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Both the Vite frontend and FastAPI backend bind to <code>0.0.0.0</code>. Access via your computer's local IP (e.g. <code>http://192.168.1.X:5173</code>). Modern iOS and Android browsers require either <strong>localhost</strong> or <strong>HTTPS</strong> to grant live accelerometer and GPS permissions. When testing over HTTP without SSL certificates, use the built-in <strong>Simulate Pothole Hit</strong> button to test all end-to-end flows.
          </p>
        </div>
      </div>

      {/* Manage Demonstration Data */}
      <div className="bg-navy-850 border border-navy-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400" /> Demonstration Data Management
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Clear out all synthetic demo incidents generated during demonstration runs. Real sensor telemetry records are permanently preserved and will not be touched.
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs">
            <span className="text-slate-400">Active Demo Records: </span>
            <strong className="text-purple-300 font-mono">{demoCount}</strong>
          </div>

          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={demoCount === 0 || isDeleting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Demo Records</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Purge Demo Telemetry?"
        message={`Are you sure you want to delete all ${demoCount} demo reports? This action cannot be undone. All genuine sensor reports will remain untouched.`}
        confirmLabel="Purge Demo Records"
        isDestructive={true}
        onConfirm={handleConfirmClear}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

