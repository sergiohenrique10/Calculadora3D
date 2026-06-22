import React from "react";
import { Orcamento } from "../types";
import { Trash2, Copy, FileText, Calendar, Clock, Sparkles } from "lucide-react";

interface SavedQuotesProps {
  orcamentos: Orcamento[];
  onSelectOrcamento: (orc: Orcamento) => void;
  onDeleteOrcamento: (id: string) => void;
  onCopyTextSummary: (orc: Orcamento) => void;
}

export function SavedQuotes({
  orcamentos,
  onSelectOrcamento,
  onDeleteOrcamento,
  onCopyTextSummary,
}: SavedQuotesProps) {
  if (orcamentos.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2">
        <Sparkles className="mx-auto text-amber-500 animate-bounce" size={24} />
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Nenhum orçamento salvo</h4>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
          Faça suas simulações ao lado e clique em "Salvar nos Meus Orçamentos" para criar sua lista de histórico.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 duration-200 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <span className="flex w-2.5 h-2.5 rounded-full bg-violet-500"></span>
          Orçamentos Salvos ({orcamentos.length})
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Gerencie ou recarregue orçamentos de clientes salvos localmente
        </p>
      </div>

      <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
        {orcamentos.map((orc) => {
          const totalTempoMinutos =
            orc.tempoImpressaoMinutos +
            orc.tempoSetupMinutos +
            orc.tempoPosProcessamentoMinutos;

          const horas = Math.floor(orc.tempoImpressaoMinutos / 60);
          const minutos = orc.tempoImpressaoMinutos % 60;

          return (
            <div
              key={orc.id}
              onClick={() => onSelectOrcamento(orc)}
              className="group p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-805/40 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all duration-200 shadow-sm-flat"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-violet-600 transition-colors">
                    {orc.titulo}
                  </h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> {new Date(orc.data).toLocaleDateString("pt-BR")}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {horas}h {minutos}m
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400 font-mono">
                    R$ {orc.calculado.precoVendaSugerido.toFixed(2)}
                  </span>
                  <div className="text-[9px] font-semibold text-slate-400">
                    Custo: R$ {orc.calculado.custoProducaoTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Specs Badge line */}
              <div className="flex flex-wrap gap-1 mb-2.5">
                <span className="text-[9px] font-medium bg-brand-teal/10 text-brand-teal dark:bg-brand-teal/20 dark:text-brand-teal px-1.5 py-0.5 rounded">
                  Filamento: {orc.pesoPeca + orc.pesoSuporte}g {orc.multiMaterialActive ? `+ ${orc.pesoSecundario || 0}g` : ""}
                </span>
                {orc.multiMaterialActive && (
                  <span className="text-[9px] font-semibold bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400 px-1.5 py-0.5 rounded">
                    Multi-material
                  </span>
                )}
                <span className="text-[9px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 px-1.5 py-0.5 rounded">
                  Falha: {orc.taxaFalha}%
                </span>
                <span className="text-[9px] font-medium bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 px-1.5 py-0.5 rounded">
                  Lucro: {orc.lucroDesejado}% ({Math.round(orc.calculado.lucroLiquido)} R$)
                </span>
              </div>

              {/* Secondary operations row */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 italic">
                  Clique para carregar no fatiador/calculadora
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyTextSummary(orc);
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-brand-orange transition-colors"
                    title="Copiar Resumo para WhatsApp/Orçamento"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteOrcamento(orc.id);
                    }}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded text-slate-400 hover:text-red-600 transition-colors"
                    title="Excluir Orçamento"
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
