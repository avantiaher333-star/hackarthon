import React, { useState, useEffect, useCallback } from 'react';
import { NavView, RoadReport, Hotspot, SystemStats, ReportStatus } from './types';
import { api } from './services/api';
import { useMotionDetection } from './hooks/useMotionDetection';
import { useGeolocation } from './hooks/useGeolocation';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ToastContainer, ToastMessage } from './components/Toast';
import { HomeView } from './views/HomeView';
import { LiveMapView } from './views/LiveMapView';
import { HistoryView } from './views/HistoryView';
import { DashboardView } from './views/DashboardView';
import { SettingsView } from './views/SettingsView';
import { playDetectionChime } from './utils/sound';
import { DEFAULT_DEMO_COORDS } from './utils/geo';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('home');
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [selectedReport, setSelectedReport] = useState<RoadReport | null>(null);
  const [sessionReportsCount, setSessionReportsCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  // Calibration settings
  const [threshold, setThreshold] = useState<number>(19.5);
  const [cooldownMs, setCooldownMs] = useState<number>(3000);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Geolocation hook
  const { geoState, startWatchingLocation, stopWatchingLocation } = useGeolocation();

  // Load backend telemetry data
  const loadData = useCallback(async () => {
    try {
      const [fetchedReports, fetchedHotspots, fetchedStats] = await Promise.all([
        api.getReports({ limit: 150 }),
        api.getHotspots(true), // Include demo in clustering overview
        api.getStats(true),
      ]);
      setReports(fetchedReports);
      setHotspots(fetchedHotspots);
      setStats(fetchedStats);
      setIsBackendHealthy(true);
    } catch {
      setIsBackendHealthy(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Real Motion Sensor Detection
  const handleRealJolt = useCallback(
    async (score: number) => {
      playDetectionChime();

      // Check if GPS coordinates are currently available
      if (geoState.latitude === null || geoState.longitude === null) {
        addToast({
          type: 'warning',
          title: 'Suspicious Jolt Detected (No GPS)',
          message: 'Motion spike detected, but waiting for GPS location fix before submission.',
        });
        return;
      }

      try {
        const newReport = await api.createReport({
          latitude: geoState.latitude,
          longitude: geoState.longitude,
          sensor_score: score,
          gps_accuracy: geoState.accuracy,
          source: 'sensor',
          is_demo: false,
          notes: 'Automatic vehicle vibration detection via mobile accelerometer.',
        });

        setReports((prev) => [newReport, ...prev]);
        setSessionReportsCount((c) => c + 1);
        addToast({
          type: 'success',
          title: 'Suspected Road Defect Tagged',
          message: `Recorded impact score: ${score} m/s² with GPS coordinates.`,
        });

        // Refresh clusters
        api.getHotspots(true).then(setHotspots).catch(() => {});
        api.getStats(true).then(setStats).catch(() => {});
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Telemetry Submission Failed',
          message: err instanceof Error ? err.message : 'Network error',
        });
      }
    },
    [geoState, addToast]
  );

  // Motion Detection Hook
  const { motionState, startMotionDetection, stopMotionDetection } = useMotionDetection({
    threshold,
    cooldownMs,
    onJoltDetected: handleRealJolt,
  });

  // Toggle Live Monitoring
  const handleToggleMonitoring = async () => {
    if (isMonitoring) {
      stopMotionDetection();
      stopWatchingLocation();
      setIsMonitoring(false);
      addToast({
        type: 'info',
        title: 'Monitoring Paused',
        message: 'Telemetry collection stopped.',
      });
    } else {
      startWatchingLocation();
      const motionStarted = await startMotionDetection();
      setIsMonitoring(true);

      if (motionStarted) {
        addToast({
          type: 'success',
          title: 'Telemetry Active',
          message: 'Monitoring road vibrations and GPS coordinates.',
        });
      } else {
        addToast({
          type: 'warning',
          title: 'Monitoring Started (Desktop Mode)',
          message: 'Hardware sensor unavailable. Use "Simulate Pothole Hit" to test.',
        });
      }
    }
  };

  // Simulate Pothole Hit (works anywhere, on laptops or phones)
  const handleSimulateHit = async () => {
    playDetectionChime();

    // Use current GPS if granted, otherwise use default demo city coordinates with random jitter
    let lat: number;
    let lon: number;
    let accuracy = 5.0;

    if (geoState.latitude && geoState.longitude) {
      // Small random jitter ~ 15-30m
      const jitter = (Math.random() - 0.5) * 0.0003;
      lat = geoState.latitude + jitter;
      lon = geoState.longitude + jitter;
      accuracy = geoState.accuracy || 5.0;
    } else {
      // Default municipal demo center with small random variation
      const jitterLat = (Math.random() - 0.5) * 0.0008;
      const jitterLon = (Math.random() - 0.5) * 0.0008;
      lat = DEFAULT_DEMO_COORDS.lat + jitterLat;
      lon = DEFAULT_DEMO_COORDS.lon + jitterLon;
    }

    const simScore = Math.round((22 + Math.random() * 11) * 10) / 10;

    try {
      const created = await api.createReport({
        latitude: lat,
        longitude: lon,
        sensor_score: simScore,
        gps_accuracy: accuracy,
        source: 'simulated',
        is_demo: true,
        notes: '[Demo Simulation] Simulated vehicle vibration spike on road segment.',
      });

      setReports((prev) => [created, ...prev]);
      setSessionReportsCount((c) => c + 1);

      addToast({
        type: 'success',
        title: 'Simulated Pothole Tagged!',
        message: `Registered ${simScore} m/s² jolt at ${lat.toFixed(4)}°, ${lon.toFixed(4)}°.`,
      });

      // Recalculate DBSCAN clusters immediately
      const [updatedHotspots, updatedStats] = await Promise.all([
        api.getHotspots(true),
        api.getStats(true),
      ]);
      setHotspots(updatedHotspots);
      setStats(updatedStats);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Simulation Error',
        message: err instanceof Error ? err.message : 'Could not save simulated report',
      });
    }
  };

  // Status transition handler
  const handleUpdateStatus = async (id: string, newStatus: ReportStatus) => {
    try {
      const updated = await api.updateReport(id, { status: newStatus });
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selectedReport?.id === id) {
        setSelectedReport(updated);
      }
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Report ${id} transitioned to ${newStatus.replace('_', ' ')}.`,
      });
      loadData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Could not update status',
      });
    }
  };

  // Purge demo data
  const handleClearDemoData = async () => {
    try {
      const res = await api.deleteDemoReports();
      addToast({
        type: 'success',
        title: 'Demo Data Purged',
        message: `Removed ${res.deleted_count} demo telemetry records.`,
      });
      loadData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Purge Failed',
        message: err instanceof Error ? err.message : 'Could not purge demo records',
      });
    }
  };

  const demoCount = reports.filter((r) => r.is_demo).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onSimulateDemo={handleSimulateHit}
        isBackendHealthy={isBackendHealthy}
        isMonitoring={isMonitoring}
        demoCount={demoCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentView === 'home' && (
          <HomeView
            reports={reports}
            hotspots={hotspots}
            stats={stats}
            sessionReportsCount={sessionReportsCount}
            motionState={motionState}
            geoState={geoState}
            isMonitoring={isMonitoring}
            onToggleMonitoring={handleToggleMonitoring}
            onSimulateHit={handleSimulateHit}
            onNavigateToMap={() => setCurrentView('map')}
            onNavigateToHistory={() => setCurrentView('history')}
            onSelectReport={(rep) => {
              setSelectedReport(rep);
              setCurrentView('map');
            }}
          />
        )}

        {currentView === 'map' && (
          <LiveMapView
            reports={reports}
            hotspots={hotspots}
            userLat={geoState.latitude}
            userLon={geoState.longitude}
            selectedReport={selectedReport}
            onSelectReport={setSelectedReport}
            onUpdateStatus={handleUpdateStatus}
            onSimulateHit={handleSimulateHit}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            reports={reports}
            onSelectReport={(rep) => {
              setSelectedReport(rep);
              setCurrentView('map');
            }}
            onNavigateToMap={() => setCurrentView('map')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            reports={reports}
            hotspots={hotspots}
            stats={stats}
            onUpdateStatus={handleUpdateStatus}
            onRefresh={loadData}
            onSelectReport={(rep) => {
              setSelectedReport(rep);
              setCurrentView('map');
            }}
            onNavigateToMap={() => setCurrentView('map')}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            motionState={motionState}
            geoState={geoState}
            threshold={threshold}
            onThresholdChange={setThreshold}
            cooldownMs={cooldownMs}
            onCooldownChange={setCooldownMs}
            onClearDemoData={handleClearDemoData}
            demoCount={demoCount}
          />
        )}
      </main>

      <BottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        unreadReportsCount={reports.length}
      />
    </div>
  );
}

export default App;

