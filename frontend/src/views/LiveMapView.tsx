import React, { useState, useMemo } from 'react';
import { RoadReport, Hotspot, ReportStatus } from '../types';
import { MapView } from '../components/MapView';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { formatCoords, formatTimeAgo } from '../utils/geo';
import { Filter, Flame, Eye, X, Check, Clock, AlertCircle } from 'lucide-react';

interface LiveMapViewProps {
  reports: RoadReport[];
  hotspots: Hotspot[];
  userLat?: number | null;
  userLon?: number | null;
  selectedReport: RoadReport | null;
  onSelectReport: (report: RoadReport | null) => void;
  onUpdateStatus: (id: string, newStatus: ReportStatus) => Promise<void>;
  onSimulateHit: () => void;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  reports,
  hotspots,
  userLat,
  userLon,
  selectedReport,
  onSelectReport,
  onUpdateStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [demoFilter, setDemoFilter] = useState<'all' | 'real' | 'demo'>('all');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (demoFilter === 'real' && r.is_demo) return false;
      if (demoFilter === 'demo' && !r.is_demo) return false;
      return true;
    });
  }, [reports, statusFilter, demoFilter]);

  const handleStatusChange = async (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedReport.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8 flex flex-col h-[calc(100vh-130px)] min-h-[550px]">
      {/* Top Filter Bar */}
      <div className="bg-navy-850 border border-navy-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mr-2">
            <Filter className="w-4 h-4 text-emerald-400" /> Filters:
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses ({reports.length})</option>
            <option value="new">Suspected Defect (New)</option>
            <option value="under_review">Under Review</option>
            <option value="inspection_scheduled">Inspection Scheduled</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Demo Filter */}
          <select
            value={demoFilter}
            onChange={(e) => setDemoFilter(e.target.value as 'all' | 'real' | 'demo')}
            className="bg-navy-900 border border-navy-700 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Real & Demo</option>
            <option value="real">Real Sensors Only</option>
            <option value="demo">Demo Records Only</option>
          </select>
        </div>

        {/* Hotspots Overlay Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showHotspots
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-navy-900 border-navy-700 text-slate-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Hotspots ({hotspots.length})</span>
          </button>
        </div>
      </div>

      {/* Map & Inspect Container */}
      <div className="relative flex-1 w-full rounded-2xl overflow-hidden border border-navy-800 shadow-xl min-h-[380px]">
        <MapView
          reports={filteredReports}
          hotspots={hotspots}
          userLat={userLat}
          userLon={userLon}
          selectedReport={selectedReport}
          onSelectReport={onSelectReport}
          showHotspots={showHotspots}
          className="w-full h-full"
        />

        {/* Selected Incident Drawer / Card */}
        {selectedReport && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-[1000] bg-navy-900/95 backdrop-blur-md border border-navy-700 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white">
                  {selectedReport.id}
                </span>
                <StatusBadge status={selectedReport.status} isDemo={selectedReport.is_demo} />
              </div>
              <button
                onClick={() => onSelectReport(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Severity</span>
                <SeverityBadge severity={selectedReport.severity_estimate} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Jolt Magnitude</span>
                <span className="font-mono font-bold text-slate-200">
                  {selectedReport.sensor_score} m/s²
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Coordinates</span>
                <span className="font-mono text-slate-200">
                  {formatCoords(selectedReport.latitude, selectedReport.longitude)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Reported</span>
                <span className="text-slate-300">{formatTimeAgo(selectedReport.timestamp)}</span>
              </div>
              {selectedReport.notes && (
                <div className="p-2 rounded-lg bg-navy-950 border border-navy-800 text-[11px] text-slate-300">
                  "{selectedReport.notes}"
                </div>
              )}
            </div>

            {/* Quick Municipal Triage Action */}
            <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Update Status:</span>
              <div className="flex items-center gap-1.5">
                {selectedReport.status !== 'inspection_scheduled' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleStatusChange('inspection_scheduled')}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                  >
                    Schedule
                  </button>
                )}
                {selectedReport.status !== 'resolved' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleStatusChange('resolved')}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

