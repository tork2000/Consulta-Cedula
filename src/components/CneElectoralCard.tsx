import React from 'react';
import { Vote, MapPin, Building, CheckCircle, Info } from 'lucide-react';
import { ElectoralData, CivilRegistryData } from '../types/cedula';

interface CneElectoralCardProps {
  cne: ElectoralData;
  registroCivil?: CivilRegistryData;
}

export const CneElectoralCard: React.FC<CneElectoralCardProps> = ({
  cne,
  registroCivil,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              Registro Electoral CNE
            </h3>
            <p className="text-[11px] text-slate-400">Consejo Nacional Electoral</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Habilitado</span>
        </div>
      </div>

      {/* Electoral Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>Ubicación Geográfica</span>
          </div>
          <p className="font-semibold text-white">{cne.estado || 'No especificado'}</p>
          <p className="text-slate-300 text-[11px]">
            {cne.municipio ? `Mun. ${cne.municipio}` : ''}
            {cne.parroquia ? ` · Pq. ${cne.parroquia}` : ''}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <Building className="w-3 h-3 text-blue-400" />
            <span>Centro de Votación</span>
          </div>
          <p className="font-semibold text-white line-clamp-2">
            {cne.centro_electoral || 'Centro Electoral Registrado'}
          </p>
          {cne.mesa && (
            <span className="inline-block mt-1 text-[10px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded font-mono">
              {cne.mesa}
            </span>
          )}
        </div>
      </div>

      {/* Registro Civil data if present */}
      {registroCivil && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Ley Orgánica de Registro Civil</span>
          </div>
          <div className="font-mono text-slate-300">
            {registroCivil.tomo && `${registroCivil.tomo} `}
            {registroCivil.folio && `${registroCivil.folio}`}
          </div>
        </div>
      )}
    </div>
  );
};
