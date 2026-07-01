import React, { useState } from "react";
import { 
  Plus, 
  Activity, 
  Clock, 
  User, 
  Printer as PrinterIcon, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  TrendingUp, 
  ShieldAlert, 
  Check, 
  X,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Pedido, Impressora, Cliente } from "../types";

interface KanbanViewProps {
  pedidos: Pedido[];
  impressoras: Impressora[];
  clientes: Cliente[];
  onUpdateStatus: (id: string, nextStatus: Pedido["status"]) => void;
  onIncrementFail: (id: string) => void;
  onAddPedido: (pedido: Omit<Pedido, "id" | "data">) => void;
}

const COLUNAS: { key: Pedido["status"]; label: string; color: string }[] = [
  { key: "pagamento", label: "Pagamento", color: "border-t-amber-500 bg-amber-500/5 text-amber-400" },
  { key: "fila", label: "Fila", color: "border-t-blue-500 bg-blue-500/5 text-blue-400" },
  { key: "imprimindo", label: "Imprimindo", color: "border-t-cyan-500 bg-cyan-500/5 text-cyan-400" },
  { key: "pos-processamento", label: "Pós-Proc.", color: "border-t-violet-500 bg-violet-500/5 text-violet-400" },
  { key: "embalando", label: "Embalando", color: "border-t-pink-500 bg-pink-500/5 text-pink-400" },
  { key: "enviado", label: "Enviado", color: "border-t-indigo-500 bg-indigo-500/5 text-indigo-400" },
  { key: "entregue", label: "Entregue", color: "border-t-emerald-500 bg-emerald-500/5 text-emerald-400" },
  { key: "cancelado", label: "Cancelado", color: "border-t-red-500 bg-red-500/5 text-red-400" }
];

