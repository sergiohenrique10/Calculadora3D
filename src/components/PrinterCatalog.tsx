import React, { useState } from "react";
import { Impressora } from "../types";
import { Plus, Trash2, Edit2, Check, X, Ruler } from "lucide-react";

interface PrinterCatalogProps {
  impressoras: Impressora[];
  onAddImpressora: (p: Omit<Impressora, "id">) => void;
  onDeleteImpressora: (id: string) => void;
  onUpdateImpressora: (p: Impressora) => void;
  selectedImpressoraId: string;
  onSelectImpressora: (id: string) => void;
}

export function PrinterCatalog({
  impressoras,
  onAddImpressora,
  onDeleteImpressora,
  onUpdateImpressora,
  selectedImpressoraId,
  onSelectImpressora,
}: PrinterCatalogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [potencia, setPotencia] = useState(150);
  const [custoDepreciacaoHora, setCustoDepreciacaoHora] = useState(0.4);

  const startAdd = () => {
    setNome("");
    setPotencia(150);
    setCustoDepreciacaoHora(0.4);
    setIsAdding(true);
  };

  const saveNew = () => {
    if (!nome.trim()) return;
    onAddImpressora({
      nome,
      potencia: Number(potencia) || 50,
      custoDepreciacaoHora: Number(custoDepreciacaoHora) || 0,
    });
    setIsAdding(false);
  };

  const startEdit = (p: Impressora) => {
    setEditingId(p.id);
    setNome(p.nome);
    setPotencia(p.potencia);
    setCustoDepreciacaoHora(p.custoDepreciacaoHora);
  };

  const saveEdit = (id: string) => {
    if (!nome.trim()) return;
    onUpdateImpressora({
      id,
      nome,
      potencia: Number(potencia) || 50,
      custoDepreciacaoHora: Number(custoDepreciacaoHora) || 0,
    });
    setEditingId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 duration-200 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="flex w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse"></span>
            Perfis de Impressoras
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Associe o consumo elétrico e depreciação física da máquina
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={startAdd}
            className="flex items-center gap-1 bg-brand-teal/10 hover:bg-brand-teal/15 text-brand-teal dark:bg-brand-teal/20 dark:hover:bg-brand-teal/30 dark:text-brand-teal text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={14} /> Novo
          </button>
        )}
      </div>

      {/* Add Printer Form */}
      {isAdding && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Adicionar Perfil de Impressora
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-slate-500">Nome / Identificação *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ender 3 Neo, Bambu Lab X1E"
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Potência Média (Watts)</label>
              <input
                type="number"
                value={potencia}
                onChange={(e) => setPotencia(Number(e.target.value))}
                min="10"
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Depreciação/Hora (R$)</label>
              <input
                type="number"
                value={custoDepreciacaoHora}
                onChange={(e) => setCustoDepreciacaoHora(Number(e.target.value))}
                step="0.05"
                min="0"
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white"
                title="Custo estimado de desgaste de bicos, correias, energia de aquecimento auxiliar, graxas e reparos a cada hora de uso."
              />
            </div>
          </div>
          <div className="flex justify-end gap-1.5 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={saveNew}
              className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Edit Printer Form inline */}
      {editingId && !isAdding && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Editar Impressora
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-slate-500">Nome / Identificação</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Potência (Watts)</label>
              <input
                type="number"
                value={potencia}
                onChange={(e) => setPotencia(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500">Depreciação/Hora (R$)</label>
              <input
                type="number"
                value={custoDepreciacaoHora}
                onChange={(e) => setCustoDepreciacaoHora(Number(e.target.value))}
                step="0.05"
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200"
              />
            </div>
          </div>
          <div className="flex justify-end gap-1.5 pt-2">
            <button
              onClick={() => setEditingId(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-650"
            >
              Cancelar
            </button>
            <button
              onClick={() => saveEdit(editingId)}
              className="px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Parar
            </button>
          </div>
        </div>
      )}

      {/* List printers */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {impressoras.map((imp) => {
          const isSelected = selectedImpressoraId === imp.id;

          return (
            <div
              key={imp.id}
              onClick={() => onSelectImpressora(imp.id)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-brand-teal bg-brand-teal/5 dark:bg-brand-teal/10 shadow-sm"
                  : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="p-2 rounded-lg bg-brand-teal/10 text-brand-teal flex-shrink-0">
                  <Ruler size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {imp.nome}
                  </h5>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Consumo: {imp.potencia}W • Deprec: R$ {imp.custoDepreciacaoHora.toFixed(2)}/h
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 ml-3 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(imp);
                  }}
                  disabled={editingId !== null || isAdding}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-slate-400 hover:text-brand-orange transition-colors disabled:opacity-30"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImpressora(imp.id);
                  }}
                  disabled={impressoras.length <= 1 || editingId !== null || isAdding}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded text-slate-400 hover:text-red-600 transition-colors disabled:opacity-30"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
