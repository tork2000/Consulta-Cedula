import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { CedulaValidationResult } from '../utils/cedulaValidator';

interface ValidationBannerProps {
  validation: CedulaValidationResult;
  showError: boolean;
  onApplyFix?: (fixedValue: string) => void;
  autoFixSuggestion?: string;
  selectedPrefix?: 'V' | 'E';
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  validation,
  showError,
  onApplyFix,
  autoFixSuggestion,
  selectedPrefix = 'V',
}) => {
  const { breakdown, error, errorDetail, isValid } = validation;

  return (
    <div className="w-full space-y-2.5">
      {/* Visual Checklist for Android Material 3 Form Guide */}
      <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3 text-xs space-y-2 backdrop-blur-sm">
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Requisitos de consulta</span>
          <span className="font-mono text-[10px] text-blue-400">
            Formato: <strong className="text-amber-400">{selectedPrefix}-</strong>(6 a 8 dígitos)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Rule 1: Nationality V or E */}
          <div className="flex items-center gap-2 p-2 rounded-lg border bg-emerald-950/40 border-emerald-500/40 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-medium">Nacionalidad: {selectedPrefix}</div>
              <div className="text-[10px] opacity-80">
                {selectedPrefix === 'V' ? 'Venezolano' : 'Extranjero'}
              </div>
            </div>
          </div>

          {/* Rule 2: Hyphen (-) automatic */}
          <div className="flex items-center gap-2 p-2 rounded-lg border bg-emerald-950/40 border-emerald-500/40 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-medium">Guion (-)</div>
              <div className="text-[10px] opacity-80">Asignado automático</div>
            </div>
          </div>

          {/* Rule 3: 6 to 8 digits (supports 7-digit and 8-digit cédulas) */}
          <div
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
              breakdown.hasValidDigitsCount && !breakdown.hasInvalidChars
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/60 border-slate-700 text-slate-400'
            }`}
          >
            {breakdown.hasValidDigitsCount && !breakdown.hasInvalidChars ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <div>
              <div className="font-medium">6 a 8 dígitos</div>
              <div className="text-[10px] font-mono opacity-80">
                {breakdown.digitsCount} {breakdown.digitsCount === 1 ? 'número' : 'números'} (7 u 8 válidos)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Error Banner when submission or typing fails validation */}
      {showError && !isValid && (
        <div
          role="alert"
          className="bg-rose-950/90 border border-rose-500/70 rounded-xl p-3.5 text-rose-100 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="font-bold text-sm text-white flex items-center justify-between">
                <span>{error || 'Error en número de cédula'}</span>
                <span className="text-[10px] bg-rose-900 text-rose-200 px-2 py-0.5 rounded-full font-mono">
                  Validación
                </span>
              </div>
              <p className="text-xs text-rose-200 leading-relaxed">{errorDetail}</p>

              {/* Automatic fix suggestion if available */}
              {autoFixSuggestion && onApplyFix && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onApplyFix(autoFixSuggestion)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-rose-800/80 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold rounded-lg border border-rose-400/40 transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      Rellenar ceros: <strong className="font-mono underline">{autoFixSuggestion}</strong>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
