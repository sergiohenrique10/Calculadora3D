import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle, AlertCircle, FileDigit, HelpCircle } from "lucide-react";

interface GcodeParserProps {
  onDataParsed: (data: { pesoGramas: number; tempoMinutos: number; slicerName: string }) => void;
}

export function GCodeParser({ onDataParsed }: GcodeParserProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedInfo, setParsedInfo] = useState<{
    fileName: string;
    pesoGramas?: number;
    tempoMinutos?: number;
    slicer?: string;
    success: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Process file - Reading first 100KB and last 100KB to make sure we catch headers and footers
  const processFile = (file: File) => {
    setLoading(true);
    setParsedInfo(null);

    const firstChunkSize = 150 * 1024; // 150 KB
    const r = new FileReader();

    r.onload = (e) => {
      const firstChunkText = e.target?.result as string;

      // Now read the end if the file is larger than the first chunk
      if (file.size > firstChunkSize) {
        const lastChunkReader = new FileReader();
        const startOfLastChunk = Math.max(0, file.size - firstChunkSize);
        const lastChunkBlob = file.slice(startOfLastChunk, file.size);

        lastChunkReader.onload = (le) => {
          const lastChunkText = le.target?.result as string;
          parseGCodeText(firstChunkText + "\n" + lastChunkText, file.name);
        };
        lastChunkReader.readAsText(lastChunkBlob);
      } else {
        parseGCodeText(firstChunkText, file.name);
      }
    };

    // Read first chunk
    const firstChunkBlob = file.slice(0, Math.min(file.size, firstChunkSize));
    r.readAsText(firstChunkBlob);
  };

  const parseGCodeText = (text: string, fileName: string) => {
    let tempoMinutos: number | undefined;
    let pesoGramas: number | undefined;
    let slicer = "Desconhecido";

    // 1. Detect Cura Slicer
    if (text.includes("Cura") || text.includes("CURA") || text.includes("M104") && text.includes("Generated with Cura")) {
      slicer = "Cura Slicer";
      
      // Cura seconds format: ;TIME:3600
      const timeMatch = text.match(/;TIME:(\d+)/i);
      if (timeMatch) {
        tempoMinutos = Math.round(parseInt(timeMatch[1], 10) / 60);
      }

      // Cura filament length: ;Filament used: 4.56m
      const filamentMatch = text.match(/;Filament used: ([\d.-]+)(m)?/i);
      if (filamentMatch) {
        const val = parseFloat(filamentMatch[1]);
        // Approximating PLA weight: length * 2.98g/m (for 1.75mm PLA)
        pesoGramas = Math.round(val * 2.98);
      }
    } 

    // 2. Detect Simplify3D
    else if (text.includes("Simplify3D")) {
      slicer = "Simplify3D";
      // ;   Build time: 1 hours 45 minutes
      const timeMatch = text.match(/;   Build time: (?:(\d+) hours )?(\d+) minutes/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10) || 0;
        const mins = parseInt(timeMatch[2], 10) || 0;
        tempoMinutos = hours * 60 + mins;
      }
      
      const filMatch = text.match(/;   Filament weight: ([\d.]+) g/);
      if (filMatch) {
        pesoGramas = Math.round(parseFloat(filMatch[1]));
      }
    }

    // 3. PrusaSlicer / SuperSlicer / Slic3r / Bambu Studio / OrcaSlicer
    else if (
      text.includes("PrusaSlicer") ||
      text.includes("SuperSlicer") ||
      text.includes("Bambu Studio") ||
      text.includes("BambuStudio") ||
      text.includes("OrcaSlicer") ||
      text.includes("Slic3r")
    ) {
      if (text.includes("Bambu Studio") || text.includes("BambuStudio")) {
        slicer = "Bambu Studio";
      } else if (text.includes("OrcaSlicer")) {
        slicer = "OrcaSlicer";
      } else {
        slicer = "PrusaSlicer";
      }

      // Time parsing
      const timeRegexes = [
        /; estimated printing time \([^)]+\) = (?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
        /; estimated printing time = (?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
        /; total estimated time = (?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
        /; total estimated time \[dhm\]:\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?/i,
        /; estimated_time = (\d+)/i, // orca / bambu value in minutes
        /;estimated_time\s*=\s*([\d.]+)/i
      ];

      for (const rx of timeRegexes) {
        const match = text.match(rx);
        if (match) {
          if (rx.toString().includes("estimated_time")) {
            tempoMinutos = Math.round(parseFloat(match[1]));
            break;
          }
          const days = parseInt(match[1], 10) || 0;
          const hours = parseInt(match[2], 10) || 0;
          const mins = parseInt(match[3], 10) || 0;
          tempoMinutos = days * 1440 + hours * 60 + mins;
          break;
        }
      }

      // Weight parsing
      const weightRegexes = [
        /; filament used \[g\] = ([\d.]+)/i,
        /; filament_used_g\s*=\s*([\d.]+)/i,
        /; total filament used \[g\] = ([\d.]+)/i,
        /; filament used \[cm3\] = ([\d.]+)/ // fallback volume
      ];

      for (const rx of weightRegexes) {
        const match = text.match(rx);
        if (match) {
          const val = parseFloat(match[1]);
          if (rx.toString().includes("cm3")) {
            pesoGramas = Math.round(val * 1.24); // density PLA
          } else {
            pesoGramas = Math.round(val);
          }
          break;
        }
      }
    }

    // 4. Default fallback parsing using universal keys if slicer wasn't identified
    if (tempoMinutos === undefined || pesoGramas === undefined) {
      const gcodeLines = text.split("\n");
      for (const line of gcodeLines) {
        if (tempoMinutos === undefined) {
          // generic patterns
          if (line.includes("estimated printing time")) {
            const m = line.match(/(?:(\d+)h\s*)?(?:(\d+)m)/);
            if (m) tempoMinutos = (parseInt(m[1]) || 0) * 60 + (parseInt(m[2]) || 0);
          }
        }
        if (pesoGramas === undefined) {
          if (line.includes("filament used") && line.includes("g")) {
            const m = line.match(/([\d.]+)\s*g/);
            if (m) pesoGramas = Math.round(parseFloat(m[1]));
          }
        }
      }
    }

    // Evaluate success
    const success = (tempoMinutos !== undefined && tempoMinutos > 0) || (pesoGramas !== undefined && pesoGramas > 0);

    setParsedInfo({
      fileName,
      pesoGramas,
      tempoMinutos,
      slicer,
      success,
    });
    setLoading(false);
  };

  const applyParsedData = () => {
    if (parsedInfo && parsedInfo.success) {
      onDataParsed({
        pesoGramas: parsedInfo.pesoGramas || 0,
        tempoMinutos: parsedInfo.tempoMinutos || 0,
        slicerName: parsedInfo.slicer || "G-code",
      });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 p-4.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
          <FileDigit size={14} className="text-brand-orange" />
          Fatiador Direto (Importar .GCODE)
        </h4>
        <div className="group relative">
          <HelpCircle size={13} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" />
          <div className="hidden group-hover:block absolute right-0 top-5 w-60 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl border border-slate-800 shadow-xl z-50">
            Arraste seu arquivo G-code gerado pelo <strong>Cura</strong>, <strong>Bambu Studio</strong>, <strong>PrusaSlicer</strong>, <strong>OrcaSlicer</strong> ou similar. A calculadora lerá os comentários que o fatiador salva no arquivo e preencherá automaticamente o peso e o tempo da impressão!
          </div>
        </div>
      </div>

      {!parsedInfo && !loading && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`flex flex-col items-center justify-center py-5 px-4 rounded-xl text-center border cursor-pointer select-none transition-all ${
            isDragActive
              ? "border-brand-teal bg-brand-teal/5 dark:bg-brand-teal/10"
              : "border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-850 bg-white/40 dark:bg-slate-900/20"
          }`}
        >
          <UploadCloud size={24} className={`mb-1.5 transition-colors ${isDragActive ? "text-brand-teal" : "text-slate-400"}`} />
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Arraste um arquivo .gcode ou .3gcode aqui
          </p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
            Clique para navegar nas suas pastas
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".gcode,.3gcode"
            className="hidden"
          />
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-5 h-5 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Analisando arquivo G-Code...
          </p>
        </div>
      )}

      {parsedInfo && (
        <div className="bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3.5">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Arquivo Analisado</h5>
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate" title={parsedInfo.fileName}>
                {parsedInfo.fileName}
              </p>
            </div>
            <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
              parsedInfo.success 
                ? "bg-brand-teal/10 text-brand-teal dark:bg-brand-teal/20 dark:text-brand-teal"
                : "bg-red-50 text-red-650 dark:bg-red-955/40"
            }`}>
              {parsedInfo.slicer}
            </span>
          </div>

          {parsedInfo.success ? (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-400 font-medium block">Filamento Detectado</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white font-mono">
                  {parsedInfo.pesoGramas !== undefined ? `${parsedInfo.pesoGramas}g` : "Não detectado"}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
                <span className="text-[9px] text-slate-400 font-medium block">Tempo Estimado</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white font-mono">
                  {parsedInfo.tempoMinutos !== undefined 
                    ? `${Math.floor(parsedInfo.tempoMinutos / 60)}h ${parsedInfo.tempoMinutos % 60}m` 
                    : "Não detectado"
                  }
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40">
              <AlertCircle size={14} className="flex-shrink-0" />
              <p className="text-[10px] leading-snug">
                Não conseguimos encontrar comentários de metadados do fatiador compatíveis neste arquivo de G-code.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-1">
            <button
              onClick={() => setParsedInfo(null)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-655 dark:hover:text-slate-300 cursor-pointer"
            >
              Analisar outro
            </button>
            {parsedInfo.success && (
              <button
                onClick={applyParsedData}
                className="flex items-center gap-1 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <CheckCircle size={12} />
                <span>Aplicar Valores</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
