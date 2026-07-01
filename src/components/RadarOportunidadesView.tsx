import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Percent, 
  ShieldAlert, 
  Check, 
  Trash2, 
  Gauge, 
  Sparkles, 
  AlertTriangle,
  Lightbulb
} from "lucide-react";

interface Oportunidade {
  id: string;
  produto: string;
  categoria: string;
  demanda: "baixa" | "media" | "alta";
  concorrencia: "baixa" | "media" | "alta";
  tempoImpressaoMinutos: number;
  margemLucroPercent: number;
  escalabilidade: "critica" | "boa" | "excelente";
  observacoes: string;
  notaGeral: number; // 0-100 calculated
}

const INITIAL_OPORTUNIDADES: Oportunidade[] = [
  {
    id: "op-1",
    produto: "Miniaturas RPG em Lote (Resina)",
    categoria: "Colecionáveis",
    demanda: "alta",
    concorrencia: "media",
    tempoImpressaoMinutos: 180,
    margemLucroPercent: 120,
    escalabilidade: "excelente",
    observacoes: "Público geek é extremamente fiel. Resina exige cura de alta qualidade.",
    notaGeral: 92
  },
  {
    id: "op-2",
    produto: "Luminária de Cabeceira Art Déco",
    categoria: "Decoração",
    demanda: "alta",
    concorrencia: "alta",
    tempoImpressaoMinutos: 720,
    margemLucroPercent: 85,
    escalabilidade: "boa",
    observacoes: "Vende muito em canais de marketplace, mas o tempo longo de fatiamento amarra a máquina.",
    notaGeral: 74
  },
  {
    id: "op-3",
    produto: "Cortadores de Argila de Luxo",
    categoria: "Decoração",
    demanda: "media",
    concorrencia: "baixa",
    tempoImpressaoMinutos: 45,
    margemLucroPercent: 180,
    escalabilidade: "excelente",
    observacoes: "Impressão extremamente rápida (bico 0.6). Baixíssima concorrência.",
    notaGeral: 96
  },
  {
    id: "op-4",
    produto: "Suportes Estetoscópio Médicos",
    categoria: "Industrial",
    demanda: "baixa",
    concorrencia: "baixa",
    tempoImpressaoMinutos: 110,
    margemLucroPercent: 200,
    escalabilidade: "boa",
    observacoes: "Nicho bem fechado. Margem gigante por peça faturada.",
    notaGeral: 81
  }
];

