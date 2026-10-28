import React, { useState, useMemo } from 'react';
import { RoadReport } from '../types';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { formatCoords, formatTimeAgo } from '../utils/geo';
import { Search, MapPin, Calendar, Radio } from 'lucide-react';

interface HistoryViewProps {
  reports: RoadReport[];
  onSelectReport: (report: RoadReport) => void;
  onNavigateToMap: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  reports,
  onSelectReport,
  onNavigateToMap,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [demoFilter, setDemoFilter] = useState<'all' | 'real' | 'demo'>('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (severityFilter !== 'all' && r.severity_estimate !== severityFilter) return false;
      if (demoFilter === 'real' && r.is_demo) return false;
      if (demoFilter === 'demo' && !r.is_demo) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesId = r.id.toLowerCase().includes(query);
        const matchesNotes = r.notes?.toLowerCase().includes(query) ?? false;
        const matchesSource = r.source.toLowerCase().includes(query);
        if (!matchesId && !matchesNotes && !matchesSource) return false;
      }
      return true;
    });
  }, [reports, statusFilter, severityFilter, demoFilter, searchTerm]);

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Header & Search */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Report History & Audit Log
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Browse, search, and audit crowdsourced road defect reports and telemetry logs.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 self-start sm:self-auto">
            {filteredReports.length} of {reports.length} records
          </span>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">Suspected (New)</option>
            <option value="under_review">Under Review</option>
            <option value="inspection_scheduled">Inspection Scheduled</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Demo Filter */}
          <select
            value={demoFilter}
            onChange={(e) => setDemoFilter(e.target.value as 'all' | 'real' | 'demo')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Real & Demo Records</option>
            <option value="real">Real Only</option>
            <option value="demo">Demo Only</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <Radio className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No reports matched your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or record a simulated pothole hit to generate test telemetry.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white hover:bg-blue-50/30 border border-slate-200/90 hover:border-blue-300 transition-all rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                    {report.id}
                  </span>
                  <StatusBadge status={report.status} isDemo={report.is_demo} />
                  <SeverityBadge severity={report.severity_estimate} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-mono text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {formatCoords(report.latitude, report.longitude)}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatTimeAgo(report.timestamp)} ({new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </span>
                  <span className="font-semibold text-slate-800 font-mono">
                    Impact: {report.sensor_score} m/s²
                  </span>
                  {report.gps_accuracy && (
                    <span className="text-slate-500">GPS Acc: ±{Math.round(report.gps_accuracy)}m</span>
                  )}
                </div>

                {report.notes && (
                  <p className="text-xs text-blue-900 italic bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                    "{report.notes}"
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => {
                    onSelectReport(report);
                    onNavigateToMap();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition-all active:scale-95 shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>View on Map</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