export function KanbanView({ pedidos, impressoras, clientes, onUpdateStatus, onIncrementFail, onAddPedido }: KanbanViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [titulo, setTitulo] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [tempoPrevisto, setTempoPrevisto] = useState(180);
  const [operador, setOperador] = useState("Daniel S.");
  const [impressoraId, setImpressoraId] = useState("");
  const [totalPago, setTotalPago] = useState(85.00);
  const [pesoG, setPesoG] = useState(50);
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !clienteId) return;

    const cliente = clientes.find(c => c.id === clienteId);
    
    onAddPedido({
      titulo,
      clienteId,
      clienteNome: cliente ? cliente.nome : "Cliente Geral",
      status: "pagamento",
      tempoPrevistoMinutos: tempoPrevisto,
      tempoRealMinutos: 0,
      falhasCount: 0,
      observacoes,
      operador,
      impressoraId: impressoraId || (impressoras[0] ? impressoras[0].id : ""),
      totalPago,
      lucroLiquido: totalPago * 0.65, // simulated 65% markup
      pesoG
    });

    // Reset
    setTitulo("");
    setClienteId("");
    setTempoPrevisto(180);
    setObservacoes("");
    setTotalPago(85);
    setPesoG(50);
    setShowAddForm(false);
  };

  // Move status helpers
  const handleMoveForward = (id: string, current: Pedido["status"]) => {
    const sequence: Pedido["status"][] = ["pagamento", "fila", "imprimindo", "pos-processamento", "embalando", "enviado", "entregue"];
    const idx = sequence.indexOf(current);
    if (idx !== -1 && idx < sequence.length - 1) {
      onUpdateStatus(id, sequence[idx + 1]);
    }
  };

  const handleMoveBackward = (id: string, current: Pedido["status"]) => {
    const sequence: Pedido["status"][] = ["pagamento", "fila", "imprimindo", "pos-processamento", "embalando", "enviado", "entregue"];
    const idx = sequence.indexOf(current);
    if (idx > 0) {
      onUpdateStatus(id, sequence[idx - 1]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Painel Kanban de Produção</h2>
          <p className="text-xs text-slate-400">Gerenciamento ágil da farm de impressão: rastreie o status de fabricação, controle falhas e atribua operadores</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brand-orange text-white hover:bg-brand-orange/90 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          {showAddForm ? "Cancelar ordem" : "Novo Pedido / Ordem"}
        </button>
      </div>

      {/* Production performance overview bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-950 p-4.5 rounded-2xl text-[11px] text-slate-400">
        <div>
          <span className="block font-bold text-[9px] uppercase text-slate-500">Impressões Ativas</span>
          <span className="text-lg font-black font-mono text-slate-200">
            {pedidos.filter(p => p.status === "imprimindo").length} peças
          </span>
        </div>
        <div>
          <span className="block font-bold text-[9px] uppercase text-slate-500">Aguardando Fila</span>
          <span className="text-lg font-black font-mono text-cyan-400">
            {pedidos.filter(p => p.status === "fila").length} na fila
          </span>
        </div>
        <div>
          <span className="block font-bold text-[9px] uppercase text-slate-500">Taxa de Sucesso da Farm</span>
          <span className="text-lg font-black font-mono text-emerald-400">
            {Math.max(88, 100 - (pedidos.reduce((acc, p) => acc + p.falhasCount, 0) / Math.max(1, pedidos.length)) * 100).toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="block font-bold text-[9px] uppercase text-slate-500">Eficiência Operador</span>
          <span className="text-lg font-black font-mono text-brand-orange">Excelente (98%)</span>
        </div>
      </div>

      {/* Add Order Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-950 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">
            Lançar Ordem de Serviço na Farm
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Título do Pedido *</label>
              <input 
                type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Hollow Knight Pintado - Lote 1"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Selecionar Cliente *</label>
              <select 
                required value={clienteId} onChange={(e) => setClienteId(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value="">Selecione um cliente CRM...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Impressora Principal</label>
              <select 
                value={impressoraId} onChange={(e) => setImpressoraId(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value="">Selecione uma impressora...</option>
                {impressoras.map(imp => (
                  <option key={imp.id} value={imp.id}>{imp.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Operador Responsável</label>
              <select 
                value={operador} onChange={(e) => setOperador(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                <option value="Daniel S.">Daniel S. (Sênior)</option>
                <option value="Carla M.">Carla M. (Pós-Proc)</option>
                <option value="Julio R.">Julio R. (Auxiliar)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tempo Previsto de Impressão (min)</label>
              <input 
                type="number" value={tempoPrevisto} onChange={(e) => setTempoPrevisto(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Peso Total da Peça (g)</label>
              <input 
                type="number" value={pesoG} onChange={(e) => setPesoG(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Total Cobrado (R$)</label>
              <input 
                type="number" value={totalPago} onChange={(e) => setTotalPago(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Observações Rápidas</label>
              <input 
                type="text" value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Peça sensível. Requer brim de 5mm."
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button 
              type="button" onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold bg-brand-orange text-white hover:bg-brand-orange/90 transition-all shadow-md cursor-pointer"
            >
              Iniciar Ordem
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 select-none">
        {COLUNAS.map((col) => {
          const pedidosNaCol = pedidos.filter(p => p.status === col.key);
          return (
            <div 
              key={col.key} 
              className="w-72 shrink-0 flex flex-col max-h-[640px] bg-slate-950 rounded-2xl border border-slate-900/60"
            >
              {/* Column Header */}
              <div className={`p-3 rounded-t-2xl border-t-2 ${col.color} flex items-center justify-between font-bold text-[11px] uppercase tracking-wider`}>
                <span>{col.label}</span>
                <span className="font-mono bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-slate-400">
                  {pedidosNaCol.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="p-2 space-y-2.5 overflow-y-auto flex-1 min-h-[200px]">
                {pedidosNaCol.length === 0 ? (
                  <div className="text-center py-6 text-slate-650 text-[10px] border border-dashed border-slate-900/40 rounded-xl">
                    Sem ordens nesta etapa
                  </div>
                ) : (
                  pedidosNaCol.map((p) => {
                    const linkedImp = impressoras.find(i => i.id === p.impressoraId);
                    return (
                      <div 
                        key={p.id} 
                        className="bg-slate-900/90 border border-slate-950 p-3.5 rounded-xl space-y-3 hover:border-slate-800 transition-all"
                      >
                        {/* Title and ID */}
                        <div>
                          <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-500">
                            <span>{p.id}</span>
                            <span className="text-slate-400 font-sans">{new Date(p.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
                          </div>
                          <h5 className="font-extrabold text-slate-200 text-xs mt-1 leading-normal">{p.titulo}</h5>
                          <span className="text-[10px] text-brand-orange font-bold truncate block mt-0.5">{p.clienteNome}</span>
                        </div>

                        {/* Telemetry metadata */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 border-t border-b border-white/5 py-1.5 font-sans">
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-slate-500 shrink-0" />
                            {Math.floor(p.tempoPrevistoMinutos / 60)}h{p.tempoPrevistoMinutos % 60}m
                          </span>
                          <span className="flex items-center gap-1 font-semibold truncate text-[9px] text-slate-300">
                            <PrinterIcon size={11} className="text-slate-500 shrink-0" />
                            {linkedImp ? linkedImp.nome.split(" ")[0] : "Farm 3D"}
                          </span>
                        </div>

                        {/* Fail counter and Operator */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <User size={10} />
                            {p.operador}
                          </span>
                          
                          <button 
                            onClick={() => onIncrementFail(p.id)}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/10 cursor-pointer"
                            title="Registar Falha na Impressora"
                          >
                            <AlertCircle size={10} />
                            Falhas: {p.falhasCount}
                          </button>
                        </div>

                        {p.observacoes && (
                          <p className="text-[9px] text-slate-500 italic bg-slate-950 p-1.5 rounded leading-normal border-l border-brand-orange/40">
                            "{p.observacoes}"
                          </p>
                        )}

                        {/* Kanban Actions */}
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          {p.status !== "pagamento" && p.status !== "cancelado" ? (
                            <button 
                              onClick={() => handleMoveBackward(p.id, p.status)}
                              className="p-1 bg-slate-950 text-slate-400 hover:text-white rounded border border-slate-850 cursor-pointer"
                              title="Voltar etapa"
                            >
                              <ChevronLeft size={12} />
                            </button>
                          ) : <div />}

                          <div className="flex gap-1">
                            {p.status !== "cancelado" && p.status !== "entregue" && (
                              <button 
                                onClick={() => onUpdateStatus(p.id, "cancelado")}
                                className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[8px] font-bold rounded cursor-pointer hover:bg-red-500/20 border border-red-500/10 uppercase"
                              >
                                Cancelar
                              </button>
                            )}

                            {p.status !== "entregue" && p.status !== "cancelado" ? (
                              <button 
                                onClick={() => handleMoveForward(p.id, p.status)}
                                className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 font-black rounded cursor-pointer hover:bg-emerald-500/25 flex items-center gap-0.5 border border-emerald-500/15 uppercase text-[8px]"
                              >
                                Avançar
                                <ChevronRight size={10} />
                              </button>
                            ) : (
                              <span className="text-[8px] font-bold text-emerald-500 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                                <Check size={8} /> Concluído
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
