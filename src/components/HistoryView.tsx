import React, { useState } from 'react';
import { History, Trash2, ArrowUpRight, Search, ShieldCheck } from 'lucide-react';
import { QueryHistoryItem } from '../types/cedula';

interface HistoryViewProps {
  history: QueryHistoryItem[];
  onSelectHistory: (item: QueryHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectHistory,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  const [filterText, setFilterText] = useState('');

  const filtered = history.filter((item) => {
    const q = filterText.toLowerCase();
    return (
      item.cedula_completa.toLowerCase().includes(q) ||
      item.nombre_completo.toLowerCase().includes(q) ||
      item.rif.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">Historial de Consultas</h2>
          <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">
            {history.length}
          </span>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="min-h-[36px] px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Borrar todo</span>
          </button>
        )}
      </div>

      {history.length > 1 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filtrar por cédula, nombre o RIF..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {history.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <History className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Sin consultas registradas</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Las cédulas venezolanas que consultes se guardarán automáticamente aquí para acceso rápido sin conexión.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6 text-center bg-slate-900/40 rounded-xl text-xs text-slate-400">
          No se encontraron resultados para &quot;{filterText}&quot;.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all shadow-sm flex items-center justify-between gap-3 group"
            >
              <button
                type="button"
                onClick={() => onSelectHistory(item)}
                className="flex-1 text-left flex items-start gap-3 min-w-0"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-amber-400 font-black text-xs shrink-0">
                  {item.nacionalidad}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">
                      {item.cedula_completa}
                    </span>
                    <span className="text-[10px] bg-slate-800 text-blue-400 font-mono px-1.5 py-0.5 rounded">
                      {item.rif}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                    {item.nombre_completo}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>{new Date(item.timestamp).toLocaleString('es-VE')}</span>
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectHistory(item)}
                  className="min-h-[38px] px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Ver cédula"
                >
                  <span>Ver</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistoryItem(item.id);
                  }}
                  className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Eliminar de historial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
