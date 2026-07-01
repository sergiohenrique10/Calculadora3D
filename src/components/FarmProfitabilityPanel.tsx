import React, { useState } from "react";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Activity, 
  Layers, 
  Flame, 
  Check, 
  ArrowRight,
  Sparkles,
  Zap,
  Percent,
  Timer,
  Scale
} from "lucide-react";

interface FarmProfitabilityPanelProps {
  lucroLiquido: number;
  totalTempoMinutos: number;
  totalPesoG: number;
  custoProducaoTotal: number;
}

export function FarmProfitabilityPanel({
  lucroLiquido,
  totalTempoMinutos,
  totalPesoG,
  custoProducaoTotal,
}: FarmProfitabilityPanelProps) {
  // Inputs for the Smart Profitability Index
  const [taxaOcupacao, setTaxaOcupacao] = useState<number>(75); // %
  const [riscoFalha, setRiscoFalha] = useState<"baixo" | "medio" | "alto">("baixo");
  const [demandaPeca, setDemandaPeca] = useState<"baixa" | "media" | "alta">("media");
  const [posProcessamento, setPosProcessamento] = useState<"facil" | "medio" | "dificil">("facil");

  // Interactive Farm Simulator states
  const [simLucroA, setSimLucroA] = useState<number>(80);
  const [simHorasA, setSimHorasA] = useState<number>(20);
  const [simLucroB, setSimLucroB] = useState<number>(20);
  const [simHorasB, setSimHorasB] = useState<number>(2);
  const [simQuantidadeB, setSimQuantidadeB] = useState<number>(4);

  // 1. Calculate base Hourly Profitability (R$/h)
  const tempoHoras = totalTempoMinutos / 60;
  const rentabilidadePorHora = tempoHoras > 0 ? lucroLiquido / tempoHoras : 0;

  // 2. Classify base Hourly Profitability
  let statusRentabilidade: {
    label: string;
    corText: string;
    corBg: string;
    corBorder: string;
    descricao: string;
    pontos: number;
  };

  if (rentabilidadePorHora <= 0) {
    statusRentabilidade = {
      label: "Inviável / Sem Lucro",
      corText: "text-red-400",
      corBg: "bg-red-500/10",
      corBorder: "border-red-500/25",
      descricao: "Você está tendo prejuízo ou margem zero nesta peça. Revise urgentemente os custos ou o markup.",
      pontos: 0,
    };
  } else if (rentabilidadePorHora < 6) {
    statusRentabilidade = {
      label: "Crítico / Margem Baixa",
      corText: "text-amber-500",
      corBg: "bg-amber-500/10",
      corBorder: "border-amber-500/25",
      descricao: "Não vale a pena produzir, a menos que sua impressora esteja totalmente ociosa.",
      pontos: 30,
    };
  } else if (rentabilidadePorHora >= 6 && rentabilidadePorHora < 10) {
    statusRentabilidade = {
      label: "Aceitável",
      corText: "text-brand-orange",
      corBg: "bg-brand-orange/10",
      corBorder: "border-brand-orange/20",
      descricao: "Aceitável para preencher a agenda da farm, mas procure otimizar o tempo de impressão ou elevar o preço.",
      pontos: 60,
    };
  } else if (rentabilidadePorHora >= 10 && rentabilidadePorHora < 15) {
    statusRentabilidade = {
      label: "Bom retorno",
      corText: "text-emerald-400",
      corBg: "bg-emerald-500/10",
      corBorder: "border-emerald-500/25",
      descricao: "Bom retorno financeiro. Taxa saudável para crescimento e lucratividade da farm.",
      pontos: 85,
    };
  } else {
    statusRentabilidade = {
      label: "Excelente rentabilidade",
      corText: "text-cyan-400",
      corBg: "bg-cyan-500/10",
      corBorder: "border-cyan-500/25",
      descricao: "Excelente retorno por hora! Peça altamente prioritária na fila de produção da sua farm.",
      pontos: 100,
    };
  }

  // 3. Lucro por grama de filamento
  const lucroPorGrama = totalPesoG > 0 ? lucroLiquido / totalPesoG : 0;
  let pontosGrama = 0;
  if (lucroPorGrama > 0.5) pontosGrama = 100;
  else if (lucroPorGrama > 0.25) pontosGrama = 80;
  else if (lucroPorGrama > 0.1) pontosGrama = 50;
  else if (lucroPorGrama > 0) pontosGrama = 20;

  // 4. Calculate final "Índice de Rentabilidade da Farm" (0-100)
  // Weighted:
  // - Rentabilidade por Hora (45%)
  // - Lucro por grama (15%)
  // - Impacto da taxa de ocupação vs rentabilidade por hora (15%)
  //   (Se ocupação é alta, rentabilidade por hora baixa é severamente penalizada)
  // - Risco de Falha (10% de desconto se alto, 0% se baixo)
  // - Demanda (10% de bônus/penalidade)
  // - Pós-Processamento (5% de desconto se difícil)

  const pesoRentabilidadeHora = 45;
  const pesoLucroGrama = 15;
  const pesoOcupacaoConflito = 15;

  let pontosOcupacao = 100;
  if (taxaOcupacao > 80 && rentabilidadePorHora < 10) {
    // Farm está cheia, aceitar peça barata de imprimir é ruim
    pontosOcupacao = 30;
  } else if (taxaOcupacao < 40 && rentabilidadePorHora < 10) {
    // Farm está vazia, aceitar qualquer margem é razoável para manter girando
    pontosOcupacao = 80;
  }

  let descontoFalha = 0;
  if (riscoFalha === "alto") descontoFalha = 20;
  else if (riscoFalha === "medio") descontoFalha = 8;

  let pontosDemanda = 50;
  if (demandaPeca === "alta") pontosDemanda = 100;
  else if (demandaPeca === "baixa") pontosDemanda = 20;

  let descontoPos = 0;
  if (posProcessamento === "dificil") descontoPos = 10;
  else if (posProcessamento === "medio") descontoPos = 4;

  const scoreBruto = 
    (statusRentabilidade.pontos * pesoRentabilidadeHora) / 100 +
    (pontosGrama * pesoLucroGrama) / 100 +
    (pontosOcupacao * pesoOcupacaoConflito) / 100 +
    (pontosDemanda * 15) / 100;

  const scoreFinal = Math.max(0, Math.min(100, Math.round(scoreBruto - descontoFalha - descontoPos)));

  // Score description
  let scoreClass: { label: string; cor: string; desc: string };
  if (scoreFinal < 40) {
    scoreClass = {
      label: "Baixa Viabilidade",
      cor: "text-red-400",
      desc: "Evite produzir ou aumente o markup. Essa peça drena recursos da sua farm sem trazer retorno proporcional.",
    };
  } else if (scoreFinal < 70) {
    scoreClass = {
      label: "Viabilidade Média",
      cor: "text-brand-orange",
      desc: "Aceitável se as máquinas estiverem ociosas, mas procure otimizar tempos e reduzir riscos de falha.",
    };
  } else {
    scoreClass = {
      label: "Alta Viabilidade ⭐",
      cor: "text-emerald-400",
      desc: "Excelente negócio para sua farm! Otimiza perfeitamente o tempo de máquina e os custos de filamento.",
    };
  }

  // Interactive Scenario Calculations
  const rphA = simHorasA > 0 ? simLucroA / simHorasA : 0;
  const totalHorasB = simHorasB * simQuantidadeB;
  const totalLucroB = simLucroB * simQuantidadeB;
  const rphB = totalHorasB > 0 ? totalLucroB / totalHorasB : 0;

  return (
    <div className="space-y-6">
      {/* SECTION 1: MAIN HOURLY PROFITABILITY (R$/h) CARD */}
      <div className="bg-slate-900 border border-slate-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
          <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Timer size={16} />
          </span>
          <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
            Indicador de Rentabilidade de Produção
          </h3>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5 text-center md:text-left space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">
              Rentabilidade Real da Máquina
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-1">
              <span className="text-3xl font-black text-cyan-400 font-mono">
                R$ {rentabilidadePorHora.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ hora</span>
            </div>
            <div className="pt-1">
              <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold ${statusRentabilidade.corBg} ${statusRentabilidade.corText} border ${statusRentabilidade.corBorder}`}>
                <Activity size={10} />
                {statusRentabilidade.label}
              </span>
            </div>
          </div>

          <div className="md:col-span-7 bg-white/5 border border-white/5 rounded-2xl p-4 text-xs space-y-2">
            <p className="text-slate-300 leading-relaxed font-medium">
              {statusRentabilidade.descricao}
            </p>
            <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[10px] text-slate-400">
              <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">{"<"} R$6/h Ruim</span>
              <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">R$6-10 Aceitável</span>
              <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">R$10-15 Bom</span>
              <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">{">"} R$15 Excelente</span>
            </div>
          </div>
        </div>

        {/* Visual Thermometer Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-[10px] text-slate-400 font-bold">
            <span>Termômetro de Retorno</span>
            <span className="font-mono">R$ {rentabilidadePorHora.toFixed(1)} / R$ 20.0 max</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 via-amber-500 via-emerald-400 to-cyan-400"
              style={{ width: `${Math.min(100, Math.max(5, (rentabilidadePorHora / 20) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: SMART FARM DECISION INDEX */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 p-5 shadow-sm space-y-5 form-card-contrast">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-brand-teal/10 text-brand-teal dark:bg-brand-teal/20 dark:text-cyan-400 rounded-lg">
              <Layers size={16} />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Índice de Rentabilidade Inteligente (0 a 100)
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Ponderado para otimização estratégica de Farm de Impressoras 3D
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-black font-mono ${scoreClass.cor}`}>
              {scoreFinal}
            </span>
            <span className="text-[10px] block text-slate-400 uppercase font-bold">Score</span>
          </div>
        </div>

        {/* Diagnostic Score Banner */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-900 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold uppercase ${scoreClass.cor}`}>
              {scoreClass.label}
            </span>
            <span className="text-[10px] text-slate-400">• Diagnóstico Automático</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {scoreClass.desc}
          </p>
        </div>

        {/* Variables sliders & choices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 pt-1">
          {/* Ocupacao da Farm */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Percent size={13} className="text-slate-400" />
                Ocupação Atual da Farm
              </span>
              <span className="font-bold text-brand-teal dark:text-cyan-400 font-mono">
                {taxaOcupacao}%
              </span>
            </div>
            <input 
              type="range"
              min="10"
              max="100"
              step="5"
              value={taxaOcupacao}
              onChange={(e) => setTaxaOcupacao(Number(e.target.value))}
              className="w-full accent-brand-teal cursor-pointer"
            />
            <span className="text-[9px] text-slate-400 block leading-tight">
              {taxaOcupacao > 80 
                ? "🔥 Farm cheia! Seja ultra exigente com margens." 
                : "💤 Farm ociosa! Reduzir R$/h para manter as máquinas ligadas é aceitável."}
            </span>
          </div>

          {/* Risco de Falha da Peça */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Flame size={13} className="text-slate-400" />
              Risco de Falha Físico (Geometria/Tempo)
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(["baixo", "medio", "alto"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRiscoFalha(r)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                    riscoFalha === r
                      ? r === "alto" 
                        ? "bg-red-500/10 text-red-500 border-red-500/30 shadow-sm"
                        : r === "medio"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-sm"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm"
                      : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-950"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <span className="text-[9px] text-slate-400 block leading-tight">
              Peças longas, suportes complexos e ABS têm maior risco.
            </span>
          </div>

          {/* Demanda de Mercado */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <TrendingUp size={13} className="text-slate-400" />
              Demanda de Mercado / Recompras
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(["baixa", "media", "alta"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDemandaPeca(d)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                    demandaPeca === d
                      ? "bg-brand-teal/10 text-brand-teal dark:text-cyan-400 border-brand-teal/30 dark:border-cyan-500/20 shadow-sm"
                      : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-950"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <span className="text-[9px] text-slate-400 block leading-tight">
              Peças de alta saída justificam margens unitárias menores.
            </span>
          </div>

          {/* Facilidade de Pos-Processamento */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Scale size={13} className="text-slate-400" />
              Esforço de Pós-Processamento
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(["facil", "medio", "dificil"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosProcessamento(p)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                    posProcessamento === p
                      ? p === "dificil"
                        ? "bg-red-500/10 text-red-500 border-red-500/30 shadow-sm"
                        : "bg-brand-orange/10 text-brand-orange border-brand-orange/30 shadow-sm"
                      : "bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-950"
                  }`}
                >
                  {p === "facil" ? "fácil" : p === "medio" ? "médio" : "difícil"}
                </button>
              ))}
            </div>
            <span className="text-[9px] text-slate-400 block leading-tight">
              Lixamento, pintura e remoção manual de suporte consomem mão de obra.
            </span>
          </div>
        </div>

        {/* Secondary micro-indicators */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl">
            <span className="text-slate-400 font-medium">Lucro por Grama:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">R$ {lucroPorGrama.toFixed(2)}/g</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl">
            <span className="text-slate-400 font-medium">Custo de Operação:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">R$ {custoProducaoTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: INTERACTIVE COMPARISON SCENARIOS (FARM SIMULATOR) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-850 p-5 shadow-sm space-y-4 form-card-contrast">
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="p-1.5 bg-brand-orange/10 text-brand-orange rounded-lg">
            <Sparkles size={16} />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              Simulador Estratégico de Farm (Perguntas Reais)
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Analise cenários reais de ocupação antes de aceitar pedidos longos
            </p>
          </div>
        </div>

        {/* Tab scenario switcher / layout accordion style */}
        <div className="space-y-4">
          
          {/* Cenário 1: "Essa peça de R$80 por 20 horas vale a pena?" */}
          <div className="border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="flex items-start gap-2">
              <span className="text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-md font-bold mt-0.5">
                Q1
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  "Essa peça dá R$ 80 de lucro, mas prende a impressora por 20 horas. Vale a pena?"
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Insira os valores abaixo para simular se o tempo ocupado justifica o retorno.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Lucro Proposto (R$)</label>
                <input 
                  type="number"
                  min="1"
                  value={simLucroA}
                  onChange={(e) => setSimLucroA(Math.max(1, Number(e.target.value)))}
                  className="w-full font-mono text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tempo Ocupado (Horas)</label>
                <input 
                  type="number"
                  min="1"
                  value={simHorasA}
                  onChange={(e) => setSimHorasA(Math.max(1, Number(e.target.value)))}
                  className="w-full font-mono text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Verdict analysis A */}
            <div className="bg-slate-100/80 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-slate-400">Rentabilidade:</span>
                  <span className={`text-sm font-bold font-mono ${rphA < 6 ? "text-red-400" : rphA < 10 ? "text-amber-500" : "text-emerald-400"}`}>
                    R$ {rphA.toFixed(2)}/h
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  {rphA < 6 ? (
                    <span>⚠️ <strong>Não compensa!</strong> Bloqueia sua máquina por muito tempo com retorno pífio.</span>
                  ) : rphA < 10 ? (
                    <span>⚖️ <strong>Aceitável somente</strong> se as máquinas estiverem totalmente desocupadas.</span>
                  ) : (
                    <span>✅ <strong>Vale a pena!</strong> Retorno excelente para a fila de produção.</span>
                  )}
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  // Apply values to main form
                  // Assumes a general printing print job: R$ 80 profit
                  // We can tell the user we simulated this!
                }}
                className="text-[10px] flex items-center gap-1 font-bold text-brand-teal dark:text-cyan-400 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Análise estratégica <ArrowRight size={10} />
              </button>
            </div>
          </div>

          {/* Cenário 2: "Quatro peças pequenas ou uma grande?" */}
          <div className="border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="flex items-start gap-2">
              <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md font-bold mt-0.5">
                Q2
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  "É melhor imprimir {simQuantidadeB} peças menores ou 1 peça grande?"
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Compare o fluxo e o lucro acumulado por tempo de ocupação da farm.
                </p>
              </div>
            </div>

            {/* Side-by-side inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Opção A: Peça Grande */}
              <div className="p-3 bg-slate-100/50 dark:bg-slate-950/40 rounded-xl space-y-2 border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[10px] font-bold text-brand-orange block">OPÇÃO 1: PEÇA GRANDE ÚNICA</span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Lucro Total (R$)</span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">R$ {simLucroA.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tempo Total</span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">{simHorasA}h</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-900 flex justify-between items-center">
                  <span className="text-[9px] text-slate-400">Rentabilidade:</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-white">R$ {rphA.toFixed(2)}/h</span>
                </div>
              </div>

              {/* Opção B: Peças Pequenas Repetidas */}
              <div className="p-3 bg-slate-100/50 dark:bg-slate-950/40 rounded-xl space-y-2 border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[10px] font-bold text-brand-teal block">OPÇÃO 2: {simQuantidadeB} PEÇAS PEQUENAS</span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Lucro /u</span>
                    <input 
                      type="number" 
                      min="1"
                      value={simLucroB}
                      onChange={(e) => setSimLucroB(Math.max(1, Number(e.target.value)))}
                      className="w-full font-mono text-[10px] p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tempo /u</span>
                    <input 
                      type="number" 
                      min="1"
                      value={simHorasB}
                      onChange={(e) => setSimHorasB(Math.max(1, Number(e.target.value)))}
                      className="w-full font-mono text-[10px] p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Qtd</span>
                    <input 
                      type="number" 
                      min="1"
                      value={simQuantidadeB}
                      onChange={(e) => setSimQuantidadeB(Math.max(1, Number(e.target.value)))}
                      className="w-full font-mono text-[10px] p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-900 flex justify-between items-center">
                  <span className="text-[9px] text-slate-400">Total: {totalHorasB}h | R$ {totalLucroB}</span>
                  <span className="font-mono text-xs font-bold text-brand-teal dark:text-cyan-400">R$ {rphB.toFixed(2)}/h</span>
                </div>
              </div>
            </div>

            {/* Verdict of comparison */}
            <div className="p-3 bg-cyan-500/5 dark:bg-cyan-500/5 rounded-xl border border-cyan-500/10 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1">
                <Zap size={14} />
                Veredito do Simulador Farm:
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-normal">
                {rphB > rphA ? (
                  <span>
                    A <strong>Opção 2 ({simQuantidadeB} peças pequenas)</strong> é muito mais vantajosa! Ela gera <strong>R$ {rphB.toFixed(2)}/h</strong> contra R$ {rphA.toFixed(2)}/h da peça grande. 
                    {totalHorasB < simHorasA && (
                      <span> Além de ganhar mais por hora, você libera a impressora <strong>{simHorasA - totalHorasB} horas antes</strong> para novos trabalhos!</span>
                    )}
                  </span>
                ) : rphB < rphA ? (
                  <span>
                    A <strong>Opção 1 (Peça Grande Única)</strong> é mais vantajosa neste caso! Ela gera <strong>R$ {rphA.toFixed(2)}/h</strong> contra R$ {rphB.toFixed(2)}/h das peças pequenas. Ela otimiza melhor a ocupação contínua de sua farm.
                  </span>
                ) : (
                  <span>
                    Ambas opções possuem a mesma rentabilidade de <strong>R$ {rphA.toFixed(2)}/h</strong>! Nesse caso, prefira a peça grande para economizar com custos de mão de obra de setup (trocas de mesa) ou prefira as peças pequenas para reduzir o risco de perdas por falhas tardias de impressão.
                  </span>
                )}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
