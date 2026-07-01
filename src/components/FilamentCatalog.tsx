import React, { useState } from "react";
import { Filamento } from "../types";
import { Plus, Trash2, Edit2, Check, X, ShieldAlert, Award } from "lucide-react";

interface FilamentCatalogProps {
  filamentos: Filamento[];
  onAddFilamento: (f: Omit<Filamento, "id">) => void;
  onDeleteFilamento: (id: string) => void;
  onUpdateFilamento: (f: Filamento) => void;
  selectedFilamentoId: string;
  onSelectFilamento: (id: string) => void;
}

export function FilamentCatalog({
  filamentos,
  onAddFilamento,
  onDeleteFilamento,
  onUpdateFilamento,
  selectedFilamentoId,
  onSelectFilamento,
}: FilamentCatalogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for new/edit
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [tipo, setTipo] = useState("PLA");
  const [preco, setPreco] = useState(120);
  const [peso, setPeso] = useState(1000);
  const [cor, setCor] = useState("#3B82F6");

  const startAdd = () => {
    setNome("");
    setMarca("");
    setTipo("PLA");
    setPreco(120);
    setPeso(1000);
    setCor("#10B981");
    setIsAdding(true);
  };

  const saveNew = () => {
    if (!nome.trim()) return;
    onAddFilamento({
      nome,
      marca: marca || "Genérico",
      tipo,
      preco: Number(preco) || 0,
      peso: Number(peso) || 1,
      cor,
    });
    setIsAdding(false);
  };

  const startEdit = (f: Filamento) => {
    setEditingId(f.id);
    setNome(f.nome);
    setMarca(f.marca);
    setTipo(f.tipo);
    setPreco(f.preco);
    setPeso(f.peso);
    setCor(f.cor || "#3B82F6");
  };

  const saveEdit = (id: string) => {
    if (!nome.trim()) return;
    onUpdateFilamento({
      id,
      nome,
      marca,
      tipo,
      preco: Number(preco) || 0,
      peso: Number(peso) || 1,
      cor,
    });
    setEditingId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 duration-200 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 form-card-contrast">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="flex w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse"></span>
            Catálogo de Filamentos
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Selecione ou gerencie seus rolos de filamento e resina
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

      {/* Add Filament Form Panel */}
      {isAdding && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Adicionar Novo Filamento / Resina
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Nome do Filamento *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: PLA Premium Max"
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-brand-teal"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: 3D Fila, Esun"
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Material</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white"
              >
                <option value="PLA">PLA</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
                <option value="TPU">TPU (Flex)</option>
                <option value="ASA">ASA</option>
                <option value="Nylon">Nylon</option>
                <option value="Resina">Resina UV</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Preço do Rolo (R$)</label>
              <input
                type="number"
                value={preco}
                onChange={(e) => setPreco(Number(e.target.value))}
                min="0"
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Peso Total (g)</label>
              <input
                type="number"
                value={peso}
                onChange={(e) => setPeso(Number(e.target.value))}
                min="1"
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-900 dark:text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Cor</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer overflow-hidden bg-transparent"
                />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{cor.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-1.5 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <X size={13} /> Cancelar
            </button>
            <button
              onClick={saveNew}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Check size={13} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Edit Filament inline Form Panel */}
      {editingId && !isAdding && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Editar Filamento
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Nome do Filamento</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-slate-900 dark:text-white-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Material</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-slate-900 dark:text-white"
              >
                <option value="PLA">PLA</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
                <option value="TPU">TPU (Flex)</option>
                <option value="ASA">ASA</option>
                <option value="Nylon">Nylon</option>
                <option value="Resina">Resina UV</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Preço (R$)</label>
              <input
                type="number"
                value={preco}
                onChange={(e) => setPreco(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Peso Total (g)</label>
              <input
                type="number"
                value={peso}
                onChange={(e) => setPeso(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-slate-900 dark:text-white"
              />
            </div>
            <div className="col-span-2 col-start-1">
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Cor</label>
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-8 h-8 rounded-md bg-transparent border border-slate-200 dark:border-slate-700 cursor-pointer overflow-hidden"
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
              Concluir
            </button>
          </div>
        </div>
      )}

      {/* Grid List representation */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {filamentos.map((fil) => {
          const isSelected = selectedFilamentoId === fil.id;
          const precoPorG = fil.preco / fil.peso;

          return (
            <div
              key={fil.id}
              onClick={() => onSelectFilamento(fil.id)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-brand-teal bg-brand-teal/5 dark:bg-brand-teal/10 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {/* Visual indicator color */}
                <div
                  className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0 relative shadow-inner"
                  style={{ backgroundColor: fil.cor || "#64748B" }}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold bg-black/3c rounded-full">
                      ✓
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline space-x-1.5">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {fil.nome}
                    </h5>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase py-0.5 px-1 bg-slate-100 dark:bg-slate-850 rounded">
                      {fil.tipo}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {fil.marca} • {fil.peso}g por rolo
                  </p>
                </div>
              </div>

              {/* Cost per unit representation */}
              <div className="flex items-center space-x-3 ml-3 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    R$ {fil.preco.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    (R$ {precoPorG.toFixed(4)}/g)
                  </div>
                </div>

                {/* Edit & Delete Controls (Hide if editing something else to simplify state) */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(fil);
                    }}
                    disabled={editingId !== null || isAdding}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-sky-600 disabled:opacity-30"
                    title="Editar"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFilamento(fil.id);
                    }}
                    disabled={filamentos.length <= 1 || editingId !== null || isAdding}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded text-slate-400 hover:text-red-600 disabled:opacity-30"
                    title="Excluir"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
