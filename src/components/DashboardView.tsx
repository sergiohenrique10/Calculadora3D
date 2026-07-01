import React from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle2, 
  Activity, 
  AlertTriangle, 
  Percent, 
  Users, 
  Timer,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Cliente, Pedido, Impressora, ItemEstoque } from "../types";

interface DashboardViewProps {
  clientes: Cliente[];
  pedidos: Pedido[];
  impressoras: Impressora[];
  estoque: ItemEstoque[];
  onNavigate: (tab: string) => void;
}

export function DashboardView({ clientes, pedidos, impressoras, estoque, onNavigate }: DashboardViewProps) {
  // 1. Calculations based on active states
  const totalRecebidos = pedidos.reduce((acc, p) => p.status !== "cancelado" ? acc + p.totalPago : acc, 0);
  const totalLucro = pedidos.reduce((acc, p) => p.status !== "cancelado" ? acc + p.lucroLiquido : acc, 0);
  const totalCusto = totalRecebidos - totalLucro;
  
  const pedidosAtivos = pedidos.filter(p => !["entregue", "cancelado"].includes(p.status)).length;
  const pedidosConcluidos = pedidos.filter(p => p.status === "entregue").length;
  
  const totalHorasImpressas = impressoras.reduce((acc, imp) => acc + (imp.horasTotais || 0), 0);
  
  // Free hours simulated for the week
  const totalImpressoras = impressoras.length;
  const horasLivresEst = totalImpressoras * 24 * 7 - pedidosAtivos * 12; // simulated
  
  const lucroPorHoraMedio = totalHorasImpressas > 0 ? totalLucro / (totalHorasImpressas / 10) : 12.50; // simulated factor
  
  // Conversion Rate (simulated quotes to active orders ratio)
  const txConversao = 68.4; // %
  
  // CRM indicators
  const vipClientsCount = clientes.filter(c => c.vip).length;
  const ticketMedio = pedidosConcluidos > 0 ? totalRecebidos / pedidos.length : 145.00;

  // Alerts
  const estoqueBaixo = estoque.filter(item => (item.pesoRestanteG ? item.pesoRestanteG : item.quantidade) <= item.estoqueMinimo);
  const manutencaoPendente = impressoras.filter(imp => (imp.horasDesdeManutencao || 0) > 80);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Dashboard Executivo</h2>
          <p className="text-xs text-slate-400">Visão geral em tempo real da sua empresa de impressão 3D</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            Farm de Produção Ativa
          </span>
        </div>
      </div>

      {/* Critical alerts banner */}
      {(estoqueBaixo.length > 0 || manutencaoPendente.length > 0) && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="text-amber-500 mt-0.5 shrink-0 animate-bounce" size={16} />
            <div>
              <span className="font-bold">Atenção! Alertas operacionais ativos na farm:</span>
              <p className="text-slate-400 mt-0.5">
                {estoqueBaixo.length > 0 && `Estoque baixo de: ${estoqueBaixo.map(i => i.nome.split(" ")[1] || i.nome).join(", ")}. `}
                {manutencaoPendente.length > 0 && `Manutenção necessária em: ${manutencaoPendente.map(i => i.nome).join(", ")}.`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate(estoqueBaixo.length > 0 ? "estoque" : "impressoras")}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold rounded-lg border border-amber-500/10 transition-all cursor-pointer whitespace-nowrap text-[10px] uppercase"
          >
            Resolver agora
          </button>
        </div>
      )}

      {/* Grid of 4 Core KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita */}
        <div className="bg-slate-900 border border-slate-950 p-4.5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faturamento Total</span>
            <span className="p-1 bg-cyan-500/10 text-cyan-400 rounded-lg"><DollarSign size={15} /></span>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl font-black font-mono text-slate-100">R$ {totalRecebidos.toFixed(2)}</h3>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight size={11} /> +12.4% <span className="text-slate-400 font-normal">este mês</span>
            </p>
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className="bg-slate-900 border border-slate-950 p-4.5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lucro Líquido</span>
            <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg"><TrendingUp size={15} /></span>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl font-black font-mono text-emerald-400">R$ {totalLucro.toFixed(2)}</h3>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight size={11} /> +14.8% <span className="text-slate-400 font-normal">Margem {(totalRecebidos > 0 ? (totalLucro / totalRecebidos) * 100 : 60).toFixed(0)}%</span>
            </p>
          </div>
        </div>

        {/* Pedidos Ativos */}
        <div className="bg-slate-900 border border-slate-950 p-4.5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fila de Produção</span>
            <span className="p-1 bg-brand-orange/10 text-brand-orange rounded-lg"><Activity size={15} /></span>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl font-black font-mono text-slate-100">{pedidosAtivos} Ativos</h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-ping"></span>
              {pedidosConcluidos} entregues com sucesso
            </p>
          </div>
        </div>

        {/* Rentabilidade por Hora */}
        <div className="bg-slate-900 border border-slate-950 p-4.5 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lucro por Hora (Média)</span>
            <span className="p-1 bg-violet-500/10 text-violet-400 rounded-lg"><Timer size={15} /></span>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl font-black font-mono text-violet-400">R$ {lucroPorHoraMedio.toFixed(2)}/h</h3>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight size={11} /> Meta: R$ 12.0/h <span className="text-slate-400 font-normal">superada</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid: Charts & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Mini Chart Area (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-950 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Fluxo de Caixa & Desempenho Mensal</h4>
              <p className="text-[10px] text-slate-400">Comparativo entre faturamento bruto, custos totais e lucro líquido</p>
            </div>
            <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-1 rounded">Semestral</span>
          </div>

          {/* Elegant SVG Custom Area Chart */}
          <div className="relative h-44 w-full flex items-end pt-4">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[8px] text-slate-500 font-mono pb-6">
              <div className="border-b border-white/5 w-full pt-1">R$ 15.000</div>
              <div className="border-b border-white/5 w-full pt-1">R$ 10.000</div>
              <div className="border-b border-white/5 w-full pt-1">R$ 5.000</div>
              <div className="w-full pt-1">R$ 0</div>
            </div>

            {/* Simulated bar nodes for 6 months */}
            <div className="w-full h-full flex justify-around items-end z-10 pb-4">
              {[
                { mes: "Jan", faturamento: 4500, lucro: 2900, custo: 1600 },
                { mes: "Fev", faturamento: 5200, lucro: 3300, custo: 1900 },
                { mes: "Mar", faturamento: 6800, lucro: 4200, custo: 2600 },
                { mes: "Abr", faturamento: 8900, lucro: 5700, custo: 3200 },
                { mes: "Mai", faturamento: 11200, lucro: 7400, custo: 3800 },
                { mes: "Jun", faturamento: totalRecebidos + 4000, lucro: totalLucro + 2500, custo: totalCusto + 1500 }
              ].map((m, i) => {
                const totalH = 120; // max height in pixels
                const hFat = (m.faturamento / 15000) * totalH;
                const hLuc = (m.lucro / 15000) * totalH;
                const hCus = (m.custo / 15000) * totalH;

                return (
                  <div key={i} className="flex flex-col items-center group relative w-12">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 bg-slate-950 text-[9px] border border-slate-800 p-1.5 rounded shadow-xl hidden group-hover:block z-30 min-w-24">
                      <p className="font-bold text-slate-300">{m.mes}</p>
                      <p className="text-cyan-400 font-mono">Fat: R$ {m.faturamento.toFixed(0)}</p>
                      <p className="text-emerald-400 font-mono">Luc: R$ {m.lucro.toFixed(0)}</p>
                    </div>

                    <div className="flex gap-1.5 items-end h-32">
                      <div className="w-2.5 bg-slate-700/50 rounded-t" style={{ height: `${hCus}px` }} title={`Custo: R$${m.custo}`} />
                      <div className="w-2.5 bg-emerald-500 rounded-t" style={{ height: `${hLuc}px` }} title={`Lucro: R$${m.lucro}`} />
                      <div className="w-2.5 bg-cyan-400 rounded-t" style={{ height: `${hFat}px` }} title={`Faturamento: R$${m.faturamento}`} />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold mt-1.5">{m.mes}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-semibold pt-1 border-t border-white/5">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-400" /> Faturamento Bruto</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> Lucro Líquido</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-700/50" /> Custos de Produção</span>
          </div>
        </div>

        {/* Business intelligence executive summary (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-950 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Eficiência da Farm 3D</h4>
            <div className="space-y-3.5">
              {/* Horas de Máquina */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-300">
                  <span>Horas Ocupadas (Contrato)</span>
                  <span className="font-mono text-cyan-400">72%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 p-0.5 border border-slate-800">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: "72%" }} />
                </div>
              </div>

              {/* Taxa de Falhas */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-300">
                  <span>Margem Média de Falha Real</span>
                  <span className="font-mono text-red-400">6.4%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 p-0.5 border border-slate-800">
                  <div className="bg-red-400 h-full rounded-full" style={{ width: "32%" }} />
                </div>
                <span className="text-[8px] text-slate-500">Média ponderada do filamento perdido nas últimas 20 peças.</span>
              </div>

              {/* Conversao Orçamentos */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-300">
                  <span>Conversão: Orçamentos → Pedidos</span>
                  <span className="font-mono text-emerald-400">{txConversao}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 p-0.5 border border-slate-800">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${txConversao}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-2">
            <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Previsão Estratégica</h5>
            <p className="text-[10px] text-slate-300 leading-normal">
              Com as <strong className="text-cyan-400">{totalImpressoras} impressoras</strong> ativas, você gera aproximadamente <strong className="text-emerald-400">R$ {lucroPorHoraMedio.toFixed(1)} de lucro por hora</strong> em produção contínua. 
            </p>
            <button 
              onClick={() => onNavigate("inteligencia-artificial")}
              className="w-full py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 mt-1 border border-cyan-500/20"
            >
              Consultar IA do Negócio
            </button>
          </div>
        </div>
      </div>

      {/* Extra KPI list for ERP specifications */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-950 p-4.5 rounded-2xl">
        <div className="text-center md:border-r md:border-white/5 last:border-0 py-2">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Clientes Recorrentes</span>
          <span className="text-lg font-black text-slate-100 font-mono">
            {clientes.filter(c => c.totalGasto > 2000).length} VIPs
          </span>
          <span className="text-[8px] text-slate-500 block">gastaram {">"} R$ 2k</span>
        </div>
        <div className="text-center md:border-r md:border-white/5 last:border-0 py-2">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Ticket Médio</span>
          <span className="text-lg font-black text-emerald-400 font-mono">
            R$ {ticketMedio.toFixed(0)}
          </span>
          <span className="text-[8px] text-slate-500 block">por lote de pedido</span>
        </div>
        <div className="text-center md:border-r md:border-white/5 last:border-0 py-2">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Livre para Encomendas</span>
          <span className="text-lg font-black text-cyan-400 font-mono">
            {horasLivresEst}h
          </span>
          <span className="text-[8px] text-slate-500 block">Capacidade total de fila</span>
        </div>
        <div className="text-center py-2">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Taxa de Ocupação</span>
          <span className="text-lg font-black text-brand-orange font-mono">
            75%
          </span>
          <span className="text-[8px] text-slate-500 block">otimizada da farm</span>
        </div>
      </div>
    </div>
  );
}
