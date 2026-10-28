import React from 'react';
import { NavView } from '../types';
import {
  Activity,
  MapPin,
  FileText,
  Building2,
  SlidersHorizontal,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  onSimulateDemo: () => void;
  isBackendHealthy: boolean;
  isMonitoring: boolean;
  demoCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onSimulateDemo,
  isBackendHealthy,
  isMonitoring,
}) => {
  const navItems = [
    { id: 'home' as NavView, label: 'Telemetry', icon: Activity },
    { id: 'map' as NavView, label: 'Road Map', icon: MapPin },
    { id: 'history' as NavView, label: 'Logbook', icon: FileText },
    { id: 'dashboard' as NavView, label: 'Public Works', icon: Building2 },
    { id: 'settings' as NavView, label: 'Sensors', icon: SlidersHorizontal },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/90 px-4 sm:px-6 py-3 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-500 p-0.5 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-blue-600 rounded-[14px] flex items-center justify-center">
                <span className="text-white font-extrabold text-base tracking-tight font-sans">
                  RS
                </span>
              </div>
            </div>
            {isMonitoring && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight font-sans">
                RoadSense
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 tracking-wide font-sans">
                CIVIC TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans hidden sm:block">
              Every Ride Detects. Every Report Improves Roads.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 border border-slate-200/90 p-1 rounded-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-white/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'stroke-[2.5]' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Button */}
          <button
            onClick={onSimulateDemo}
            className="group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-800 transition-all shadow-sm active:scale-95"
            title="Inject simulated road bump (DBSCAN test)"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Simulate Jolt</span>
            <span className="sm:hidden">Simulate</span>
          </button>

          {/* Live Status Indicator Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <div
              className={`w-2 h-2 rounded-full ${
                isMonitoring
                  ? 'bg-blue-600 animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-[11px] font-medium text-slate-600 font-mono">
              {isMonitoring ? '50Hz Live' : 'Standby'}
            </span>
          </div>

          {/* Backend Connection Health */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border ${
              isBackendHealthy
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={isBackendHealthy ? 'Cloud Server Connected (FastAPI & SQLite Active)' : 'API Disconnected'}
          >
            {isBackendHealthy ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden xl:inline">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
