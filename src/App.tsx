/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  WifiOff,
  IdCard,
  Loader2,
} from 'lucide-react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidAppBar } from './components/AndroidAppBar';
import { AndroidNavBar, TabType } from './components/AndroidNavBar';
import { ValidationBanner } from './components/ValidationBanner';
import { DigitalCedulaCard } from './components/DigitalCedulaCard';
import { CneElectoralCard } from './components/CneElectoralCard';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { InstallModal } from './components/InstallModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  validateCedulaDigits,
} from './utils/cedulaValidator';
import {
  CedulaQueryResult,
  ApiResponsePayload,
  QueryHistoryItem,
  ApiSettings,
} from './types/cedula';

const LOCAL_STORAGE_HISTORY_KEY = 'cedula_ve_history_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'cedula_ve_settings_v1';

export default function App() {
  const isOnline = useOnlineStatus();
  const [currentTab, setCurrentTab] = useState<TabType>('search');

  // Input states: user selects V or E, and only enters digits (numbers)
  const [selectedPrefix, setSelectedPrefix] = useState<'V' | 'E'>('V');
  const [cedulaDigits, setCedulaDigits] = useState<string>('12345678');
  const [showValidationError, setShowValidationError] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Async states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<CedulaQueryResult | null>(null);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Persistence: History & Settings
  const [history, setHistory] = useState<QueryHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<ApiSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            app_id: '',
            token: '',
            useCustomKeys: false,
            offlineSimulationAllowed: true,
          };
    } catch {
      return {
        app_id: '',
        token: '',
        useCustomKeys: false,
        offlineSimulationAllowed: true,
      };
    }
  });

  // Save history on changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Save settings on changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Validation calculation based on digits and selected nationality prefix
  const validation = useMemo(() => {
    return validateCedulaDigits(cedulaDigits, selectedPrefix);
  }, [cedulaDigits, selectedPrefix]);

  // Suggest zero-padding only if user typed fewer than 6 digits
  const autoFixSuggestion = useMemo(() => {
    const clean = cedulaDigits.replace(/\D/g, '');
    if (clean.length > 0 && clean.length < 6) {
      return clean.padStart(7, '0');
    }
    return undefined;
  }, [cedulaDigits]);

  // Handle prefix change (V / E toggle)
  const handleSelectPrefix = (prefix: 'V' | 'E') => {
    setSelectedPrefix(prefix);
    if (showValidationError) {
      setShowValidationError(false);
    }
  };

  // Pure digits input handler: user only enters numbers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim().toUpperCase();

    // If user pastes a full string like "V-12345678" or "E 87654321"
    if (val.startsWith('V')) {
      setSelectedPrefix('V');
      val = val.substring(1);
    } else if (val.startsWith('E')) {
      setSelectedPrefix('E');
      val = val.substring(1);
    }

    // Keep only numbers and max 8 digits
    const digitsOnly = val.replace(/\D/g, '').slice(0, 8);
    setCedulaDigits(digitsOnly);

    if (showValidationError) {
      const check = validateCedulaDigits(digitsOnly, selectedPrefix);
      if (check.isValid) {
        setShowValidationError(false);
      }
    }
  };

  // Form submission with strict pre-API validation
  const handleConsultar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. FORMAT VALIDATION: Check before making any API request
    if (!validation.isValid) {
      setShowValidationError(true);
      setApiError(null);

      // Trigger Android haptic vibration on error
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 50, 40]);
      }
      return;
    }

    // Format is valid -> proceed to API
    setShowValidationError(false);
    setApiError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/cedula/consultar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          cedula_input: validation.normalized, // E.g. "V-12345678"
          app_id: settings.app_id || undefined,
          token: settings.token || undefined,
        }),
      });

      const json: ApiResponsePayload = await response.json();

      if (!response.ok || !json.ok || !json.data) {
        setApiError(json.error || 'No se pudieron obtener los datos de la cédula.');
        setIsLoading(false);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([80, 50, 80]);
        }
        return;
      }

      // Success
      setQueryResult(json.data);
      setIsLiveApi(json.is_live_api);
      setApiNotice(json.notice || null);

      // Add to history
      const historyItem: QueryHistoryItem = {
        id: `${json.data.cedula_completa}-${Date.now()}`,
        timestamp: Date.now(),
        cedula_completa: json.data.cedula_completa,
        nacionalidad: json.data.nacionalidad,
        numero: json.data.cedula,
        nombre_completo: json.data.nombre_completo,
        rif: json.data.rif,
        is_live_api: json.is_live_api,
        source: json.source,
        fullData: json.data,
      };

      setHistory((prev) => [
        historyItem,
        ...prev.filter((h) => h.cedula_completa !== json.data?.cedula_completa),
      ]);

      // Android haptic success
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch (err: any) {
      setApiError(err?.message || 'Error de conexión al consultar el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFix = (fixedDigits: string) => {
    const clean = fixedDigits.replace(/\D/g, '').slice(0, 8);
    setCedulaDigits(clean);
    setShowValidationError(false);
  };

  const handleSelectHistoryItem = (item: QueryHistoryItem) => {
    setQueryResult(item.fullData);
    setIsLiveApi(item.is_live_api);
    setSelectedPrefix(item.nacionalidad);
    setCedulaDigits(item.numero);
    setCurrentTab('card');
  };

  const handleSelectSampleFromSettings = (sampleDigits: string, prefix?: 'V' | 'E') => {
    let p = prefix || selectedPrefix;
    let digits = sampleDigits;

    if (sampleDigits.startsWith('V-') || sampleDigits.startsWith('V')) {
      p = 'V';
      digits = sampleDigits.replace(/\D/g, '');
    } else if (sampleDigits.startsWith('E-') || sampleDigits.startsWith('E')) {
      p = 'E';
      digits = sampleDigits.replace(/\D/g, '');
    }

    setSelectedPrefix(p);
    const cleanDigits = digits.replace(/\D/g, '').slice(0, 8);
    setCedulaDigits(cleanDigits);
    setCurrentTab('search');

    const check = validateCedulaDigits(cleanDigits, p);
    if (!check.isValid) {
      setShowValidationError(true);
    } else {
      setShowValidationError(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('¿Deseas vaciar todo el historial de cédulas consultadas?')) {
      setHistory([]);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Outer Shell for Desktop & Android Viewports */}
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col bg-slate-900 border-x border-slate-800 shadow-2xl relative min-h-screen">
        {/* Android Native Status Bar */}
        <AndroidStatusBar />

        {/* Android Material 3 Top App Bar */}
        <AndroidAppBar
          title="Cédula Venezuela"
          subtitle="Consulta y Validación de Cédula"
          showBack={currentTab !== 'search'}
          onBack={() => setCurrentTab('search')}
          onOpenInstallModal={() => setShowInstallModal(true)}
        />

        {/* Offline Banner when device loses connection */}
        {!isOnline && (
          <div className="bg-amber-600/90 text-slate-950 px-3 py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Sin conexión a Internet · Modo de consulta fuera de línea</span>
          </div>
        )}

        {/* Scrollable Main Body */}
        <main className="flex-1 p-4 pb-24 overflow-y-auto space-y-4">
          {/* TAB 1: CONSULTAR */}
          {currentTab === 'search' && (
            <div className="space-y-4">
              {/* National Identity Hero Header */}
              <div className="bg-gradient-to-br from-blue-900/60 via-slate-900 to-indigo-950/70 border border-blue-500/30 rounded-2xl p-4 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-1.5 flex">
                  <div className="w-1/3 bg-amber-400" />
                  <div className="w-1/3 bg-blue-600" />
                  <div className="w-1/3 bg-red-600" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                    SAIME
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      Consulta de Cédula de Identidad
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Selecciona <strong className="text-amber-400">V</strong> o <strong className="text-amber-400">E</strong> y escribe los números de cédula para consultar los datos en{' '}
                      <span className="text-blue-400 font-medium">cedula.com.ve</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Consultation Input Form */}
              <form onSubmit={handleConsultar} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="cedula-digits-input" className="font-bold text-slate-200">
                      Número de Cédula (solo dígitos)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Nacionalidad y guion automáticos:{' '}
                      <strong className="font-mono text-amber-400 font-bold">{selectedPrefix}-</strong>
                    </span>
                  </div>

                  {/* Nationality toggle (V / E) + Attached Implied Hyphen + Pure Digits Box */}
                  <div className="flex items-stretch gap-2">
                    {/* V / E Selector */}
                    <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700/80 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectPrefix('V')}
                        className={`min-h-[46px] px-3.5 py-1 text-xs font-black rounded-lg transition-all ${
                          selectedPrefix === 'V'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Venezolano (V)"
                      >
                        V
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPrefix('E')}
                        className={`min-h-[46px] px-3.5 py-1 text-xs font-black rounded-lg transition-all ${
                          selectedPrefix === 'E'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Extranjero (E)"
                      >
                        E
                      </button>
                    </div>

                    {/* Digits-only input with implied prefix and hyphen */}
                    <div
                      className={`flex-1 flex items-center bg-slate-800 border rounded-xl overflow-hidden px-3.5 transition-colors ${
                        showValidationError && !validation.isValid
                          ? 'border-rose-500 focus-within:border-rose-400'
                          : validation.isValid
                          ? 'border-emerald-500/80 focus-within:border-emerald-400'
                          : 'border-slate-700 focus-within:border-blue-500'
                      }`}
                    >
                      {/* Implied prefix and hyphen: shown visually without typing */}
                      <span className="font-mono text-lg font-black text-amber-400 select-none pr-1 tracking-wider">
                        {selectedPrefix}-
                      </span>

                      {/* User only types numbers */}
                      <input
                        id="cedula-digits-input"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={cedulaDigits}
                        onChange={handleInputChange}
                        placeholder="Ej: 7654321 o 12345678"
                        maxLength={8}
                        className="w-full min-h-[48px] bg-transparent font-mono text-lg font-black text-white tracking-wider placeholder-slate-600 focus:outline-none"
                      />

                      {/* Digits counter with valid indicator */}
                      <div className="flex items-center gap-1 shrink-0 pl-1">
                        <span
                          className={`text-[11px] font-mono font-bold transition-colors ${
                            validation.isValid
                              ? 'text-emerald-400'
                              : cedulaDigits.length > 0
                              ? 'text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {cedulaDigits.length}/8
                        </span>
                        {validation.isValid && (
                          <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validation Checklist & Error Banner */}
                <ValidationBanner
                  validation={validation}
                  showError={showValidationError}
                  onApplyFix={handleApplyFix}
                  autoFixSuggestion={autoFixSuggestion}
                  selectedPrefix={selectedPrefix}
                />

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[50px] bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Consultando API cedula.com.ve...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Consultar Cédula</span>
                    </>
                  )}
                </button>

                {/* API Error Notification */}
                {apiError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}
              </form>

              {/* Consultation Results */}
              {queryResult && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {/* Dedicated Citizen Identity Summary Card */}
                  <div className="bg-slate-900 border border-blue-500/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
                          {queryResult.nacionalidad}
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-white">
                            Datos del Ciudadano Verificados
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            {isLiveApi ? 'Fuente: api.cedula.com.ve' : 'Fuente: Motor de Validación'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-amber-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700">
                        {queryResult.cedula_completa}
                      </span>
                    </div>

                    {/* Primary Full Name Box */}
                    <div className="bg-gradient-to-r from-blue-950/80 to-slate-900 p-3 rounded-xl border border-blue-500/30">
                      <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider block">
                        Nombre y Apellidos Completos
                      </span>
                      <span className="text-base sm:text-lg font-black text-white uppercase tracking-wide block mt-0.5 break-words">
                        {queryResult.nombre_completo}
                      </span>
                    </div>

                    {/* Breakdown of Nombres & Apellidos */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Primer Apellido
                        </span>
                        <span className="text-sm font-bold text-white uppercase block mt-0.5">
                          {queryResult.primer_apellido || '—'}
                        </span>
                      </div>

                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Segundo Apellido
                        </span>
                        <span className="text-sm font-bold text-white uppercase block mt-0.5">
                          {queryResult.segundo_apellido || '—'}
                        </span>
                      </div>

                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Primer Nombre
                        </span>
                        <span className="text-sm font-bold text-white uppercase block mt-0.5">
                          {queryResult.primer_nombre || '—'}
                        </span>
                      </div>

                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Segundo Nombre
                        </span>
                        <span className="text-sm font-bold text-white uppercase block mt-0.5">
                          {queryResult.segundo_nombre || '—'}
                        </span>
                      </div>
                    </div>

                    {/* RIF and Status */}
                    <div className="flex items-center justify-between text-xs pt-1 text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                          RIF Fiscal SENIAT
                        </span>
                        <span className="font-mono font-bold text-blue-400">
                          {queryResult.rif}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                          Estado en Padrón
                        </span>
                        <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 inline" />
                          Habilitado
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Notice */}
                  {apiNotice && (
                    <div className="p-3 rounded-xl bg-blue-950/70 border border-blue-500/40 text-blue-200 text-xs flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{apiNotice}</p>
                    </div>
                  )}

                  {/* Digital Venezuelan ID Card */}
                  <DigitalCedulaCard data={queryResult} isLiveApi={isLiveApi} />

                  {/* CNE Electoral Registry Details */}
                  {queryResult.cne && (
                    <CneElectoralCard
                      cne={queryResult.cne}
                      registroCivil={queryResult.registro_civil}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CÉDULA DIGITAL DETAIL */}
          {currentTab === 'card' && (
            <div className="space-y-4">
              {queryResult ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <IdCard className="w-5 h-5 text-blue-400" />
                      <span>Cédula Digital Activa</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('search')}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Nueva consulta</span>
                    </button>
                  </div>

                  <DigitalCedulaCard data={queryResult} isLiveApi={isLiveApi} />

                  {queryResult.cne && (
                    <CneElectoralCard
                      cne={queryResult.cne}
                      registroCivil={queryResult.registro_civil}
                    />
                  )}
                </>
              ) : (
                <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                    <IdCard className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No hay cédula en pantalla</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Selecciona V o E e ingresa tu número (de 6 a 8 dígitos) en la pestaña &quot;Consultar&quot; para ver el tarjetón digital con código de barras y RIF.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPrefix('V');
                      setCedulaDigits('12345678');
                      handleConsultar();
                    }}
                    className="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Cargar cédula de ejemplo (12345678)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HISTORIAL */}
          {currentTab === 'history' && (
            <HistoryView
              history={history}
              onSelectHistory={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
              onDeleteHistoryItem={handleDeleteHistoryItem}
            />
          )}

          {/* TAB 4: AJUSTES & API */}
          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={setSettings}
              onSelectSampleCedula={handleSelectSampleFromSettings}
            />
          )}
        </main>

        {/* Android Material 3 Bottom Navigation Bar */}
        <AndroidNavBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          hasResult={!!queryResult}
          historyCount={history.length}
        />

        {/* Android Installation & APK Modal */}
        <InstallModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
          appUrl={typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-he2x2luqtunh5cfarrfowk-885639056291.us-east1.run.app'}
        />
      </div>
    </div>
  );
}
