import React from 'react';
import { NavView } from '../types';
import { Activity, MapPin, Database, ShieldCheck, Sliders } from 'lucide-react';

interface BottomNavProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  unreadReportsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const items = [
    { id: 'home' as NavView, label: 'Monitor', icon: Activity },
    { id: 'map' as NavView, label: 'Map', icon: MapPin },
    { id: 'history' as NavView, label: 'Reports', icon: Database },
    { id: 'dashboard' as NavView, label: 'Ops', icon: ShieldCheck },
    { id: 'settings' as NavView, label: 'Config', icon: Sliders },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 backdrop-blur-lg border-t border-navy-800/80 px-2 py-1 safe-area-inset-bottom">
      <div className="grid grid-cols-5 items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-h-[50px] py-1 transition-all rounded-xl ${
                active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  active ? 'bg-emerald-500/15' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

