import React, { useState, useMemo } from 'react';
import { RoadReport, Hotspot, ReportStatus } from '../types';
import { MapView } from '../components/MapView';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { formatCoords, formatTimeAgo } from '../utils/geo';
import { Filter, Flame, X } from 'lucide-react';

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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-2">
            <Filter className="w-4 h-4 text-blue-600" /> Filters:
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
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
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              showHotspots
                ? 'bg-amber-50 border-amber-200 text-amber-800 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Hotspots ({hotspots.length})</span>
          </button>
        </div>
      </div>

      {/* Map & Inspect Container */}
      <div className="relative flex-1 w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm min-h-[380px]">
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
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xl shadow-blue-500/10 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-700">
                  {selectedReport.id}
                </span>
                <StatusBadge status={selectedReport.status} isDemo={selectedReport.is_demo} />
              </div>
              <button
                onClick={() => onSelectReport(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Severity</span>
                <SeverityBadge severity={selectedReport.severity_estimate} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Jolt Magnitude</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedReport.sensor_score} m/s²
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Coordinates</span>
                <span className="font-mono text-slate-800">
                  {formatCoords(selectedReport.latitude, selectedReport.longitude)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Reported</span>
                <span className="text-slate-700">{formatTimeAgo(selectedReport.timestamp)}</span>
              </div>
              {selectedReport.notes && (
                <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 italic">
                  "{selectedReport.notes}"
                </div>
              )}
            </div>

            {/* Quick Municipal Triage Action */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Update Status:</span>
              <div className="flex items-center gap-1.5">
                {selectedReport.status !== 'inspection_scheduled' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleStatusChange('inspection_scheduled')}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all shadow-xs"
                  >
                    Schedule
                  </button>
                )}
                {selectedReport.status !== 'resolved' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleStatusChange('resolved')}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-xs"
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
