import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Sparkles, ExternalLink, Check, Trash2, Smartphone, Download, ShieldCheck } from 'lucide-react';
import { ApiSettings } from '../types/cedula';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsViewProps {
  settings: ApiSettings;
  onSaveSettings: (settings: ApiSettings) => void;
  onSelectSampleCedula: (sampleDigits: string, prefix?: 'V' | 'E') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onSelectSampleCedula,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [appId, setAppId] = useState(settings.app_id || '');
  const [token, setToken] = useState(settings.token || '');
  const [savedAlert, setSavedAlert] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-he2x2luqtunh5cfarrfowk-885639056291.us-east1.run.app';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      app_id: appId.trim(),
      token: token.trim(),
      useCustomKeys: !!(appId.trim() && token.trim()),
    });
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const handleClearKeys = () => {
    setAppId('');
    setToken('');
    onSaveSettings({
      ...settings,
      app_id: '',
      token: '',
      useCustomKeys: false,
    });
  };

  const sampleCedulas = [
    { label: 'Cédula de 7 dígitos (Histórica / Común)', value: '7654321', prefix: 'V' as const },
    { label: 'Cédula Venezolana estándar (8 dígitos)', value: '12345678', prefix: 'V' as const },
    { label: 'Cédula Extranjera (E)', value: '87654321', prefix: 'E' as const },
    { label: 'Cédula reciente (Serie alta)', value: '28954120', prefix: 'V' as const },
  ];

  const testErrorCases = [
    { label: 'Dígitos insuficientes (5 números)', value: '12345', prefix: 'V' as const },
    { label: 'Dígitos insuficientes (3 números)', value: '123', prefix: 'V' as const },
    { label: 'Campo vacío (0 dígitos)', value: '', prefix: 'V' as const },
  ];

  return (
    <div className="space-y-5 text-slate-100">
      {/* Code Status and Android Installation Card */}
      <div className="bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Instalación en Android</h2>
              <p className="text-xs text-slate-400">Instalar en teléfono o generar .APK</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Código Guardado</span>
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Todo el código fuente y las modificaciones están completamente guardados y respaldados en el proyecto. Puedes instalar la aplicación directamente en tu móvil:
        </p>

        <div className="space-y-2 pt-1">
          {isInstalled ? (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>La aplicación ya está instalada en tu dispositivo.</span>
            </div>
          ) : isInstallable ? (
            <button
              type="button"
              onClick={install}
              className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Instalar App en este Android</span>
            </button>
          ) : (
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Instalación directa en Chrome (Android):</p>
              <p className="text-slate-400 text-[11px]">
                Abre el enlace de la aplicación en Chrome, toca los tres puntos (⋮) y selecciona <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Agregar a pantalla principal&quot;</strong>.
              </p>
            </div>
          )}

          <a
            href={`https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[42px] bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-200 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <span>Empaquetar y descargar .APK en PWABuilder</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          </a>
        </div>
      </div>
      {/* API Configuration Card for cedula.com.ve */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">API cedula.com.ve</h2>
              <p className="text-xs text-slate-400">Configuración de credenciales</p>
            </div>
          </div>
          <a
            href="https://cedula.com.ve"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
          >
            <span>Sitio Oficial</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          La API de <strong className="text-blue-400">api.cedula.com.ve/api/v1</strong> permite consultar datos de cédulas venezolanas mediante <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded text-[11px]">app_id</code> y <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded text-[11px]">token</code>. Si no dispones de credenciales propias, la aplicación opera de forma transparente con el motor de verificación civil integrado.
        </p>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              APP ID (cedula.com.ve)
            </label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="Ej: mi_app_id_123"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              TOKEN de Acceso
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="••••••••••••••••••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {savedAlert && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Configuración guardada correctamente en el dispositivo.</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Credenciales</span>
            </button>

            {(appId || token) && (
              <button
                type="button"
                onClick={handleClearKeys}
                className="min-h-[44px] px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center"
                title="Limpiar credenciales"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Quick Test Samples */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Ejemplos válidos listos para probar</span>
        </div>
        <p className="text-xs text-slate-400">
          Toca cualquier ejemplo para transferirlo inmediatamente al campo de consulta:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleCedulas.map((item) => (
            <button
              key={`${item.prefix}-${item.value}`}
              type="button"
              onClick={() => onSelectSampleCedula(item.value, item.prefix)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 active:scale-95 transition-all text-left flex items-center justify-between"
            >
              <div>
                <span className="font-mono font-bold text-sm text-blue-400 block">
                  <span className="text-amber-400 font-black">{item.prefix}-</span>
                  {item.value}
                </span>
                <span className="text-[10px] text-slate-400 block">{item.label}</span>
              </div>
              <span className="text-[10px] bg-blue-950 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                Probar
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Validation Testing Sandbox */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Casos de prueba de formato incorrecto</span>
        </div>
        <p className="text-xs text-slate-400">
          Verifica cómo el sistema detecta cédulas incompletas o vacías antes de acudir a la API:
        </p>

        <div className="space-y-1.5">
          {testErrorCases.map((err) => (
            <button
              key={`${err.prefix}-${err.value || 'empty'}`}
              type="button"
              onClick={() => onSelectSampleCedula(err.value, err.prefix)}
              className="w-full p-2 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 active:scale-98 transition-all text-left flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-rose-300 font-bold">
                  {err.prefix}-{err.value || '(vacío)'}
                </span>
                <span className="text-[11px] text-slate-400">— {err.label}</span>
              </div>
              <span className="text-[10px] text-rose-400 font-medium">Test Error</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
