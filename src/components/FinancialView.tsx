import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  CreditCard, 
  Coins, 
  Trash2, 
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { TransacaoFinanceira, Pedido } from "../types";

interface FinancialViewProps {
  transacoes: TransacaoFinanceira[];
  pedidos: Pedido[];
  onAddTransacao: (transacao: Omit<TransacaoFinanceira, "id" | "data">) => void;
  onDeleteTransacao: (id: string) => void;
}

export function FinancialView({ transacoes, pedidos, onAddTransacao, onDeleteTransacao }: FinancialViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"fluxo" | "dre">("fluxo");

  // Form states
  const [tipo, setTipo] = useState<"receita" | "despesa">("receita");
  const [categoria, setCategoria] = useState("Venda");
  const [valor, setValor] = useState(150.00);
  const [metodo, setMetodo] = useState<"pix" | "cartao" | "dinheiro" | "marketplace">("pix");
  const [descricao, setDescricao] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valor <= 0 || !descricao) return;

    onAddTransacao({
      tipo,
      categoria,
      valor,
      metodo,
      descricao
    });

    setValor(150);
    setDescricao("");
    setShowAddForm(false);
  };

  // 1. Calculations
  const totalReceitas = transacoes.filter(t => t.tipo === "receita").reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = transacoes.filter(t => t.tipo === "despesa").reduce((acc, t) => acc + t.valor, 0);
  const saldoOperacional = totalReceitas - totalDespesas;

  // Method breakdowns
  const pixTotal = transacoes.filter(t => t.metodo === "pix").reduce((acc, t) => acc + t.valor, 0);
  const cartaoTotal = transacoes.filter(t => t.metodo === "cartao").reduce((acc, t) => acc + t.valor, 0);
  const dindinTotal = transacoes.filter(t => t.metodo === "dinheiro").reduce((acc, t) => acc + t.valor, 0);
  const marketTotal = transacoes.filter(t => t.metodo === "marketplace").reduce((acc, t) => acc + t.valor, 0);

  // 2. Automated DRE Calculation based on actual transaction categories
  // We classify:
  const vendaBruta = totalReceitas; 
  const impostosEstimados = vendaBruta * 0.06; // simulated simple 6% Simples Nacional
  const receitaLiquida = vendaBruta - impostosEstimados;
  
  // Cost of goods sold (CMV) - simulated from purchase of filament/resins/power
  const cmvMaterial = transacoes.filter(t => t.categoria === "Compra Filamento" || t.categoria === "Insumos").reduce((acc, t) => acc + t.valor, 0);
  const cmvEnergia = transacoes.filter(t => t.categoria === "Energia").reduce((acc, t) => acc + t.valor, 0);
  const custoCMVTotal = cmvMaterial + cmvEnergia;
  
  const lucroBruto = receitaLiquida - custoCMVTotal;
  
  // Operating expenses
  const despesasOperacionais = transacoes.filter(t => t.tipo === "despesa" && !["Compra Filamento", "Insumos", "Energia"].includes(t.categoria)).reduce((acc, t) => acc + t.valor, 0);
  const lucroLiquidoDRE = lucroBruto - despesasOperacionais;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Controle Financeiro</h2>
          <p className="text-xs text-slate-400">Gerencie fluxo de caixa, emita demonstrativos de resultados (DRE) e organize recebimentos por método de pagamento</p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900">
            <button 
              onClick={() => setActiveSubTab("fluxo")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeSubTab === "fluxo" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Fluxo de Caixa
            </button>
            <button 
              onClick={() => setActiveSubTab("dre")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeSubTab === "dre" ? "bg-slate-900 text-cyan-400" : "text-slate-400 hover:text-white"
              }`}
            >
              DRE Automatizado
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-1.5 bg-brand-orange text-white hover:bg-brand-orange/90 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus size={15} />
            Lançar Movimento
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-950 p-4.5 rounded-2xl">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Receitas / Entradas</span>
          <span className="text-xl font-black text-emerald-400 font-mono flex items-center gap-1 mt-1">
            <ArrowUpRight size={16} /> R$ {totalReceitas.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-950 p-4.5 rounded-2xl">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Despesas / Saídas</span>
          <span className="text-xl font-black text-red-400 font-mono flex items-center gap-1 mt-1">
            <ArrowDownRight size={16} /> R$ {totalDespesas.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-950 p-4.5 rounded-2xl">
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Saldo do Caixa</span>
          <span className={`text-xl font-black font-mono flex items-center gap-1 mt-1 ${saldoOperacional >= 0 ? "text-cyan-400" : "text-red-400"}`}>
            <DollarSign size={16} /> R$ {saldoOperacional.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-950 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">
            Lançar Nova Entrada/Saída Manual
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo</label>
              <select 
                value={tipo} onChange={(e) => setTipo(e.target.value as any)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value="receita">Receita (Entrada)</option>
                <option value="despesa">Despesa (Saída)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
              <select 
                value={categoria} onChange={(e) => setCategoria(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              >
                {tipo === "receita" ? (
                  <>
                    <option value="Venda">Venda de Impressão</option>
                    <option value="Sinal">Sinal de Entrada (50%)</option>
                    <option value="Serviço Design">Serviço de Fatiamento / CAD</option>
                    <option value="Ajuste">Ajuste de Saldo</option>
                  </>
                ) : (
                  <>
                    <option value="Compra Filamento">Compra de Filamento</option>
                    <option value="Insumos">Resinas e Parafusos</option>
                    <option value="Manutenção">Manutenção de Impressora</option>
                    <option value="Energia">Conta de Luz</option>
                    <option value="Embalagem">Caixas e Plásticos</option>
                    <option value="Marketing">Tráfego pago / Instagram</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Valor do Lançamento (R$)</label>
              <input 
                type="number" required value={valor} onChange={(e) => setValor(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Método</label>
              <select 
                value={metodo} onChange={(e) => setMetodo(e.target.value as any)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value="pix">PIX</option>
                <option value="cartao">Cartão Crédito/Débito</option>
                <option value="dinheiro">Dinheiro Físico</option>
                <option value="marketplace">Marketplace (Taxas retidas)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Histórico / Descrição</label>
              <input 
                type="text" required value={descricao} onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Compra de PLA premium verde - 3DFila"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
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
              Confirmar Lançamento
            </button>
          </div>
        </form>
      )}

      {/* Dynamic Tabs Body */}
      {activeSubTab === "fluxo" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Recent movements list (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-950 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-white/5">
              Histórico de Caixa & Lançamentos Recentes
            </h3>

            <div className="space-y-2.5">
              {transacoes.map((t) => (
                <div key={t.id} className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`p-1.5 rounded-lg shrink-0 ${
                      t.tipo === "receita" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      {t.tipo === "receita" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                    </span>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{t.descricao}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-0.5">
                        <span className="capitalize">{t.metodo}</span>
                        <span>•</span>
                        <span>{t.categoria}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 shrink-0">
                    <span className={`font-mono text-xs font-black ${
                      t.tipo === "receita" ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {t.tipo === "receita" ? "+" : "-"} R$ {t.valor.toFixed(2)}
                    </span>

                    <button 
                      onClick={() => onDeleteTransacao(t.id)}
                      className="text-slate-700 hover:text-red-400 transition-all cursor-pointer p-0.5 rounded"
                      title="Excluir lançamento"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment gateway distribution charts (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-950 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-white/5">
                Métodos de Recebimento
              </h3>

              <div className="space-y-4 mt-4">
                {/* PIX */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-300 flex items-center gap-1">⚡ PIX</span>
                    <span className="font-mono text-slate-200">R$ {pixTotal.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1 border border-slate-850 p-0.5">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${totalReceitas > 0 ? (pixTotal / totalReceitas) * 100 : 70}%` }} />
                  </div>
                </div>

                {/* Cartão */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-300 flex items-center gap-1">💳 Cartão de Crédito</span>
                    <span className="font-mono text-slate-200">R$ {cartaoTotal.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1 border border-slate-850 p-0.5">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${totalReceitas > 0 ? (cartaoTotal / totalReceitas) * 100 : 15}%` }} />
                  </div>
                </div>

                {/* Dinheiro */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-300 flex items-center gap-1">💵 Dinheiro</span>
                    <span className="font-mono text-slate-200">R$ {dindinTotal.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1 border border-slate-850 p-0.5">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${totalReceitas > 0 ? (dindinTotal / totalReceitas) * 100 : 5}%` }} />
                  </div>
                </div>

                {/* Marketplace */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-300 flex items-center gap-1">🏪 Marketplace / Comissões</span>
                    <span className="font-mono text-slate-200">R$ {marketTotal.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1 border border-slate-850 p-0.5">
                    <div className="bg-violet-400 h-full rounded-full" style={{ width: `${totalReceitas > 0 ? (marketTotal / totalReceitas) * 100 : 10}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-[9px] text-slate-500 leading-normal">
              O PIX representa <strong className="text-emerald-400">mais de 75%</strong> do fluxo de entradas devido a facilidade e desconto de 5% no sinal de 3D.
            </div>
          </div>
        </div>
      ) : (
        /* DRE Table (Demonstrativo de Resultados) */
        <div className="bg-slate-900 border border-slate-950 rounded-2xl p-6 space-y-4">
          <div className="pb-3 border-b border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Demonstrativo de Resultados do Exercício (DRE) - Competência Mensal
            </h3>
            <p className="text-[10px] text-slate-400">Relatório financeiro estruturado de lucros e perdas para fins de análise operacional do SaaS</p>
          </div>

          <div className="space-y-3 font-mono text-xs text-slate-300">
            {/* Venda Bruta */}
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="font-bold text-slate-200 uppercase text-[10px] tracking-wide">(+) RECEITA BRUTA DE VENDAS</span>
              <span className="font-bold text-slate-100">R$ {vendaBruta.toFixed(2)}</span>
            </div>

            {/* Impostos */}
            <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-slate-400">
              <span className="pl-4">(-) Impostos s/ Faturamento (Simples 6%)</span>
              <span className="text-red-400">- R$ {impostosEstimados.toFixed(2)}</span>
            </div>

            {/* Receita Liquida */}
            <div className="flex justify-between items-center py-2 border-b border-white/5 font-bold text-slate-200">
              <span className="uppercase text-[10px] tracking-wide">(=) RECEITA LÍQUIDA</span>
              <span>R$ {receitaLiquida.toFixed(2)}</span>
            </div>

            {/* CMV */}
            <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-slate-400">
              <span className="pl-4">(-) Custo dos Insumos (CMV - Filamentos/Resina)</span>
              <span className="text-red-400">- R$ {cmvMaterial.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-slate-400">
              <span className="pl-4">(-) Consumo de Energia Elétrica</span>
              <span className="text-red-400">- R$ {cmvEnergia.toFixed(2)}</span>
            </div>

            {/* Lucro Bruto */}
            <div className="flex justify-between items-center py-2 border-b border-white/5 font-bold text-slate-200">
              <span className="uppercase text-[10px] tracking-wide">(=) LUCRO BRUTO OPERACIONAL</span>
              <span className={lucroBruto >= 0 ? "text-emerald-400" : "text-red-400"}>R$ {lucroBruto.toFixed(2)}</span>
            </div>

            {/* Despesas Fixas */}
            <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-slate-400">
              <span className="pl-4">(-) Mão de Obra e Setup Técnico</span>
              <span className="text-red-400">- R$ {despesasOperacionais.toFixed(2)}</span>
            </div>

            {/* Lucro Liquido DRE */}
            <div className="flex justify-between items-center py-3 bg-slate-950 px-4.5 rounded-xl border border-slate-850 font-black text-sm text-slate-100">
              <span className="uppercase tracking-wider text-xs">(=) LUCRO LÍQUIDO DO PERÍODO (EBITDA)</span>
              <span className={lucroLiquidoDRE >= 0 ? "text-emerald-400" : "text-red-400"}>
                R$ {lucroLiquidoDRE.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 rounded-xl text-[10px] leading-relaxed flex items-start gap-2.5 mt-4">
            <Sparkles className="shrink-0 animate-pulse mt-0.5" size={13} />
            <div>
              <span className="font-bold">Análise do Business Intelligence:</span>
              <p className="text-slate-400 mt-0.5">
                Sua margem de rentabilidade líquida atual é de <strong className="text-emerald-400">{(receitaLiquida > 0 ? (lucroLiquidoDRE / receitaLiquida) * 100 : 70).toFixed(1)}%</strong>. Sua farm demonstra alta saúde financeira devido aos baixos custos de eletricidade/CMV em relação ao alto valor agregado dos Action Figures e protótipos comercializados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
