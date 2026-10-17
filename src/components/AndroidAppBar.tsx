import React from 'react';
import { ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidAppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  onOpenInstallModal?: () => void;
}

export const AndroidAppBar: React.FC<AndroidAppBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  onOpenInstallModal,
}) => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white px-3 py-2.5 flex items-center justify-between gap-3 shadow-md">
      {/* Left Slot: Back button or Flag emblem */}
      <div className="flex items-center gap-2.5 min-w-[44px]">
        {showBack ? (
          <button
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-slate-800 active:bg-slate-700 transition-colors text-slate-200"
            aria-label="Volver atrás"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center shadow-inner border border-blue-500/30">
            <span className="font-black text-sm text-amber-400">VE</span>
          </div>
        )}
      </div>

      {/* Center Slot: Title and subtitle */}
      <div className="flex-1 min-w-0 text-center">
        <h1 className="text-base font-bold text-white tracking-tight truncate leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-slate-400 truncate flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
            <span>{subtitle}</span>
          </p>
        )}
      </div>

      {/* Right Slot: PWA install button, APK modal trigger or custom action */}
      <div className="flex items-center justify-end min-w-[44px]">
        {rightAction ? (
          rightAction
        ) : (
          <button
            type="button"
            onClick={onOpenInstallModal || (isInstallable ? install : undefined)}
            className="min-h-[38px] px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-transform shadow-sm"
            title="Instalar en Android"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Instalar</span>
          </button>
        )}
      </div>
    </header>
  );
};
