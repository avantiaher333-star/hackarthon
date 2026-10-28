import React from 'react';
import { RoadReport, Hotspot, SystemStats, MotionState, GeolocationState } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { MapView } from '../components/MapView';
import { formatCoords, formatTimeAgo, DEFAULT_DEMO_COORDS } from '../utils/geo';
import {
  Play,
  Square,
  Sparkles,
  MapPin,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Compass,
  ArrowRight,
  Info,
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
  const recentReports = reports.slice(0, 4);

  // Compute status banner state
  const getSensorStatusBadge = () => {
    if (!isMonitoring) {
      return {
        label: 'Inactive',
        desc: 'Monitoring is paused. Tap Start Monitoring to begin telemetry.',
        color: 'text-slate-400 bg-slate-800/60 border-slate-700/60',
      };
    }
    if (motionState.permissionState === 'denied') {
      return {
        label: 'Sensor Permission Denied',
        desc: 'Motion access was denied. Please allow motion sensors in browser settings.',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      };
    }
    if (!motionState.isSupported) {
      return {
        label: 'Sensor Unavailable',
        desc: 'Physical accelerometer not supported on this device. Use Simulate Pothole Hit to test.',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      };
    }
    return {
      label: 'Actively Monitoring',
      desc: 'Detecting vehicle vibrations & road jolts in real-time.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    };
  };

  const getGpsStatusBadge = () => {
    if (!isMonitoring) return { text: 'GPS Standby', color: 'text-slate-400' };
    if (geoState.status === 'granted') {
      return {
        text: `GPS Active (±${Math.round(geoState.accuracy || 0)}m)`,
        color: 'text-emerald-400',
      };
    }
    if (geoState.status === 'denied') return { text: 'GPS Denied', color: 'text-rose-400' };
    if (geoState.status === 'prompt') return { text: 'Requesting GPS...', color: 'text-amber-400' };
    return { text: 'GPS Unavailable', color: 'text-amber-400' };
  };

  const sensorStatus = getSensorStatusBadge();
  const gpsStatus = getGpsStatusBadge();

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Hero Telemetry Card */}
      <section className="bg-gradient-to-b from-navy-850 to-navy-900 border border-navy-800 rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Glow ambient background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-navy-700 bg-navy-950/70">
              <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="text-slate-300">{sensorStatus.label}</span>
              <span className="text-slate-500">|</span>
              <span className={gpsStatus.color}>{gpsStatus.text}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Road Telemetry Monitor
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Drive or ride normally. RoadSense AI analyzes device motion spikes to identify suspected road defects and geotags potholes for municipal repair.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onToggleMonitoring}
              className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95 min-h-[48px] ${
                isMonitoring
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-black shadow-emerald-500/25'
              }`}
            >
              {isMonitoring ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Monitoring</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Monitoring</span>
                </>
              )}
            </button>

            <button
              onClick={onSimulateHit}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 transition-all shadow-md active:scale-95 min-h-[48px]"
              title="Simulates an immediate pothole impact for testing without driving"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Simulate Pothole Hit</span>
            </button>
          </div>
        </div>

        {/* Live Sensor Metrics Bar */}
        <div className="mt-6 pt-5 border-t border-navy-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
            <span className="text-slate-400 block mb-1">Live Motion</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white font-mono">
                {isMonitoring ? motionState.magnitude.toFixed(1) : '0.0'}
              </span>
              <span className="text-[10px] text-slate-400">m/s²</span>
            </div>
          </div>

          <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
            <span className="text-slate-400 block mb-1">Peak Session Jolt</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-amber-400 font-mono">
                {motionState.peakJolt.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">m/s²</span>
            </div>
          </div>

          <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
            <span className="text-slate-400 block mb-1">Current Coordinates</span>
            <span className="text-xs font-mono font-medium text-slate-200 block truncate">
              {geoState.latitude && geoState.longitude
                ? formatCoords(geoState.latitude, geoState.longitude)
                : `${DEFAULT_DEMO_COORDS.lat}, ${DEFAULT_DEMO_COORDS.lon}`}
            </span>
          </div>

          <div className="bg-navy-950/60 p-3 rounded-xl border border-navy-800">
            <span className="text-slate-400 block mb-1">Session Detections</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {sessionReportsCount}
              </span>
              <span className="text-[10px] text-slate-400">events</span>
            </div>
          </div>
        </div>

        {/* Transparent sensor disclosure */}
        <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-400 bg-navy-900/60 p-2.5 rounded-xl border border-navy-800/60">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Telemetry Notice:</strong> Sudden vibrations are recorded as <em>suspected defects</em>. Hotspots require multiple independent detections. Background monitoring is constrained by browser security while screen is locked.
          </span>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Road Reports"
          value={stats ? stats.total_reports : reports.length}
          subtext="Crowdsourced incidents"
          icon={Radio}
          variant="blue"
        />
        <StatCard
          label="Last 24 Hours"
          value={stats ? stats.reports_24h : 0}
          subtext="Recent detections"
          icon={Compass}
          variant="emerald"
        />
        <StatCard
          label="DBSCAN Hotspots"
          value={hotspots.length}
          subtext="Clusters requiring review"
          icon={Flame}
          variant="amber"
          badge="AI Cluster"
        />
        <StatCard
          label="Repairs Resolved"
          value={stats ? stats.resolved_count : 0}
          subtext="Municipal work completed"
          icon={CheckCircle2}
          variant="emerald"
        />
      </section>

      {/* Live Map Preview & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Geotagged Defect Map
              </h3>
            </div>
            <button
              onClick={onNavigateToMap}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              Open Full Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 sm:h-80 w-full rounded-2xl overflow-hidden shadow-lg border border-navy-800">
            <MapView
              reports={reports}
              hotspots={hotspots}
              userLat={geoState.latitude}
              userLon={geoState.longitude}
              onSelectReport={onSelectReport}
            />
          </div>
        </div>

        {/* Recent Reports List (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Telemetry
              </h3>
            </div>
            <button
              onClick={onNavigateToHistory}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              View All ({reports.length})
            </button>
          </div>

          <div className="bg-navy-850 border border-navy-800 rounded-2xl p-3 space-y-2.5">
            {recentReports.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No telemetry recorded yet. Tap "Simulate Pothole Hit" to test!
              </div>
            ) : (
              recentReports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => onSelectReport(rep)}
                  className="p-3 bg-navy-900/80 hover:bg-navy-900 border border-navy-800/80 hover:border-slate-700 rounded-xl cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">{rep.id}</span>
                    <StatusBadge status={rep.status} isDemo={rep.is_demo} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{formatCoords(rep.latitude, rep.longitude)}</span>
                    <SeverityBadge severity={rep.severity_estimate} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-navy-800/60">
                    <span>Impact: {rep.sensor_score} m/s²</span>
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

