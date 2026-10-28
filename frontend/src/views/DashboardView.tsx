import React, { useState } from 'react';
import { RoadReport, Hotspot, SystemStats, ReportStatus } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { formatCoords, formatTimeAgo } from '../utils/geo';
import {
  ShieldCheck,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  RefreshCw,
  MapPin,
} from 'lucide-react';

interface DashboardViewProps {
  reports: RoadReport[];
  hotspots: Hotspot[];
  stats: SystemStats | null;
  onUpdateStatus: (id: string, newStatus: ReportStatus) => Promise<void>;
  onRefresh: () => void;
  onSelectReport: (report: RoadReport) => void;
  onNavigateToMap: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  hotspots,
  stats,
  onUpdateStatus,
  onRefresh,
  onSelectReport,
  onNavigateToMap,
}) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: ReportStatus) => {
    setUpdatingId(id);
    try {
      await onUpdateStatus(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  // Status breakdown calculations
  const total = stats?.total_reports || reports.length || 1;
  const newCount = stats?.status_counts?.['new'] || 0;
  const underReviewCount = stats?.status_counts?.['under_review'] || 0;
  const scheduledCount = stats?.status_counts?.['inspection_scheduled'] || 0;
  const resolvedCount = stats?.status_counts?.['resolved'] || 0;

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Dashboard Top Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Municipal Road Maintenance Ops
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Prioritize road inspections using AI DBSCAN clustering. Transition detected incidents from suspected jolts into scheduled repairs and verified resolutions.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all self-start md:self-center active:scale-95 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="Total Crowdsourced"
          value={stats?.total_reports ?? reports.length}
          subtext="Sensor & demo reports"
          icon={Radio}
          variant="blue"
        />
        <StatCard
          label="Last 24 Hours"
          value={stats?.reports_24h ?? 0}
          subtext="Recent road defects"
          icon={Clock}
          variant="slate"
        />
        <StatCard
          label="High Priority Defects"
          value={stats?.high_priority_count ?? 0}
          subtext="Unresolved severe jolts"
          icon={AlertTriangle}
          variant="rose"
        />
        <StatCard
          label="Active Hotspots"
          value={hotspots.length}
          subtext="DBSCAN road clusters"
          icon={Flame}
          variant="amber"
          badge="DBSCAN"
        />
        <StatCard
          label="Resolved Repairs"
          value={stats?.resolved_count ?? 0}
          subtext="Asphalt patches complete"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Status Distribution Progress Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider">
            Incident Resolution Lifecycle
          </span>
          <span className="text-slate-500 font-medium">Total: {total}</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(newCount / total) * 100}%` }}
            className="bg-rose-500 transition-all"
            title={`Suspected (New): ${newCount}`}
          />
          <div
            style={{ width: `${(underReviewCount / total) * 100}%` }}
            className="bg-amber-500 transition-all"
            title={`Under Review: ${underReviewCount}`}
          />
          <div
            style={{ width: `${(scheduledCount / total) * 100}%` }}
            className="bg-blue-600 transition-all"
            title={`Inspection Scheduled: ${scheduledCount}`}
          />
          <div
            style={{ width: `${(resolvedCount / total) * 100}%` }}
            className="bg-emerald-500 transition-all"
            title={`Resolved: ${resolvedCount}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-500 font-medium">Suspected:</span>
            <strong className="text-slate-800">{newCount}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-500 font-medium">Under Review:</span>
            <strong className="text-slate-800">{underReviewCount}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-500 font-medium">Scheduled:</span>
            <strong className="text-slate-800">{scheduledCount}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500 font-medium">Resolved:</span>
            <strong className="text-slate-800">{resolvedCount}</strong>
          </div>
        </div>
      </div>

      {/* DBSCAN Hotspots Prioritized Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Priority Hotspot Clusters (DBSCAN)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {hotspots.length} clusters identified within 65m radius
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotspots.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-slate-500 text-xs">
              No clustered hotspots identified yet. Trigger multiple simulated hits near the same location to form a cluster.
            </div>
          ) : (
            hotspots.map((hs, index) => (
              <div
                key={hs.id}
                className="bg-white border border-slate-200/90 hover:border-amber-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" /> Hotspot #{index + 1}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {hs.report_count} Reports
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Center:</span>
                      <span className="font-mono text-slate-800">
                        {formatCoords(hs.center_latitude, hs.center_longitude)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cluster Radius:</span>
                      <span className="text-slate-800 font-medium">~{Math.round(hs.radius_meters)} meters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Jolt Severity:</span>
                      <SeverityBadge severity={hs.severity_estimate} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {hs.status_summary['resolved'] || 0} resolved of {hs.report_count}
                  </span>
                  <button
                    onClick={() => {
                      const firstRep = reports.find((r) => hs.report_ids.includes(r.id));
                      if (firstRep) onSelectReport(firstRep);
                      onNavigateToMap();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    View on Map <MapPin className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Incident Triage Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Incident Triage & Status Transitions
            </h3>
            <p className="text-xs text-slate-500">
              Update defect lifecycle directly with immediate SQLite persistence.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-3">Report ID</th>
                <th className="py-3 px-3">Coordinates</th>
                <th className="py-3 px-3">Impact</th>
                <th className="py-3 px-3">Current Status</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3 text-right">Transition Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {reports.slice(0, 8).map((rep) => (
                <tr key={rep.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">
                    {rep.id}
                    {rep.is_demo && (
                      <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        DEMO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {formatCoords(rep.latitude, rep.longitude)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 font-mono">{rep.sensor_score} m/s²</span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={rep.status} />
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {formatTimeAgo(rep.timestamp)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={rep.status}
                      disabled={updatingId === rep.id}
                      onChange={(e) => handleStatusChange(rep.id, e.target.value as ReportStatus)}
                      className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
                    >
                      <option value="new">Suspected (New)</option>
                      <option value="under_review">Under Review</option>
                      <option value="inspection_scheduled">Inspection Scheduled</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
