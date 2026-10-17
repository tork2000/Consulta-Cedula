import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  X,
  AlertCircle,
  Copy,
  Check,
  FileCode,
  Terminal,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'direct' | 'pwabuilder' | 'manifest'>('direct');
  const [copiedManifest, setCopiedManifest] = useState(false);

  if (!isOpen) return null;

  const manifestJsonContent = JSON.stringify(
    {
      id: '/',
      name: 'Cédula Venezuela - Consulta y Validación',
      short_name: 'Cédula VE',
      description: 'Aplicación Android para consulta, validación de formato (V/E con 8 dígitos) y datos de identidad con la API de cedula.com.ve.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#0f172a',
      theme_color: '#0d47a1',
      lang: 'es',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    null,
    2
  );

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestJsonContent);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const handleDownloadManifest = () => {
    const blob = new Blob([manifestJsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-100 relative max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-amber-400 font-black text-sm shadow-md">
              VE
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Instalar en Android / APK
              </h2>
              <p className="text-[11px] text-slate-400">Guía completa de instalación y empaquetado</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/70 rounded-xl my-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`py-2 px-1 rounded-lg font-bold text-center transition-all ${
              activeTab === 'direct'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. En Android
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pwabuilder')}
            className={`py-2 px-1 rounded-lg font-bold text-center transition-all ${
              activeTab === 'pwabuilder'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. PWABuilder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manifest')}
            className={`py-2 px-1 rounded-lg font-bold text-center transition-all ${
              activeTab === 'manifest'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Manifest
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {/* TAB 1: Direct Android Install (WebAPK) */}
          {activeTab === 'direct' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Método Oficial Directo (Recomendado)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No necesitas compilar un APK en la computadora. Google Chrome en Android convierte esta aplicación automáticamente en un <strong>WebAPK nativo</strong> instalado en el cajón de aplicaciones de tu teléfono.
                </p>

                {isInstalled ? (
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>¡La app ya está instalada en tu dispositivo!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await install();
                      onClose();
                    }}
                    className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Cédula VE en este Android</span>
                  </button>
                ) : (
                  <div className="bg-slate-900/80 border border-slate-700/60 p-3 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-amber-400">Pasos desde tu teléfono móvil:</p>
                    <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
                      <li>Abre el enlace de la aplicación en <strong>Google Chrome</strong> en tu Android.</li>
                      <li>Presiona el menú de <strong>tres puntos (⋮)</strong> arriba a la derecha.</li>
                      <li>Toca <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Agregar a la pantalla principal&quot;</strong>.</li>
                      <li>Aparecerá el ícono venezolano en tu pantalla de inicio y funcionará como una app instalada normal.</li>
                    </ol>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl text-xs space-y-1 text-slate-300">
                <span className="font-semibold text-white block">Ventajas de instalarlo directamente:</span>
                <p>• Ícono independiente con resolución HD.</p>
                <p>• Abre sin barra de navegación del navegador (pantalla completa nativa).</p>
                <p>• Conserva historial de consultas en el almacenamiento del teléfono.</p>
              </div>
            </div>
          )}

          {/* TAB 2: Why PWABuilder failed & How to fix */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>¿Por qué PWABuilder dio &quot;No tiene manifest&quot;?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  El enlace que colocaste (<code className="text-amber-200 text-[11px] bg-slate-950 px-1 py-0.5 rounded">ais-dev-...</code>) es el servidor privado de desarrollo de Google Cloud y <strong>requiere autenticación con tu cuenta de Google</strong>.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cuando el robot de PWABuilder intenta escanearlo desde internet, Google le muestra una página de inicio de sesión, por lo que PWABuilder no puede ver el código ni el manifest.
                </p>
              </div>

              <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-white block">Cómo generar el APK con PWABuilder:</span>
                <p className="text-slate-300 leading-relaxed">
                  Para que PWABuilder empaquete el APK automáticamente en la nube, el sitio debe estar en una URL pública sin bloqueo de Google (por ejemplo en Vercel, Netlify, Cloudflare o GitHub Pages, que son gratuitos):
                </p>
                <ol className="text-slate-300 space-y-1.5 list-decimal list-inside pl-1 text-[11px]">
                  <li>Ve a la pestaña <strong>3. Manifest</strong> y copia el manifest.</li>
                  <li>En PWABuilder, selecciona la opción para pegar el manifest directamente o usa tu dominio público.</li>
                  <li>PWABuilder compilará tu APK firmado listo para descargar en tu Android.</li>
                </ol>
              </div>

              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[42px] bg-slate-800 hover:bg-slate-750 active:scale-98 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700 shadow-sm"
              >
                <span>Abrir portal de PWABuilder</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </a>
            </div>
          )}

          {/* TAB 3: Manifest & Local Bubblewrap CLI APK */}
          {activeTab === 'manifest' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>manifest.json (100% Válido para Android)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyManifest}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-slate-200 flex items-center gap-1 border border-slate-700"
                  >
                    {copiedManifest ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadManifest}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1 shadow-sm"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>

              <pre className="p-2.5 bg-slate-950 rounded-xl text-[10px] font-mono text-emerald-400 border border-slate-800 max-h-40 overflow-y-auto">
                {manifestJsonContent}
              </pre>

              {/* Bubblewrap CLI Option */}
              <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <Terminal className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Compilar APK localmente con Bubblewrap (Google)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Si deseas generar el archivo <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300">.apk</code> en tu computadora sin depender de servicios externos:
                </p>
                <div className="p-2 bg-slate-950 rounded-lg font-mono text-[10px] text-slate-300 space-y-1">
                  <p className="text-slate-400"># Instalar herramienta oficial de Google</p>
                  <p className="text-amber-300">npm install -g @bubblewrap/cli</p>
                  <p className="text-slate-400"># Iniciar proyecto y generar APK</p>
                  <p className="text-amber-300">bubblewrap init --manifest=manifest.json</p>
                  <p className="text-amber-300">bubblewrap build</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PWA & WebAPK listo para Android</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white font-medium px-2 py-1 rounded"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
