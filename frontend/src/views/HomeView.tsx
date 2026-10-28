import React, { useState } from 'react';
import { RoadReport, Hotspot, SystemStats, MotionState, GeolocationState } from '../types';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { MapView } from '../components/MapView';
import { VibrationOscilloscope } from '../components/VibrationOscilloscope';
import { formatCoords, formatTimeAgo, DEFAULT_DEMO_COORDS } from '../utils/geo';
import {
  Play,
  Square,
  Sparkles,
  MapPin,
  Flame,
  CheckCircle2,
  Compass,
  ArrowRight,
  Shield,
  Car,
  Bike,
  Bus,
  Footprints,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface HomeViewProps {
  reports: RoadReport[];
  hotspots: Hotspot[];
  stats: SystemStats | null;
  sessionReportsCount: number;
  motionState: MotionState;
  geoState: GeolocationState;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  onSimulateHit: () => void;
  onNavigateToMap: () => void;
  onNavigateToHistory: () => void;
  onSelectReport: (report: RoadReport) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  reports,
  hotspots,
  stats,
  sessionReportsCount,
  motionState,
  geoState,
  isMonitoring,
  onToggleMonitoring,
  onSimulateHit,
  onNavigateToMap,
  onNavigateToHistory,
  onSelectReport,
}) => {
  const [transitMode, setTransitMode] = useState<'car' | 'bike' | 'bus' | 'walk'>('car');
  const recentReports = reports.slice(0, 5);

  const getStatusDisplay = () => {
    if (!isMonitoring) {
      return {
        badge: 'READY TO SURVEY',
        color: 'text-slate-400 bg-white/5 border-white/10',
        dot: 'bg-slate-500',
        label: 'Sensors Standing By',
        hint: 'Mount phone on dashboard or bike handlebar for best results.',
      };
    }
    if (motionState.permissionState === 'denied') {
      return {
        badge: 'ACCESS REQUIRED',
        color: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
        dot: 'bg-rose-500',
        label: 'Motion Sensor Permission Blocked',
        hint: 'Please enable Device Motion in your browser settings.',
      };
    }
    return {
      badge: 'ACTIVE TELEMETRY',
      color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
      dot: 'bg-emerald-400 animate-ping',
      label: 'Real-Time Road Bump Analysis',
      hint: 'Analyzing 3-axis accelerometer vibrations at 50Hz.',
    };
  };

  const status = getStatusDisplay();

  return (
    <div className="space-y-6 pb-24 md:pb-10 max-w-7xl mx-auto">
      {/* Hero Drive Telemetry Panel */}
      <section className="relative overflow-hidden rounded-3xl glass-panel-elevated p-6 sm:p-8">
        {/* Glow ambient background element */}
        <div className="absolute top-0 right-1/4 -mt-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider border ${status.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.badge}
              </span>

              {geoState.accuracy && (
                <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5">
                  GPS ±{Math.round(geoState.accuracy)}m
                </span>
              )}
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Turn Every Ride Into A <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Road Quality Inspector.
                </span>
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed font-body">
                Phone accelerometer telemetrics instantly detect surface jolts, geotag pothole hazards, and prioritize repair crews through municipal AI clustering.
              </p>
            </div>

            {/* Transit Mode Selection */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                Vehicle Mode:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'car' as const, label: 'Automobile', icon: Car },
                  { id: 'bike' as const, label: 'Motorbike / Scooter', icon: Bike },
                  { id: 'bus' as const, label: 'Transit Bus', icon: Bus },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const active = transitMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setTransitMode(mode.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onToggleMonitoring}
                className={`flex items-center justify-center gap-3 px-7 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl active:scale-[0.98] ${
                  isMonitoring
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-glow-rose'
                    : 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:brightness-110 text-navy-950 font-black shadow-glow-emerald'
                }`}
              >
                {isMonitoring ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Ride Telemetry</span>
                  </>
                )}
              </button>

              <button
                onClick={onSimulateHit}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/35 text-purple-200 hover:text-white transition-all shadow-md active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Simulate Impact Hit</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Oscilloscope & Telemetry Gauge */}
          <div className="lg:col-span-5 space-y-4 bg-navy-950/60 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Vibration Oscilloscope
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                {isMonitoring ? 'LIVE 50Hz' : 'IDLE'}
              </span>
            </div>

            {/* Live Seismograph Waveform */}
            <VibrationOscilloscope
              magnitude={motionState.magnitude}
              isMonitoring={isMonitoring}
              peakJolt={motionState.peakJolt}
            />

            {/* Telemetry Gauge Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Current Magnitude
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-mono font-extrabold text-white">
                    {isMonitoring ? motionState.magnitude.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">m/s²</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Peak Impact Jolt
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-mono font-extrabold text-amber-400">
                    {motionState.peakJolt.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">m/s²</span>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Location Fix
                </span>
                <span className="text-xs font-mono font-semibold text-slate-200 mt-1 block truncate">
                  {geoState.latitude
                    ? formatCoords(geoState.latitude, geoState.longitude || 0)
                    : `${DEFAULT_DEMO_COORDS.lat}, ${DEFAULT_DEMO_COORDS.lon}`}
                </span>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Session Detections
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-mono font-extrabold text-emerald-400">
                    {sessionReportsCount}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Humanized Metrics Overview */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-1 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-body">Surveyed Hazards</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white font-mono block">
            {stats ? stats.total_reports : reports.length}
          </span>
          <span className="text-[11px] text-slate-400 block">Total crowdsourced reports</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-body">DBSCAN Hotspots</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-amber-400 font-mono block">
            {hotspots.length}
          </span>
          <span className="text-[11px] text-slate-400 block">High density repair zones</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-body">24-Hour Pulse</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-emerald-400 font-mono block">
            {stats ? stats.reports_24h : 0}
          </span>
          <span className="text-[11px] text-slate-400 block">Recent road detections</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-1 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-body">Repairs Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white font-mono block">
            {stats ? stats.resolved_count : 0}
          </span>
          <span className="text-[11px] text-slate-400 block">Municipal actions verified</span>
        </div>
      </section>

      {/* Map & Live Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Section */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
                Civic Road Defect Map
              </h3>
            </div>
            <button
              onClick={onNavigateToMap}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Expand Full Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-80 sm:h-96 w-full rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
            <MapView
              reports={reports}
              hotspots={hotspots}
              userLat={geoState.latitude}
              userLon={geoState.longitude}
              onSelectReport={onSelectReport}
            />
          </div>
        </div>

        {/* Live Defect Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-sans">
                Live Defect Stream
              </h3>
            </div>
            <button
              onClick={onNavigateToHistory}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Logbook ({reports.length})
            </button>
          </div>

          <div className="glass-panel rounded-3xl p-3.5 space-y-2.5">
            {recentReports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No incidents reported yet. Tap "Simulate Impact Hit" to test!
              </div>
            ) : (
              recentReports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => onSelectReport(rep)}
                  className="p-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/30 rounded-2xl cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {rep.id}
                    </span>
                    <StatusBadge status={rep.status} isDemo={rep.is_demo} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{formatCoords(rep.latitude, rep.longitude)}</span>
                    <SeverityBadge severity={rep.severity_estimate} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-white/5 font-body">
                    <span>Jolt: <strong className="text-slate-300 font-mono">{rep.sensor_score} m/s²</strong></span>
                    <span>{formatTimeAgo(rep.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
