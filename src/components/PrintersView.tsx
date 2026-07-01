import React, { useState } from "react";
import { 
  Printer as PrinterIcon, 
  Plus, 
  Settings, 
  Wrench, 
  Play, 
  Pause, 
  AlertTriangle, 
  Check, 
  Cpu, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Trash2,
  AlertOctagon
} from "lucide-react";
import { Impressora } from "../types";

interface PrintersViewProps {
  impressoras: Impressora[];
  onAddImpressora: (impressora: Omit<Impressora, "id">) => void;
  onDeleteImpressora: (id: string) => void;
  onExecuteMaintenance: (id: string, type: "lubrificacao" | "bico" | "correia") => void;
  onUpdatePrinterStatus: (id: string, status: Impressora["status"]) => void;
}

export function PrintersView({ impressoras, onAddImpressora, onDeleteImpressora, onExecuteMaintenance, onUpdatePrinterStatus }: PrintersViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("Creality");
  const [modelo, setModelo] = useState("");
  const [volX, setVolX] = useState(220);
  const [volY, setVolY] = useState(220);
  const [volZ, setVolZ] = useState(250);
  const [potencia, setPotencia] = useState(150);
  const [depreciacao, setDepreciacao] = useState(0.50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    onAddImpressora({
      nome,
      marca,
      modelo: modelo || nome,
      volumeX: volX,
      volumeY: volY,
      volumeZ: volZ,
      potencia,
      custoDepreciacaoHora: depreciacao,
      horasTotais: 0,
      horasDisponiveis: 24,
      horasDesdeManutencao: 0,
      status: "disponivel",
      manutencaoLubrificacao: 0,
      manutencaoTrocaBico: 0,
      manutencaoCorreia: 0
    });

    setNome("");
    setModelo("");
    setPotencia(150);
    setDepreciacao(0.50);
    setShowAddForm(false);
  };

  const getStatusBadge = (status: Impressora["status"]) => {
    const maps = {
      disponivel: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      imprimindo: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse",
      manutencao: "bg-red-500/10 text-red-400 border-red-500/20",
      ociosa: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border capitalize ${maps[status || "ociosa"]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === "disponivel" ? "bg-emerald-400" :
          status === "imprimindo" ? "bg-cyan-400" :
          status === "manutencao" ? "bg-red-400" : "bg-amber-400"
        }`}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Painel de Impressoras & Telemetria</h2>
          <p className="text-xs text-slate-400">Monitore sua farm de impressão, controle o consumo de watts, depreciação e previna paradas com a manutenção planejada</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brand-orange text-white hover:bg-brand-orange/90 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          {showAddForm ? "Cancelar cadastro" : "Cadastrar Impressora"}
        </button>
      </div>

      {/* Add Printer Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-950 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">
            Cadastrar Nova Impressora na Farm
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Identificador *</label>
              <input 
                type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ender 3 - Lote B"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Marca</label>
              <select 
                value={marca} onChange={(e) => setMarca(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value="Creality">Creality</option>
                <option value="Bambu Lab">Bambu Lab</option>
                <option value="Elegoo">Elegoo</option>
                <option value="Prusa">Prusa</option>
                <option value="Sethi3D">Sethi3D</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Modelo Técnico</label>
              <input 
                type="text" value={modelo} onChange={(e) => setModelo(e.target.value)}
                placeholder="Ex: Ender 3 S1 Pro"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Consumo Elétrico (Watts)</label>
              <input 
                type="number" value={potencia} onChange={(e) => setPotencia(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-center"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 md:col-span-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Eixo X (mm)</label>
                <input 
                  type="number" value={volX} onChange={(e) => setVolX(Number(e.target.value))}
                  className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Eixo Y (mm)</label>
                <input 
                  type="number" value={volY} onChange={(e) => setVolY(Number(e.target.value))}
                  className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Eixo Z (mm)</label>
                <input 
                  type="number" value={volZ} onChange={(e) => setVolZ(Number(e.target.value))}
                  className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Custo Depreciação / Hora (R$)</label>
              <input 
                type="number" step="0.05" value={depreciacao} onChange={(e) => setDepreciacao(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-center"
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
              Lançar Impressora
            </button>
          </div>
        </form>
      )}

      {/* Printer List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {impressoras.map((imp) => {
          // Automatic alert checks
          const lubeHours = imp.manutencaoLubrificacao || 0;
          const nozzleHours = imp.manutencaoTrocaBico || 0;
          const beltHours = imp.manutencaoCorreia || 0;

          const needsLube = lubeHours >= 80;
          const needsNozzle = nozzleHours >= 150;
          const needsBelt = beltHours >= 300;

          const totalWarnings = (needsLube ? 1 : 0) + (needsNozzle ? 1 : 0) + (needsBelt ? 1 : 0);

          return (
            <div 
              key={imp.id} 
              className={`bg-slate-900 border rounded-2xl p-5 space-y-4 hover:border-slate-800 transition-all ${
                totalWarnings > 0 ? "border-amber-500/20" : "border-slate-950"
              }`}
            >
              {/* Header section with brand and status */}
              <div className="flex justify-between items-start pb-2.5 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                    <span>{imp.marca}</span>
                    <span>•</span>
                    <span>{imp.volumeX}x{imp.volumeY}x{imp.volumeZ}mm</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-100 mt-1 leading-none">{imp.nome}</h4>
                </div>
                {getStatusBadge(imp.status)}
              </div>

              {/* Hardware specifications & metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-slate-400 text-[10px] bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block font-bold leading-none mb-1">Horas Totais</span>
                  <span className="font-mono text-xs font-black text-slate-200">{imp.horasTotais || 0}h</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block font-bold leading-none mb-1">Consumo</span>
                  <span className="font-mono text-xs font-black text-cyan-400">{imp.potencia}W</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block font-bold leading-none mb-1">Depreciação</span>
                  <span className="font-mono text-xs font-black text-emerald-400">R$ {(imp.custoDepreciacaoHora || 0.5).toFixed(2)}/h</span>
                </div>
              </div>

              {/* Maintenance checklist section */}
              <div className="space-y-2.5 pt-1">
                <h5 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Wrench size={12} className="text-slate-400 shrink-0" />
                  Preventiva (Tempo desde última revisão)
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Lubrificacao */}
                  <div className={`p-2 rounded-xl border flex flex-col justify-between ${
                    needsLube ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-slate-950 border-slate-850 text-slate-400"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] uppercase font-bold">Lubrificação</span>
                      {needsLube && <AlertTriangle size={10} className="shrink-0 text-amber-500" />}
                    </div>
                    <span className="font-mono text-xs font-bold block my-1">{lubeHours}h / 80h</span>
                    <button 
                      onClick={() => onExecuteMaintenance(imp.id, "lubrificacao")}
                      className={`w-full py-0.5 mt-1 rounded text-[8px] uppercase tracking-wide font-extrabold cursor-pointer transition-all ${
                        needsLube ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400" : "bg-slate-900 hover:bg-slate-850 text-slate-300"
                      }`}
                    >
                      Revisado
                    </button>
                  </div>

                  {/* Troca de Bico */}
                  <div className={`p-2 rounded-xl border flex flex-col justify-between ${
                    needsNozzle ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-slate-950 border-slate-850 text-slate-400"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] uppercase font-bold">Troca de Bico</span>
                      {needsNozzle && <AlertOctagon size={10} className="shrink-0 text-red-500" />}
                    </div>
                    <span className="font-mono text-xs font-bold block my-1">{nozzleHours}h / 150h</span>
                    <button 
                      onClick={() => onExecuteMaintenance(imp.id, "bico")}
                      className={`w-full py-0.5 mt-1 rounded text-[8px] uppercase tracking-wide font-extrabold cursor-pointer transition-all ${
                        needsNozzle ? "bg-red-500/20 hover:bg-red-500/30 text-red-400" : "bg-slate-900 hover:bg-slate-850 text-slate-300"
                      }`}
                    >
                      Trocar bico
                    </button>
                  </div>

                  {/* Correias */}
                  <div className={`p-2 rounded-xl border flex flex-col justify-between ${
                    needsBelt ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-slate-950 border-slate-850 text-slate-400"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] uppercase font-bold">Ajuste Correia</span>
                      {needsBelt && <AlertTriangle size={10} className="shrink-0 text-amber-500" />}
                    </div>
                    <span className="font-mono text-xs font-bold block my-1">{beltHours}h / 300h</span>
                    <button 
                      onClick={() => onExecuteMaintenance(imp.id, "correia")}
                      className={`w-full py-0.5 mt-1 rounded text-[8px] uppercase tracking-wide font-extrabold cursor-pointer transition-all ${
                        needsBelt ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400" : "bg-slate-900 hover:bg-slate-850 text-slate-300"
                      }`}
                    >
                      Ajustado
                    </button>
                  </div>
                </div>
              </div>

              {/* Status and management buttons */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[10px]">
                <div className="flex gap-1">
                  <button 
                    onClick={() => onUpdatePrinterStatus(imp.id, "disponivel")}
                    className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer border ${
                      imp.status === "disponivel" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                    }`}
                  >
                    Disponível
                  </button>
                  <button 
                    onClick={() => onUpdatePrinterStatus(imp.id, "manutencao")}
                    className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer border ${
                      imp.status === "manutencao" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                    }`}
                  >
                    Manutenção
                  </button>
                </div>

                <button 
                  onClick={() => onDeleteImpressora(imp.id)}
                  className="text-slate-600 hover:text-red-400 transition-all cursor-pointer p-0.5 rounded"
                  title="Remover impressora"
                >
                  <Trash2 size={13} />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