export function RadarOportunidadesView() {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>(INITIAL_OPORTUNIDADES);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [produto, setProduto] = useState("");
  const [categoria, setCategoria] = useState("Colecionáveis");
  const [demanda, setDemanda] = useState<"baixa" | "media" | "alta">("alta");
  const [concorrencia, setConcorrencia] = useState<"baixa" | "media" | "alta">("media");
  const [tempo, setTempo] = useState(120);
  const [margem, setMargem] = useState(100);
  const [escalabilidade, setEscalabilidade] = useState<"critica" | "boa" | "excelente">("excelente");
  const [observacoes, setObservacoes] = useState("");

  const calculateScore = (d: string, c: string, m: number, e: string, t: number) => {
    let score = 50; // base

    // Demanda
    if (d === "alta") score += 20;
    if (d === "baixa") score -= 15;

    // Concorrencia
    if (c === "baixa") score += 20;
    if (c === "alta") score -= 15;

    // Escalabilidade (tempo menor ou escalabilidade melhor)
    if (e === "excelente") score += 15;
    if (e === "critica") score -= 15;

    // Margem
    if (m > 120) score += 10;
    if (m < 50) score -= 15;

    // Tempo de impressao
    if (t < 60) score += 5; // muito rapida
    if (t > 480) score -= 5; // muito lenta

    return Math.max(0, Math.min(100, score));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produto) return;

    const nota = calculateScore(demanda, concorrencia, margem, escalabilidade, tempo);

    const newItem: Oportunidade = {
      id: `op-${Date.now()}`,
      produto,
      categoria,
      demanda,
      concorrencia,
      tempoImpressaoMinutos: tempo,
      margemLucroPercent: margem,
      escalabilidade,
      observacoes,
      notaGeral: nota
    };

    setOportunidades([newItem, ...oportunidades]);
    setProduto("");
    setObservacoes("");
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setOportunidades(oportunidades.filter(o => o.id !== id));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 75) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Radar de Oportunidades 3D</h2>
          <p className="text-xs text-slate-400">Descubra e simule novos produtos com base no índice de demanda, concorrência e escalabilidade para focar no que gera mais lucro</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brand-orange text-white hover:bg-brand-orange/90 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          {showAddForm ? "Cancelar simulação" : "Simular Produto / STL"}
        </button>
      </div>

      {/* Add Opportunity form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-950 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">
            Lançar Produto no Simulador de Mercado
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Produto</label>
              <input 
                type="text" required value={produto} onChange={(e) => setProduto(e.target.value)}
                placeholder="Ex: Coleção Pokémon Chibi Lote"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
              <select 
                value={categoria} onChange={(e) => setCategoria(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                <option value="Colecionáveis">Colecionáveis</option>
                <option value="Organizadores">Organizadores</option>
                <option value="Industrial">Industrial</option>
                <option value="Decoração">Decoração</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Volume de Demanda</label>
              <select 
                value={demanda} onChange={(e) => setDemanda(e.target.value as any)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                <option value="alta">Alta Demanda (Tendência viral / Fã-clube)</option>
                <option value="media">Média Demanda (Estável)</option>
                <option value="baixa">Baixa Demanda (Público de nicho)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Densidade de Concorrentes</label>
              <select 
                value={concorrencia} onChange={(e) => setConcorrencia(e.target.value as any)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                <option value="baixa">Baixa (Pouca gente vendendo)</option>
                <option value="media">Média (Mercado padrão)</option>
                <option value="alta">Alta (Muitos hubs faturando igual)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tempo Médio Estimado (minutos)</label>
              <input 
                type="number" value={tempo} onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Margem Operacional (%)</label>
              <input 
                type="number" value={margem} onChange={(e) => setMargem(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Escalabilidade de Fabricação</label>
              <select 
                value={escalabilidade} onChange={(e) => setEscalabilidade(e.target.value as any)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                <option value="excelente">Excelente (Sem suporte, sem montagem)</option>
                <option value="boa">Boa (Fácil de produzir)</option>
                <option value="critica">Crítica (Exige muita lixa / pós-processo)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Observações de Campo</label>
              <input 
                type="text" value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: É um brinquedo articulado que agrada pais e crianças."
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
              Calcular Nota Geral
            </button>
          </div>
        </form>
      )}

      {/* Opportunities List Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {oportunidades.map((op) => (
          <div key={op.id} className="bg-slate-900 border border-slate-950 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-800 transition-all">
            {/* Header info */}
            <div>
              <div className="flex justify-between items-start pb-2.5 border-b border-white/5">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none block">{op.categoria}</span>
                  <h4 className="text-sm font-black text-slate-100 mt-1.5 leading-none">{op.produto}</h4>
                </div>
                
                <div className={`px-3 py-1 rounded-xl text-xs font-black font-mono border ${getScoreColor(op.notaGeral)}`}>
                  {op.notaGeral} pts
                </div>
              </div>

              {/* Grid of indicators */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-slate-400 text-[10px] mt-4">
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                  <span className="text-[8px] text-slate-500 uppercase block font-bold leading-none mb-1">Demanda</span>
                  <span className={`font-mono font-bold capitalize ${
                    op.demanda === "alta" ? "text-emerald-400" : op.demanda === "media" ? "text-cyan-400" : "text-amber-400"
                  }`}>{op.demanda}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                  <span className="text-[8px] text-slate-500 uppercase block font-bold leading-none mb-1">Concorrência</span>
                  <span className={`font-mono font-bold capitalize ${
                    op.concorrencia === "baixa" ? "text-emerald-400" : op.concorrencia === "media" ? "text-cyan-400" : "text-red-400"
                  }`}>{op.concorrencia}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-850">
                  <span className="text-[8px] text-slate-500 uppercase block font-bold leading-none mb-1">Escalabilidade</span>
                  <span className={`font-mono font-bold capitalize ${
                    op.escalabilidade === "excelente" ? "text-emerald-400" : op.escalabilidade === "boa" ? "text-cyan-400" : "text-red-400"
                  }`}>{op.escalabilidade}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-3 border-t border-b border-white/5 py-1.5">
                <span>Impressão: <strong className="text-slate-300 font-mono font-normal">{op.tempoImpressaoMinutos} min</strong></span>
                <span>Margem estimada: <strong className="text-emerald-400 font-mono font-bold">+{op.margemLucroPercent}%</strong></span>
              </div>

              {op.observacoes && (
                <p className="text-[10px] text-slate-500 italic leading-relaxed mt-3 border-l-2 border-slate-800 pl-2.5">
                  "{op.observacoes}"
                </p>
              )}
            </div>

            {/* Strategic Advice */}
            <div className="bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/10 text-[10px] leading-relaxed flex items-start gap-2 text-cyan-400">
              <Lightbulb className="shrink-0 text-cyan-400 mt-0.5 animate-pulse" size={13} />
              <div>
                <span className="font-bold uppercase text-[9px] tracking-wide">Diretriz Estratégica ERP:</span>
                <p className="text-slate-400 mt-0.5">
                  {op.notaGeral >= 90 && "Produto de extrema viabilidade! Entre imediatamente na fase de escala, priorize a estocagem do filamento de cor correspondente."}
                  {op.notaGeral >= 75 && op.notaGeral < 90 && "Boa rentabilidade. Ajuste as taxas de fatiamento para reduzir o tempo ou maximize o valor agregado."}
                  {op.notaGeral < 75 && "Risco de gargalo. Custo elevado de tempo em relação a margem percebida. Opere apenas com sinal de 70% pago."}
                </p>
              </div>
            </div>

            {/* Delete button */}
            <div className="flex justify-end pt-1 border-t border-white/5">
              <button 
                onClick={() => handleDelete(op.id)}
                className="text-slate-750 hover:text-red-400 transition-all cursor-pointer p-0.5 rounded text-xs"
                title="Excluir simulação"
              >
                <Trash2 size={12} />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
