import { RoadReport, Hotspot, SystemStats, ReportStatus, SeverityLevel } from '../types';

// Production: same-origin API (served from FastAPI on same port)
// Development: proxied via Vite config
const API_BASE = '/api';

export interface ReportFilterParams {
  is_demo?: boolean;
  status?: string;
  severity?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateReportPayload {
  latitude: number;
  longitude: number;
  sensor_score: number;
  gps_accuracy?: number | null;
  source: string;
  is_demo?: boolean;
  notes?: string | null;
  severity_estimate?: SeverityLevel;
}

export interface UpdateReportPayload {
  status?: ReportStatus;
  notes?: string | null;
  severity_estimate?: SeverityLevel;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  async getReports(params: ReportFilterParams = {}): Promise<RoadReport[]> {
    const query = new URLSearchParams();
    if (params.is_demo !== undefined) query.set('is_demo', String(params.is_demo));
    if (params.status) query.set('status', params.status);
    if (params.severity) query.set('severity', params.severity);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/reports?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch road reports');
    return res.json();
  },

  async createReport(payload: CreateReportPayload): Promise<RoadReport> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to submit report');
    }
    return res.json();
  },

  async getReport(id: string): Promise<RoadReport> {
    const res = await fetch(`${API_BASE}/reports/${id}`);
    if (!res.ok) throw new Error('Report not found');
    return res.json();
  },

  async updateReport(id: string, payload: UpdateReportPayload): Promise<RoadReport> {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return res.json();
  },

  async deleteDemoReports(): Promise<{ message: string; deleted_count: number }> {
    const res = await fetch(`${API_BASE}/reports/demo`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear demo reports');
    return res.json();
  },

  async getStats(include_demo = false): Promise<SystemStats> {
    const res = await fetch(`${API_BASE}/stats?include_demo=${include_demo}`);
    if (!res.ok) throw new Error('Failed to fetch system stats');
    return res.json();
  },

  async getHotspots(include_demo = false, eps_meters = 65, min_samples = 2): Promise<Hotspot[]> {
    const query = new URLSearchParams({
      include_demo: String(include_demo),
      eps_meters: String(eps_meters),
      min_samples: String(min_samples),
    });
    const res = await fetch(`${API_BASE}/hotspots?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch DBSCAN hotspots');
    return res.json();
  },
};

