import React, { useState } from "react";

interface CostBreakdownChartProps {
  custoFilamento: number;
  custoEnergia: number;
  custoDepreciacao: number;
  custoMaoDeObra: number;
  custoPerda: number;
  custoEmbalagem?: number;
  custoOutros?: number;
}

export function CostBreakdownChart({
  custoFilamento,
  custoEnergia,
  custoDepreciacao,
  custoMaoDeObra,
  custoPerda,
  custoEmbalagem = 0,
  custoOutros = 0,
}: CostBreakdownChartProps) {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

  const total = custoFilamento + custoEnergia + custoDepreciacao + custoMaoDeObra + custoPerda + custoEmbalagem + custoOutros;

  const rawSegments = [
    { label: "Filamento", value: custoFilamento, color: "#1d6f8a", bgClass: "bg-brand-teal", borderClass: "border-brand-teal" }, 
    { label: "Energia Elétrica", value: custoEnergia, color: "#3B82F6", bgClass: "bg-blue-500", borderClass: "border-blue-500" }, 
    { label: "Depreciação Máquina", value: custoDepreciacao, color: "#F59E0B", bgClass: "bg-amber-500", borderClass: "border-amber-500" }, 
    { label: "Mão de Obra", value: custoMaoDeObra, color: "#8B5CF6", bgClass: "bg-violet-500", borderClass: "border-violet-500" }, 
    { label: "Embalagem/Envio", value: custoEmbalagem, color: "#EC4899", bgClass: "bg-pink-500", borderClass: "border-pink-500" }, 
    { label: "Outros Insumos", value: custoOutros, color: "#64748B", bgClass: "bg-slate-500", borderClass: "border-slate-500" }, 
    { label: "Perda/Margem Falha", value: custoPerda, color: "#EF4444", bgClass: "bg-red-500", borderClass: "border-red-500" }, 
  ];

  // Filter out zero-value segments, but keep them for matching indices if we want hover stability.
  const segments = rawSegments.map((s) => ({
    ...s,
    percentage: total > 0 ? (s.value / total) * 100 : 0,
  }));

  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  const strokeWidth = 14;

  let runningOffset = 0;

  return (
    <div id="chart-section" className="bg-white dark:bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 form-card-contrast">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm tracking-wide uppercase">
        Distribuição de Custos de Produção
      </h3>

      {total === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2 text-sm">
          <span>Nenhum custo calculado ainda.</span>
          <span className="text-xs">Digite as especificações para ver o gráfico.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Donut SVG Centered wrapper */}
          <div className="relative flex justify-center items-center h-48 sm:h-52">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 160 160"
              className="transform -rotate-90 select-none max-w-[170px]"
            >
              {/* Underlay base circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="transparent"
                strokeWidth={strokeWidth}
              />

              {segments.map((seg, idx) => {
                if (seg.percentage === 0) return null;

                const strokeDash = (seg.percentage / 100) * circumference;
                const strokeOffset = -runningOffset;
                const isHovered = activeSegmentIndex === idx;

                // Accrue offset for the next slice
                runningOffset += strokeDash;

                return (
                  <circle
                    key={seg.label}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer origin-center"
                    onMouseEnter={() => setActiveSegmentIndex(idx)}
                    onMouseLeave={() => setActiveSegmentIndex(null)}
                    style={{
                      opacity: activeSegmentIndex === null || isHovered ? 1 : 0.6,
                    }}
                  />
                );
              })}
            </svg>

            {/* Centered statistics label inside the donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {activeSegmentIndex !== null ? (
                <>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {segments[activeSegmentIndex].label}
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                    R$ {segments[activeSegmentIndex].value.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {segments[activeSegmentIndex].percentage.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Custo Total
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                    R$ {total.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-brand-teal dark:text-brand-teal font-semibold bg-brand-teal/10 px-2 py-0.5 rounded-full mt-1">
                    Custo Base
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex flex-col space-y-2.5">
            {segments.map((seg, idx) => {
              const isHovered = activeSegmentIndex === idx;
              const isOtherHovered = activeSegmentIndex !== null && !isHovered;
              if (seg.percentage === 0) return null;

              return (
                <div
                  key={seg.label}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all border ${
                    isHovered
                      ? "bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700" 
                      : "border-transparent bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                  }`}
                  style={{ opacity: isOtherHovered ? 0.5 : 1 }}
                  onMouseEnter={() => setActiveSegmentIndex(idx)}
                  onMouseLeave={() => setActiveSegmentIndex(null)}
                >
                  <div className="flex items-center space-x-2.5">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {seg.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      R$ {seg.value.toFixed(2)}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      {seg.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
