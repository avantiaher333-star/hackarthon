export type SeverityLevel = 'low' | 'medium' | 'high';

export type ReportStatus = 'new' | 'under_review' | 'inspection_scheduled' | 'resolved';

export type ReportSource = 'sensor' | 'simulated' | 'manual';

export interface RoadReport {
  id: string;
  latitude: float;
  longitude: float;
  timestamp: string;
  sensor_score: number;
  gps_accuracy?: number | null;
  source: ReportSource | string;
  is_demo: boolean;
  status: ReportStatus;
  severity_estimate: SeverityLevel;
  notes?: string | null;
}

export type float = number;

export interface Hotspot {
  id: string;
  center_latitude: number;
  center_longitude: number;
  report_count: number;
  radius_meters: number;
  avg_sensor_score: number;
  severity_estimate: SeverityLevel;
  report_ids: string[];
  status_summary: Record<string, number>;
  is_demo: boolean;
}

export interface SystemStats {
  total_reports: number;
  reports_24h: number;
  high_priority_count: number;
  resolved_count: number;
  hotspot_count: number;
  status_counts: Record<string, number>;
  severity_counts: Record<string, number>;
  demo_count: number;
  real_count: number;
}

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  status: 'inactive' | 'prompt' | 'granted' | 'denied' | 'unavailable' | 'timeout';
  errorMessage: string | null;
}

export interface MotionState {
  active: boolean;
  magnitude: number;
  peakJolt: number;
  lastDetectionTime: number | null;
  permissionState: 'unknown' | 'granted' | 'denied' | 'unsupported';
  isSupported: boolean;
  errorMessage: string | null;
}

export type NavView = 'home' | 'map' | 'history' | 'dashboard' | 'settings';

