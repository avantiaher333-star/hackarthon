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
  Car,
  Bike,
  Bus,
  Activity,
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
        color: 'text-slate-600 bg-slate-100 border-slate-200',
        dot: 'bg-slate-400',
        label: 'Sensors Standing By',
        hint: 'Mount phone on dashboard or bike handlebar for best results.',
      };
    }
    if (motionState.permissionState === 'denied') {
      return {
        badge: 'ACCESS REQUIRED',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Motion Sensor Permission Blocked',
        hint: 'Please enable Device Motion in your browser settings.',
      };
    }
    return {
      badge: 'ACTIVE TELEMETRY',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      dot: 'bg-blue-600 animate-ping',
      label: 'Real-Time Road Bump Analysis',
      hint: 'Analyzing 3-axis accelerometer vibrations at 50Hz.',
    };
  };

  const status = getStatusDisplay();

  return (
    <div className="space-y-6 pb-24 md:pb-10 max-w-7xl mx-auto">
      {/* Hero Drive Telemetry Panel */}
      <section className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm shadow-blue-500/5">
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-1/4 -mt-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider border ${status.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                {status.badge}
              </span>

              {geoState.accuracy && (
                <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  GPS ±{Math.round(geoState.accuracy)}m
                </span>
              )}
            </div>

            <div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] font-display">
                Every Ride Maps <br />
                <span className="text-gradient-blue">
                  City Road Defects.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-xl leading-relaxed font-sans font-normal">
                Smartphone vibration telemetry captures sudden asphalt jolts, geotags dangerous potholes, and triggers priority public-works repairs with AI clustering.
              </p>
            </div>

            {/* Transit Mode Selection */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase font-mono">
                Vehicle Telemetry Mode:
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
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
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-blue-600 text-white border border-blue-600 shadow-md shadow-blue-500/25 font-bold'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:text-blue-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
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
                className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md active:scale-[0.98] ${
                  isMonitoring
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25'
                    : 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-blue-500/30'
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
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-800 transition-all shadow-sm active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Simulate Impact Hit</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Oscilloscope & Telemetry Gauge */}
          <div className="lg:col-span-5 space-y-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2 font-display">
                <Activity className="w-4 h-4 text-blue-600" />
                Real-Time Oscilloscope
              </span>
              <span className="text-[11px] font-mono text-blue-600 font-bold">
                {isMonitoring ? 'LIVE 50Hz' : 'STANDBY'}
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
              <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Current Vibration
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-mono font-extrabold text-slate-900">
                    {isMonitoring ? motionState.magnitude.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">m/s²</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Peak Impact Jolt
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-mono font-extrabold text-blue-700">
                    {motionState.peakJolt.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">m/s²</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  GPS Coordinates
                </span>
                <span className="text-xs font-mono font-semibold text-slate-800 mt-1 block truncate">
                  {geoState.latitude
                    ? formatCoords(geoState.latitude, geoState.longitude || 0)
                    : `${DEFAULT_DEMO_COORDS.lat}, ${DEFAULT_DEMO_COORDS.lon}`}
                </span>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Session Hits
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-mono font-extrabold text-blue-600">
                    {sessionReportsCount}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Overview Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <div className="bg-white border border-slate-200/90 hover:border-blue-300 transition-all p-5 sm:p-6 rounded-3xl space-y-2 shadow-sm hover:shadow-md hover:shadow-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">Total Road Hazards</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono block">
            {stats ? stats.total_reports : reports.length}
          </span>
          <span className="text-[11px] text-slate-500 block font-sans">Geotagged pothole reports</span>
        </div>

        <div className="bg-white border border-slate-200/90 hover:border-amber-300 transition-all p-5 sm:p-6 rounded-3xl space-y-2 shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">DBSCAN Hotspots</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-amber-600 font-mono block">
            {hotspots.length}
          </span>
          <span className="text-[11px] text-slate-500 block font-sans">High-density repair zones</span>
        </div>

        <div className="bg-white border border-slate-200/90 hover:border-blue-300 transition-all p-5 sm:p-6 rounded-3xl space-y-2 shadow-sm hover:shadow-md hover:shadow-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">24-Hour Pulse</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-blue-600 font-mono block">
            {stats ? stats.reports_24h : 0}
          </span>
          <span className="text-[11px] text-slate-500 block font-sans">Fresh telemetry signals</span>
        </div>

        <div className="bg-white border border-slate-200/90 hover:border-emerald-300 transition-all p-5 sm:p-6 rounded-3xl space-y-2 shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">Repairs Resolved</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono block">
            {stats ? stats.resolved_count : 0}
          </span>
          <span className="text-[11px] text-slate-500 block font-sans">Municipal repairs logged</span>
        </div>
      </section>

      {/* Map & Live Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Section */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-sans">
                Civic Road Defect Map
              </h3>
            </div>
            <button
              onClick={onNavigateToMap}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
            >
              Expand Full Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-80 sm:h-96 w-full rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm">
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
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-sans">
                Live Defect Stream
              </h3>
            </div>
            <button
              onClick={onNavigateToHistory}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              Logbook ({reports.length})
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-3.5 space-y-2.5 shadow-sm">
            {recentReports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No incidents reported yet. Tap "Simulate Impact Hit" to test!
              </div>
            ) : (
              recentReports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => onSelectReport(rep)}
                  className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-300 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {rep.id}
                    </span>
                    <StatusBadge status={rep.status} isDemo={rep.is_demo} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>{formatCoords(rep.latitude, rep.longitude)}</span>
                    <SeverityBadge severity={rep.severity_estimate} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60 font-sans">
                    <span>Jolt: <strong className="text-slate-800 font-mono">{rep.sensor_score} m/s²</strong></span>
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
