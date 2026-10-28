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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <Sliders className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Settings & Hardware Calibration
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Fine-tune accelerometer bump detection sensitivity, view browser security context, and manage test data.
        </p>
      </div>

      {/* Sensor Calibration Settings */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-600" /> Sensor Trigger Calibration
        </h3>

        {/* Jolt Threshold Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">
              Jolt Detection Threshold
            </span>
            <span className="font-mono font-bold text-blue-700 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
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
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>High Sensitivity (12 m/s²)</span>
            <span>Recommended (19.5 m/s²)</span>
            <span>Severe Impacts Only (35 m/s²)</span>
          </div>
        </div>

        {/* Cooldown Duration */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">
              Trigger Cooldown Interval
            </span>
            <span className="font-mono font-bold text-blue-700 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
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
            className="w-full accent-blue-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Prevents multiple duplicate reports being registered for a single pothole or speed bump.
          </p>
        </div>
      </div>

      {/* Hardware Diagnostics */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-600" /> Device Hardware & Security Diagnostics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Security Context */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block">Browser Context</span>
            <div className="flex items-center gap-1.5 font-bold">
              {isSecureContext ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Secure (HTTPS / Localhost)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700">Insecure HTTP Context</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Required for DeviceMotion & Geolocation APIs
            </p>
          </div>

          {/* Accelerometer Hardware */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block">Motion Accelerometer</span>
            <div className="flex items-center gap-1.5 font-bold">
              {motionState.isSupported ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Sensor Supported</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700">Sensor Unavailable</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Permission: {motionState.permissionState}
            </p>
          </div>

          {/* GPS Hardware */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 font-semibold block">GPS Geolocation</span>
            <div className="flex items-center gap-1.5 font-bold">
              {geoState.status === 'granted' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Fix Acquired</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 capitalize">{geoState.status}</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Accuracy: {geoState.accuracy ? `±${Math.round(geoState.accuracy)}m` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Mobile testing note */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-blue-900 flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-blue-600" />
            Testing on Smartphone on Same Local Wi-Fi:
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Both the Vite frontend and FastAPI backend bind to <code>0.0.0.0</code>. Access via your computer's local IP (e.g. <code>http://192.168.1.X:5173</code>). Modern iOS and Android browsers require either <strong>localhost</strong> or <strong>HTTPS</strong> to grant live accelerometer and GPS permissions. When testing over HTTP without SSL certificates, use the built-in <strong>Simulate Pothole Hit</strong> button to test all end-to-end flows.
          </p>
        </div>
      </div>

      {/* Manage Demonstration Data */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" /> Demonstration Data Management
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Clear out all synthetic demo incidents generated during demonstration runs. Real sensor telemetry records are permanently preserved and will not be touched.
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs">
            <span className="text-slate-500 font-semibold">Active Demo Records: </span>
            <strong className="text-purple-700 font-mono font-bold">{demoCount}</strong>
          </div>

          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={demoCount === 0 || isDeleting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
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
