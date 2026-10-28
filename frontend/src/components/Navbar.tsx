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
    <header className="sticky top-0 z-40 bg-navy-950/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-glow-emerald group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                <span className="text-emerald-400 font-extrabold text-lg tracking-tight font-sans">
                  RS
                </span>
              </div>
            </div>
            {isMonitoring && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-navy-950 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white tracking-tight font-sans">
                RoadSense
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 tracking-wide">
                CIVIC TELEMETRY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-body hidden sm:block">
              Every Ride Detects. Every Report Improves Roads.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white/[0.03] border border-white/10 p-1 rounded-2xl backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-navy-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
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
            className="group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500/15 to-indigo-500/15 hover:from-purple-500/25 hover:to-indigo-500/25 border border-purple-500/30 text-purple-200 hover:text-white transition-all shadow-sm active:scale-95"
            title="Simulate a real-time road jolt"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden xs:inline font-sans">Simulate Jolt</span>
          </button>

          {/* Monitoring State Badge */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
              isMonitoring
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-glow-emerald'
                : 'bg-white/[0.03] border-white/10 text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isMonitoring ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="font-mono text-[11px]">
              {isMonitoring ? 'RECORDING' : 'STANDBY'}
            </span>
          </div>

          {/* Backend Connection Indicator */}
          <div
            className="flex items-center"
            title={isBackendHealthy ? 'Municipal Network Online' : 'Network Disconnected'}
          >
            {isBackendHealthy ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-400 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
