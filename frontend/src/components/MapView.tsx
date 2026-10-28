import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RoadReport, Hotspot } from '../types';
import { StatusBadge, SeverityBadge } from './StatusBadge';
import { formatCoords, formatTimeAgo, DEFAULT_DEMO_COORDS } from '../utils/geo';
import { Locate, Layers } from 'lucide-react';

// Create custom colored SVG marker icons for crisp rendering without broken default image paths
function createMarkerIcon(color: string, isDemo = false) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="30" height="42">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <path d="M16 2 C8.268 2 2 8.268 2 16 C2 26 16 42 16 42 C16 42 30 26 30 16 C30 8.268 23.732 2 16 2 Z" 
            fill="${color}" stroke="#FFFFFF" stroke-width="2" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="6" fill="#0B1220"/>
      ${isDemo ? '<circle cx="16" cy="16" r="3" fill="#C084FC"/>' : '<circle cx="16" cy="16" r="3" fill="#FFFFFF"/>'}
    </svg>
  `;
  return L.divIcon({
    className: 'custom-road-marker',
    html: svg,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
}

function getMarkerColor(report: RoadReport): string {
  if (report.is_demo) return '#A855F7'; // purple for demo
  switch (report.status) {
    case 'new':
      return '#EF4444'; // Red
    case 'under_review':
      return '#F59E0B'; // Amber
    case 'inspection_scheduled':
      return '#3B82F6'; // Blue
    case 'resolved':
      return '#10B981'; // Emerald
    default:
      return '#64748B';
  }
}

// Controller component to smoothly move map or trigger resize
function MapController({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

interface MapViewProps {
  reports: RoadReport[];
  hotspots?: Hotspot[];
  userLat?: number | null;
  userLon?: number | null;
  selectedReport?: RoadReport | null;
  onSelectReport?: (report: RoadReport) => void;
  showHotspots?: boolean;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  reports,
  hotspots = [],
  userLat,
  userLon,
  selectedReport,
  onSelectReport,
  showHotspots = true,
  className = 'h-full w-full',
}) => {
  // Determine initial center: user location -> selected report -> first report -> default demo location
  const defaultCenter: [number, number] = [
    selectedReport?.latitude ?? userLat ?? reports[0]?.latitude ?? DEFAULT_DEMO_COORDS.lat,
    selectedReport?.longitude ?? userLon ?? reports[0]?.longitude ?? DEFAULT_DEMO_COORDS.lon,
  ];

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-navy-800 ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController center={defaultCenter} />

        {/* Standard OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* User GPS location circle if available */}
        {userLat && userLon && (
          <Circle
            center={[userLat, userLon]}
            radius={40}
            pathOptions={{
              color: '#10B981',
              fillColor: '#10B981',
              fillOpacity: 0.35,
              weight: 2,
            }}
          />
        )}

        {/* DBSCAN Hotspot Overlays */}
        {showHotspots &&
          hotspots.map((hs) => (
            <Circle
              key={hs.id}
              center={[hs.center_latitude, hs.center_longitude]}
              radius={hs.radius_meters}
              pathOptions={{
                color: hs.severity_estimate === 'high' ? '#EF4444' : '#F59E0B',
                fillColor: hs.severity_estimate === 'high' ? '#EF4444' : '#F59E0B',
                fillOpacity: 0.18,
                weight: 2,
                dashArray: '6, 6',
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 text-slate-100">
                  <div className="flex items-center justify-between gap-2 border-b border-navy-800 pb-1.5">
                    <span className="text-xs font-bold text-amber-400">🚨 Hotspot Cluster</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                      {hs.report_count} Reports
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Suspicious road segment requiring inspection.
                  </p>
                  <div className="text-[11px] space-y-1 text-slate-400">
                    <div>Radius: ~{Math.round(hs.radius_meters)}m</div>
                    <div>Avg Impact: {hs.avg_sensor_score} m/s²</div>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Individual Incident Markers */}
        {reports.map((report) => {
          const color = getMarkerColor(report);
          const icon = createMarkerIcon(color, report.is_demo);

          return (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectReport?.(report),
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 min-w-[210px] text-slate-100">
                  <div className="flex items-center justify-between gap-2 border-b border-navy-800 pb-1.5">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {report.id}
                    </span>
                    <StatusBadge status={report.status} isDemo={report.is_demo} />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Severity</span>
                    <SeverityBadge severity={report.severity_estimate} />
                  </div>

                  <div className="text-[11px] space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Jolt Score:</span>
                      <span className="font-semibold text-slate-200">{report.sensor_score} m/s²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span className="font-mono text-slate-300">{formatCoords(report.latitude, report.longitude)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Source:</span>
                      <span className="capitalize text-slate-300">{report.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reported:</span>
                      <span className="text-slate-300">{formatTimeAgo(report.timestamp)}</span>
                    </div>
                  </div>

                  {report.notes && (
                    <div className="p-1.5 rounded bg-navy-900 border border-navy-800 text-[11px] text-slate-300 italic">
                      "{report.notes}"
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-navy-950/85 backdrop-blur-md border border-navy-800/80 rounded-xl p-2.5 shadow-lg text-[10px] text-slate-300 hidden sm:flex flex-col gap-1.5">
        <div className="font-semibold text-slate-200 text-xs flex items-center gap-1 mb-0.5">
          <Layers className="w-3.5 h-3.5 text-emerald-400" /> Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Suspected Defect
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Under Review
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Scheduled
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Demo Record
        </div>
      </div>
    </div>
  );
};

