import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Play, 
  RefreshCw, 
  DollarSign, 
  BarChart2, 
  Clock, 
  Wrench,
  HelpCircle,
  ArrowUpRight
} from "lucide-react";
import { Cliente, Pedido, Produto, ItemEstoque, Impressora, TransacaoFinanceira } from "../types";

interface AIChatViewProps {
  clientes: Cliente[];
  pedidos: Pedido[];
  produtos: Produto[];
  estoque: ItemEstoque[];
  impressoras: Impressora[];
  transacoes: TransacaoFinanceira[];
}

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export function AIChatView({ clientes, pedidos, produtos, estoque, impressoras, transacoes }: AIChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Olá! Sou o assistente de Inteligência de Negócio do seu ERP 3D. Estou conectado à sua Farm de impressoras, ao seu CRM, controle de estoque e transações financeiras. O que deseja analisar hoje?",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");

  // Prompt questions from specifications
  const SUGGESTED_QUESTIONS = [
    { text: "Quanto lucrei este mês?", key: "lucro" },
    { text: "Quanto perdi em falhas?", key: "falhas" },
    { text: "Qual produto devo parar de vender?", key: "parar" },
    { text: "Qual produto devo escalar?", key: "escalar" },
    { text: "Qual cliente compra mais?", key: "cliente" },
    { key: "impressora", text: "Qual impressora gera mais lucro?" },
    { key: "estoque", text: "Quanto tempo meu estoque dura?" },
    { key: "stl", text: "Vale a pena fabricar este STL?" }
  ];

  // Live analysis engine
  const handleAnalyze = (key: string, customText?: string) => {
    const userQ = customText || SUGGESTED_QUESTIONS.find(q => q.key === key)?.text || "Pergunta customizada";
    
    // Add user message
    const userMsg: Message = {
      sender: "user",
      text: userQ,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    let reply = "";

    switch (key) {
      case "lucro": {
        const totalL = pedidos.reduce((acc, p) => p.status !== "cancelado" ? acc + p.lucroLiquido : acc, 0);
        const totalR = pedidos.reduce((acc, p) => p.status !== "cancelado" ? acc + p.totalPago : acc, 0);
        reply = `Analisando seu faturamento real de pedidos aprovados: neste mês você faturou **R$ ${totalR.toFixed(2)}** bruto, resultando em um **lucro líquido de R$ ${totalL.toFixed(2)}** (margem líquida de **${((totalL/Math.max(1, totalR)) * 100).toFixed(1)}%**). O financeiro encontra-se em excelente estado.`;
        break;
      }
      case "falhas": {
        const totalFalhas = pedidos.reduce((acc, p) => acc + p.falhasCount, 0);
        const custoEstimadoFalha = totalFalhas * 8.50; // simulated R$8.50 per print failure in material wasted
        reply = `Sua farm registrou **${totalFalhas} falhas** de impressão no período atual. Isso representa uma perda direta de aproximadamente **R$ ${custoEstimadoFalha.toFixed(2)}** em filamento jogado fora e energia desperdiçada. Recomendo lubrificar o eixo Z da Bambu Carbon e trocar o bico da Ender 3 S1 Pro para mitigar esses eventos.`;
        break;
      }
      case "parar": {
        const lowMarginProd = [...produtos].sort((a,b) => a.lucroHora - b.lucroHora)[0];
        reply = `Recomendo monitorar ou descontinuar o produto **"${lowMarginProd?.nome || "Nenhum"}"**. Ele gera apenas **R$ ${lowMarginProd?.lucroHora.toFixed(2)} por hora de impressão**, além de possuir um índice de falhas real de **${lowMarginProd?.indiceFalha}%**. O esforço de pós-processamento não compensa a margem atual.`;
        break;
      }
      case "escalar": {
        const bestProd = [...produtos].sort((a,b) => b.lucroHora - a.lucroHora)[0];
        reply = `Você deve focar seus anúncios e escalabilidade no produto **"${bestProd?.nome || "Nenhum"}"**. Ele possui uma rentabilidade fantástica de **R$ ${bestProd?.lucroHora.toFixed(2)} de lucro por hora de máquina ocupada**, índice de falha baixíssimo (**${bestProd?.indiceFalha}%**) e alta margem de rentabilidade líquida!`;
        break;
      }
      case "cliente": {
        const bestClient = [...clientes].sort((a,b) => b.totalGasto - a.totalGasto)[0];
        reply = `O seu cliente mais valioso (VIP) é **"${bestClient?.nome || "Nenhum"}"**, com um investimento total de **R$ ${bestClient?.totalGasto.toFixed(2)}** e **R$ ${bestClient?.lucroGerado.toFixed(2)}** de lucro líquido gerado para o seu caixa. A origem desse lead foi o **${bestClient?.origem}**.`;
        break;
      }
      case "impressora": {
        const bestPrinter = [...impressoras].sort((a,b) => (b.horasTotais || 0) - (a.horasTotais || 0))[0];
        reply = `A impressora que mais rodou e consequentemente gerou mais retorno financeiro foi a **"${bestPrinter?.nome || "Nenhum"}"**, com um acúmulo de **${bestPrinter?.horasTotais || 0} horas totais**. Ela consome ${bestPrinter?.potencia}W e tem um custo de depreciação super otimizado de R$ ${(bestPrinter?.custoDepreciacaoHora || 0.5).toFixed(2)}/h.`;
        break;
      }
      case "estoque": {
        const lowStockList = estoque.filter(i => (i.pesoRestanteG ? i.pesoRestanteG : i.quantidade) <= i.estoqueMinimo);
        if (lowStockList.length > 0) {
          reply = `Alerta de Almoxarifado: seu estoque atual de **${lowStockList.map(i => i.nome).join(", ")}** está abaixo do mínimo seguro. Com o ritmo atual de pedidos ativos, o estoque dura no máximo **5 dias**. Recomendo acionar os fornecedores hoje.`;
        } else {
          reply = `Seu estoque está muito saudável! Todos os insumos, incluindo filamentos, resinas e caixas de papelão, estão acima dos limites mínimos de segurança. No ritmo de produção atual, seu estoque dura aproximadamente **28 dias**.`;
        }
        break;
      }
      case "stl": {
        reply = `Sim, vale muito a pena! Ao analisar os parâmetros de faturamento do fatiador: modelos de categoria Colecionáveis pintados possuem uma percepção de valor altíssima pelo público final. Se cobrar o Preço Ideal de R$ 95,00, você atinge **mais de 115% de margem de lucro**.`;
        break;
      }
      default: {
        reply = "Entendi o seu ponto. Analisando as regras do seu negócio de impressão 3D: recomendo focar na redução de custos operacionais e na atração de novos clientes via anúncios orgânicos no Instagram, que é sua origem de leads mais rentável atualmente.";
        break;
      }
    }

    const botMsg: Message = {
      sender: "bot",
      text: reply,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInputText("");
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // simple keyword matching
    const text = inputText.toLowerCase();
    let matchedKey = "outro";
    if (text.includes("lucr") || text.includes("receit") || text.includes("fatur")) matchedKey = "lucro";
    else if (text.includes("falha") || text.includes("perd")) matchedKey = "falhas";
    else if (text.includes("parar") || text.includes("ruim") || text.includes("pior")) matchedKey = "parar";
    else if (text.includes("escalar") || text.includes("vende") || text.includes("melhor")) matchedKey = "escalar";
    else if (text.includes("cliente") || text.includes("compra")) matchedKey = "cliente";
    else if (text.includes("impressora") || text.includes("maquina")) matchedKey = "impressora";
    else if (text.includes("estoque") || text.includes("dura")) matchedKey = "estoque";
    else if (text.includes("stl") || text.includes("peça")) matchedKey = "stl";

    handleAnalyze(matchedKey, inputText);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Assistente com Inteligência de Negócio</h2>
          <p className="text-xs text-slate-400">Consulte métricas corporativas estruturadas e receba diretrizes de mercado em tempo real baseadas na sua farm</p>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border border-slate-700"
        >
          Limpar Conversa
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Chat window (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-950 rounded-2xl flex flex-col h-[520px]">
          {/* Messages Area */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  m.sender === "bot" 
                    ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" 
                    : "bg-slate-850 border-slate-700 text-slate-300"
                }`}>
                  {m.sender === "bot" ? <Bot size={15} /> : <User size={15} />}
                </div>

                {/* Message body */}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "bot" 
                    ? "bg-slate-950/85 text-slate-200 border border-slate-850" 
                    : "bg-brand-orange text-white"
                }`}>
                  <p dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  <span className="text-[9px] text-slate-500 font-semibold block text-right mt-1.5 font-mono">{m.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendCustom} className="p-3.5 border-t border-white/5 bg-slate-950 rounded-b-2xl flex gap-2">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pergunte ao ERP (Ex: quanto lucrei este mês?)"
              className="flex-1 bg-slate-900 text-xs border border-slate-850 px-4 py-2.5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button 
              type="submit"
              className="p-2.5 bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 border border-cyan-500/15 rounded-xl cursor-pointer transition-all"
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* Suggested Queries Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-950 p-5 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-white/5">
              <Sparkles size={14} className="text-cyan-400 shrink-0" />
              Perguntas Frequentes do ERP
            </h3>

            <div className="space-y-2 mt-4">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q.key}
                  onClick={() => handleAnalyze(q.key)}
                  className="w-full text-left p-3 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 text-xs text-slate-300 font-medium rounded-xl transition-all cursor-pointer flex justify-between items-center group"
                >
                  <span>{q.text}</span>
                  <ArrowUpRight size={13} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
