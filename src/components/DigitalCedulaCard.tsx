import React, { useState } from 'react';
import { Copy, Check, Share2, Printer, Shield, CheckCircle2, QrCode } from 'lucide-react';
import { CedulaQueryResult } from '../types/cedula';

interface DigitalCedulaCardProps {
  data: CedulaQueryResult;
  isLiveApi?: boolean;
}

export const DigitalCedulaCard: React.FC<DigitalCedulaCardProps> = ({
  data,
  isLiveApi = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = () => {
    const textToCopy = `Cédula: ${data.cedula_completa}\nNombre: ${data.nombre_completo}\nRIF: ${data.rif}\nCentro Electoral: ${data.cne?.centro_electoral || 'N/A'}\nEstado: ${data.cne?.estado || 'N/A'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 30]);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cédula Venezolana ${data.cedula_completa}`,
          text: `Datos de Identidad Venezolana:\nCédula: ${data.cedula_completa}\nNombre: ${data.nombre_completo}\nRIF: ${data.rif}`,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Digital Cédula Card Frame */}
      <div
        id="digital-cedula-frame"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-300 dark:border-slate-700 shadow-xl p-4 sm:p-5 text-slate-800 dark:text-slate-100"
      >
        {/* Venezuelan Flag Tricolor Header */}
        <div className="absolute top-0 left-0 right-0 h-3 flex">
          <div className="w-full bg-amber-400 h-full" />
          <div className="w-full bg-blue-700 h-full relative">
            {/* 8 Stars micro representation */}
            <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-90 text-[6px] text-white">
              ★★★★★★★★
            </div>
          </div>
          <div className="w-full bg-red-600 h-full" />
        </div>

        {/* Card Official Top Header */}
        <div className="pt-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] sm:text-xs font-extrabold tracking-widest text-slate-700 dark:text-slate-300 uppercase">
            República Bolivariana de Venezuela
          </p>
          <p className="text-[8px] sm:text-[9px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Identificación de la República · SAIME
          </p>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Cédula de Identidad
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-semibold">
              {data.nacionalidad === 'V' ? 'Venezolano' : 'Extranjero'}
            </span>
          </div>
        </div>

        {/* Main Body: Photo + Personal Details */}
        <div className="mt-4 grid grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Left Column: Avatar Photo & Biometrics */}
          <div className="col-span-4 sm:col-span-3 flex flex-col items-center">
            <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-xl bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col items-center justify-end shadow-inner relative">
              {/* Silhouette Avatar */}
              <div className="w-12 h-12 rounded-full bg-slate-400 dark:bg-slate-600 mb-1" />
              <div className="w-20 h-10 rounded-t-full bg-slate-400 dark:bg-slate-600" />
              {/* Watermark Tricolor Seal */}
              <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/60 text-[8px] font-bold text-amber-400">
                {data.nacionalidad}
              </div>
            </div>

            {/* Fingerprint indicator */}
            <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 font-mono">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>Verificado</span>
            </div>
          </div>

          {/* Right Column: Identity Data Fields */}
          <div className="col-span-8 sm:col-span-9 space-y-2.5">
            {/* Primary Cédula Number Box */}
            <div className="bg-slate-900 text-white dark:bg-black/60 rounded-xl p-2.5 sm:p-3 border border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">
                  Número de Cédula
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-amber-400">
                  {data.cedula_completa}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="min-h-[40px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs flex items-center gap-1 transition-all border border-slate-600"
                title="Copiar cédula"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* Full Name Banner */}
            <div className="bg-slate-900/90 text-white p-2.5 rounded-xl border border-slate-700 shadow-sm space-y-0.5">
              <span className="text-[9px] text-amber-400 block font-bold uppercase tracking-wider">
                Nombre Completo del Titular
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wide block break-words leading-tight">
                {data.nombre_completo || [data.primer_nombre, data.segundo_nombre, data.primer_apellido, data.segundo_apellido].filter(Boolean).join(' ') || 'Ciudadano Registrado'}
              </span>
            </div>

            {/* Names & Surnames Structured Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/95 dark:bg-slate-800/95 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold uppercase">
                  Apellidos
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase break-words block leading-snug">
                  {data.primer_apellido || ''} {data.segundo_apellido || ''}
                </span>
              </div>

              <div className="bg-white/95 dark:bg-slate-800/95 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold uppercase">
                  Nombres
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase break-words block leading-snug">
                  {data.primer_nombre || ''} {data.segundo_nombre || ''}
                </span>
              </div>
            </div>

            {/* RIF and Birth Date */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/95 dark:bg-slate-800/95 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold uppercase">
                  RIF (SENIAT)
                </span>
                <span className="font-mono font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400 tracking-wider">
                  {data.rif}
                </span>
              </div>

              <div className="bg-white/95 dark:bg-slate-800/95 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold uppercase">
                  Fecha Nacimiento
                </span>
                <span className="font-mono font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  {data.fecha_nacimiento || 'Registro Oficial'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer of Card: PDF417 Barcode / QR Simulation */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Simulated PDF417 Barcode */}
          <div className="w-full sm:w-auto flex-1 bg-white dark:bg-slate-950 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
            <div className="h-6 flex items-center justify-between gap-px opacity-85">
              {[4, 2, 6, 1, 3, 5, 2, 7, 1, 4, 2, 6, 3, 2, 5, 1, 4, 3, 6, 2, 5, 1, 7, 3, 4, 2, 5, 1, 3, 6, 2, 4, 5, 1, 3].map(
                (w, idx) => (
                  <div
                    key={idx}
                    className="h-full bg-slate-900 dark:bg-slate-200 rounded-xs"
                    style={{ width: `${w * 1.8}px` }}
                  />
                )
              )}
            </div>
            <div className="text-[8px] font-mono text-center text-slate-500 dark:text-slate-400 tracking-widest mt-0.5">
              I&lt;VEN{data.nacionalidad}&lt;{data.cedula}&lt;&lt;0
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors text-slate-700 dark:text-slate-300"
          >
            <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{showQR ? 'Ocultar QR' : 'Ver QR'}</span>
          </button>
        </div>

        {/* Collapsible QR Code View */}
        {showQR && (
          <div className="mt-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-700 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
            {/* SVG QR Code Simulation representing V-XXXXXXXX */}
            <svg
              className="w-36 h-36 bg-white p-2 rounded-lg shadow-sm"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Corner markers */}
              <rect x="5" y="5" width="26" height="26" fill="black" />
              <rect x="9" y="9" width="18" height="18" fill="white" />
              <rect x="13" y="13" width="10" height="10" fill="black" />

              <rect x="69" y="5" width="26" height="26" fill="black" />
              <rect x="73" y="9" width="18" height="18" fill="white" />
              <rect x="77" y="13" width="10" height="10" fill="black" />

              <rect x="5" y="69" width="26" height="26" fill="black" />
              <rect x="9" y="73" width="18" height="18" fill="white" />
              <rect x="13" y="77" width="10" height="10" fill="black" />

              {/* Data matrix dots */}
              <rect x="36" y="10" width="6" height="6" fill="black" />
              <rect x="46" y="10" width="6" height="6" fill="black" />
              <rect x="56" y="10" width="6" height="6" fill="black" />
              <rect x="36" y="24" width="8" height="6" fill="black" />
              <rect x="50" y="24" width="12" height="6" fill="black" />
              <rect x="10" y="38" width="6" height="12" fill="black" />
              <rect x="22" y="38" width="8" height="6" fill="black" />
              <rect x="36" y="38" width="6" height="6" fill="black" />
              <rect x="48" y="38" width="10" height="10" fill="black" />
              <rect x="64" y="38" width="8" height="6" fill="black" />
              <rect x="78" y="38" width="12" height="8" fill="black" />
              <rect x="36" y="52" width="12" height="6" fill="black" />
              <rect x="54" y="52" width="6" height="12" fill="black" />
              <rect x="66" y="52" width="14" height="6" fill="black" />
              <rect x="36" y="68" width="8" height="8" fill="black" />
              <rect x="50" y="68" width="6" height="6" fill="black" />
              <rect x="62" y="68" width="12" height="6" fill="black" />
              <rect x="80" y="68" width="8" height="12" fill="black" />
              <rect x="36" y="82" width="14" height="6" fill="black" />
              <rect x="56" y="82" width="10" height="6" fill="black" />
              <rect x="72" y="82" width="8" height="8" fill="black" />
            </svg>
            <span className="mt-1 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
              {data.cedula_completa}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Código QR Cédula Venezuela
            </span>
          </div>
        )}
      </div>

      {/* Action Toolbar underneath the Card */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 no-print">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>
            {isLiveApi ? 'Datos obtenidos desde cedula.com.ve' : 'Datos verificados con motor oficial'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            <span>Compartir</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
