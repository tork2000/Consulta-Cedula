import React from 'react';
import { Search, IdCard, History, Settings2 } from 'lucide-react';

export type TabType = 'search' | 'card' | 'history' | 'settings';

interface AndroidNavBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasResult: boolean;
  historyCount: number;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  currentTab,
  onTabChange,
  hasResult,
  historyCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number | boolean }[] = [
    {
      id: 'search',
      label: 'Consultar',
      icon: <Search className="w-5 h-5" />,
    },
    {
      id: 'card',
      label: 'Cédula',
      icon: <IdCard className="w-5 h-5" />,
      badge: hasResult,
    },
    {
      id: 'history',
      label: 'Historial',
      icon: <History className="w-5 h-5" />,
      badge: historyCount > 0 ? historyCount : undefined,
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: <Settings2 className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe shadow-lg max-w-lg mx-auto sm:border-x sm:border-slate-800">
      <div className="grid grid-cols-4 items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(15);
                }
                onTabChange(tab.id);
              }}
              className="min-h-[48px] flex flex-col items-center justify-center relative transition-colors focus:outline-none"
              aria-label={tab.label}
            >
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                {tab.badge !== undefined && tab.badge !== false && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                    {typeof tab.badge === 'number' ? (tab.badge > 9 ? '9+' : tab.badge) : '•'}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
