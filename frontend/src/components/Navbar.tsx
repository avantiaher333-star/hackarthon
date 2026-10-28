import React from 'react';
import { NavView } from '../types';
import { Activity, MapPin, Database, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

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
    { id: 'home' as NavView, label: 'Monitor', icon: Activity },
    { id: 'map' as NavView, label: 'Live Map', icon: MapPin },
    { id: 'history' as NavView, label: 'Reports', icon: Database },
    { id: 'dashboard' as NavView, label: 'Municipal Ops', icon: ShieldCheck },
    { id: 'settings' as NavView, label: 'Settings', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-md border-b border-navy-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <span className="text-emerald-400 font-extrabold text-lg tracking-tighter">RS</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">RoadSense AI</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Every Ride Detects. Every Report Improves Roads.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-navy-900/80 border border-navy-800 p-1 rounded-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Header Right Actions & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Button */}
          <button
            onClick={onSimulateDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-purple-200 transition-all shadow-sm active:scale-95"
            title="Simulates a sudden pothole jolt for testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="hidden xs:inline">Simulate Hit</span>
          </button>

          {/* Monitoring State Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isMonitoring
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isMonitoring ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className="hidden sm:inline">
              {isMonitoring ? 'Monitoring Active' : 'Idle'}
            </span>
          </div>

          {/* Backend Status Dot */}
          <div
            title={isBackendHealthy ? 'API Backend Connected' : 'API Backend Disconnected'}
            className="flex items-center"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isBackendHealthy ? 'bg-emerald-400' : 'bg-rose-500 animate-pulse'
              }`}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

