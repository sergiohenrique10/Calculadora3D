import React, { useState, useEffect } from "react";
import { Filamento, Impressora, Orcamento } from "./types";
import { CostBreakdownChart } from "./components/CostBreakdownChart";
import { FilamentCatalog } from "./components/FilamentCatalog";
import { PrinterCatalog } from "./components/PrinterCatalog";
import { SavedQuotes } from "./components/SavedQuotes";
import { GCodeParser } from "./components/GCodeParser";
import { motion, AnimatePresence } from "motion/react";

import {
  Printer as PrinterIcon,
  Zap,
  DollarSign,
  Activity,
  Sparkles,
  Share2,
  Download,
  Upload,
  Layers,
  Clock,
  Coins,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  HelpCircle,
  Percent,
  Calculator,
  RefreshCw,
  Info,
  FileText,
  Package,
  Receipt,
  Plus
} from "lucide-react";

// --- Custom Brand Logo Component (Arte_Studio_3D) ---
export const ArteStudio3DLogo = ({ className = "h-11", showText = true }: { className?: string; showText?: boolean }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xl font-black tracking-tight leading-none select-none">
            <span className="text-slate-800 dark:text-white font-extrabold uppercase text-xs tracking-widest px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 mr-1">
              Calculadora
            </span>
            <span className="text-brand-teal dark:text-cyan-400">Arte_Studio_</span>
            <span className="text-brand-orange">3D</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1.5">
            Gerenciador de Orçamentos de Impressão 3D
          </span>
        </div>
      )}
    </div>
  );
};

// Semente de dados iniciais para facilitar o teste
const FILAMENTOS_PADRAO: Filamento[] = [
  { id: "fil-pla", nome: "PLA Premium", marca: "3D Fila", tipo: "PLA", preco: 120.0, peso: 1000, cor: "#10B981" },
  { id: "fil-petg", nome: "PETG Resistente", marca: "Esun", tipo: "PETG", preco: 150.0, peso: 1000, cor: "#3B82F6" },
  { id: "fil-abs", nome: "ABS Sólido", marca: "Voolt3D", tipo: "ABS", preco: 95.0, peso: 1000, cor: "#F59E0B" },
  { id: "fil-tpu", nome: "TPU Flexível", marca: "GTMax", tipo: "TPU", preco: 180.0, peso: 800, cor: "#8B5CF6" },
];

const IMPRESSORAS_PADRAO: Impressora[] = [
  { id: "imp-ender", nome: "Creality Ender 3 S1", potencia: 150, custoDepreciacaoHora: 0.35 },
  { id: "imp-bambu", nome: "Bambu Lab P1S", potencia: 220, custoDepreciacaoHora: 0.70 },
  { id: "imp-resin", nome: "Elegoo Mars 4 (Resina)", potencia: 60, custoDepreciacaoHora: 0.50 },
];

const ORCAMENTOS_PADRAO: Orcamento[] = [
  {
    id: "orc-1",
    titulo: "Hollow Knight - Action Figure",
    data: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    filamentoId: "fil-pla",
    pesoPeca: 45,
    pesoSuporte: 5,
    tempoImpressaoMinutos: 310, // 5h 10m
    tempoSetupMinutos: 15,
    tempoPosProcessamentoMinutos: 25,
    impressoraId: "imp-ender",
    custoKwh: 0.85,
    custoMaoDeObraHora: 20.0,
    taxaFalha: 10,
    lucroDesejado: 80,
    calculado: {
      custoFilamento: 6.0,
      custoEnergia: 0.66,
      custoDepreciacao: 1.81,
      custoMaoDeObra: 13.33,
      custoPerda: 0.85,
      custoProducaoTotal: 22.65,
      precoVendaSugerido: 40.77,
      lucroLiquido: 18.12,
    },
  },
  {
    id: "orc-2",
    titulo: "Suporte de Headset Articulado",
    data: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    filamentoId: "fil-petg",
    pesoPeca: 120,
    pesoSuporte: 10,
    tempoImpressaoMinutos: 540, // 9h
    tempoSetupMinutos: 20,
    tempoPosProcessamentoMinutos: 15,
    impressoraId: "imp-bambu",
    custoKwh: 0.85,
    custoMaoDeObraHora: 25.0,
    taxaFalha: 5,
    lucroDesejado: 70,
    calculado: {
      custoFilamento: 19.5,
      custoEnergia: 1.68,
      custoDepreciacao: 6.30,
      custoMaoDeObra: 14.58,
      custoPerda: 1.37,
      custoProducaoTotal: 43.43,
      precoVendaSugerido: 73.83,
      lucroLiquido: 30.40,
    },
  },
];

export default function App() {
  // --- Catalogs state ---
  const [filamentos, setFilamentos] = useState<Filamento[]>([]);
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

  // --- Active Calculator Inputs ---
  const [activeTab, setActiveTab] = useState<"calculadora" | "orcamentos" | "inventario">("calculadora");
  const [orcamentoTitulo, setOrcamentoTitulo] = useState("Minha Nova Impressão 3D");
  const [selectedFilamentoId, setSelectedFilamentoId] = useState("");
  const [selectedFilamentoIdSecundario, setSelectedFilamentoIdSecundario] = useState("");
  const [selectedImpressoraId, setSelectedImpressoraId] = useState("");

  const [multiMaterialActive, setMultiMaterialActive] = useState<boolean>(false);
  const [pesoPeca, setPesoPeca] = useState<number>(0);
  const [pesoSuporte, setPesoSuporte] = useState<number>(0);
  const [pesoSecundario, setPesoSecundario] = useState<number>(0);
  
  // Filamentos 3 e 4 (Multi-Material estendido para até 4 filamentos)
  const [multiMaterialActive3, setMultiMaterialActive3] = useState<boolean>(false);
  const [selectedFilamentoId3, setSelectedFilamentoId3] = useState("");
  const [pesoSecundario3, setPesoSecundario3] = useState<number>(0);

  const [multiMaterialActive4, setMultiMaterialActive4] = useState<boolean>(false);
  const [selectedFilamentoId4, setSelectedFilamentoId4] = useState("");
  const [pesoSecundario4, setPesoSecundario4] = useState<number>(0);
  const [tempoImpressaoHoras, setTempoImpressaoHoras] = useState<number>(0);
  const [tempoImpressaoMinutos, setTempoImpressaoMinutos] = useState<number>(0);
  
  const [tempoSetupMinutos, setTempoSetupMinutos] = useState<number>(0);
  const [tempoPosProcessamentoMinutos, setTempoPosProcessamentoMinutos] = useState<number>(0);
  
  const [custoKwh, setCustoKwh] = useState<number>(0); // R$ por kWh
  const [custoMaoDeObraHora, setCustoMaoDeObraHora] = useState<number>(0); // R$ por hora ativa de trabalho
  
  const [taxaFalha, setTaxaFalha] = useState<number>(10); // % de risco (Iniciando com 10% padrão conforme solicitado)
  const [margemModo, setMargemModo] = useState<"porcentagem" | "valor">("porcentagem");
  const [precoVendaAlvo, setPrecoVendaAlvo] = useState<number>(73);
  const [lucroDesejado, setLucroDesejado] = useState<number>(80); // % de markup
  
  const [custoEmbalagem, setCustoEmbalagem] = useState<number>(0); // R$ embalagem
  const [custoOutros, setCustoOutros] = useState<number>(0); // Outros custos em R$
  const [taxaImpostosTaxas, setTaxaImpostosTaxas] = useState<number>(0); // % plataforma + taxas
  
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  // --- Initialize states from localStorage ---
  useEffect(() => {
    try {
      const savedFilamentos = localStorage.getItem("c3d_filamentos");
      const savedImpressoras = localStorage.getItem("c3d_impressoras");
      const savedOrcamentos = localStorage.getItem("c3d_orcamentos");

      if (savedFilamentos) {
        const parsed = JSON.parse(savedFilamentos);
        setFilamentos(parsed);
        if (parsed.length > 0) {
          setSelectedFilamentoId(parsed[0].id);
          setSelectedFilamentoIdSecundario(parsed[1]?.id || parsed[0].id);
        }
      } else {
        localStorage.setItem("c3d_filamentos", JSON.stringify(FILAMENTOS_PADRAO));
        setFilamentos(FILAMENTOS_PADRAO);
        setSelectedFilamentoId(FILAMENTOS_PADRAO[0].id);
        setSelectedFilamentoIdSecundario(FILAMENTOS_PADRAO[1]?.id || FILAMENTOS_PADRAO[0].id);
      }

      if (savedImpressoras) {
        const parsed = JSON.parse(savedImpressoras);
        setImpressoras(parsed);
        if (parsed.length > 0) setSelectedImpressoraId(parsed[0].id);
      } else {
        localStorage.setItem("c3d_impressoras", JSON.stringify(IMPRESSORAS_PADRAO));
        setImpressoras(IMPRESSORAS_PADRAO);
        setSelectedImpressoraId(IMPRESSORAS_PADRAO[0].id);
      }

      if (savedOrcamentos) {
        setOrcamentos(JSON.parse(savedOrcamentos));
      } else {
        localStorage.setItem("c3d_orcamentos", JSON.stringify(ORCAMENTOS_PADRAO));
        setOrcamentos(ORCAMENTOS_PADRAO);
      }
    } catch (e) {
      console.error("Falha ao recuperar dados do localStorage", e);
    }
  }, []);

  // --- Save lists helper ---
  const saveFilamentosList = (list: Filamento[]) => {
    setFilamentos(list);
    localStorage.setItem("c3d_filamentos", JSON.stringify(list));
  };

  const saveImpressorasList = (list: Impressora[]) => {
    setImpressoras(list);
    localStorage.setItem("c3d_impressoras", JSON.stringify(list));
  };

  const saveOrcamentosList = (list: Orcamento[]) => {
    setOrcamentos(list);
    localStorage.setItem("c3d_orcamentos", JSON.stringify(list));
  };

  // --- Filament catalog actions ---
  const handleAddFilamento = (newF: Omit<Filamento, "id">) => {
    const fresh: Filamento = {
      ...newF,
      id: "fil-" + Date.now(),
    };
    const newList = [...filamentos, fresh];
    saveFilamentosList(newList);
    setSelectedFilamentoId(fresh.id);
    triggerFeedback("Filamento adicionado com sucesso!", "success");
  };

  const handleDeleteFilamento = (id: string) => {
    const newList = filamentos.filter((f) => f.id !== id);
    saveFilamentosList(newList);
    if (selectedFilamentoId === id && newList.length > 0) {
      setSelectedFilamentoId(newList[0].id);
    }
    triggerFeedback("Filamento removido.", "info");
  };

  const handleUpdateFilamento = (updated: Filamento) => {
    const newList = filamentos.map((f) => (f.id === updated.id ? updated : f));
    saveFilamentosList(newList);
    triggerFeedback("Filamento atualizado.", "success");
  };

  // --- Printer catalog actions ---
  const handleAddImpressora = (newP: Omit<Impressora, "id">) => {
    const fresh: Impressora = {
      ...newP,
      id: "imp-" + Date.now(),
    };
    const newList = [...impressoras, fresh];
    saveImpressorasList(newList);
    setSelectedImpressoraId(fresh.id);
    triggerFeedback("Impressora adicionada com sucesso!", "success");
  };

  const handleDeleteImpressora = (id: string) => {
    const newList = impressoras.filter((p) => p.id !== id);
    saveImpressorasList(newList);
    if (selectedImpressoraId === id && newList.length > 0) {
      setSelectedImpressoraId(newList[0].id);
    }
    triggerFeedback("Impressora removida.", "info");
  };

  const handleUpdateImpressora = (updated: Impressora) => {
    const newList = impressoras.map((p) => (p.id === updated.id ? updated : p));
    saveImpressorasList(newList);
    triggerFeedback("Impressora atualizada.", "success");
  };

  // --- Feedback notification helper ---
  const triggerFeedback = (text: string, type: "success" | "info" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // --- Calculations Logic ---
  const activeFilamento = filamentos.find((f) => f.id === selectedFilamentoId) || filamentos[0];
  const activeFilamentoSecundario = filamentos.find((f) => f.id === selectedFilamentoIdSecundario) || filamentos[1] || filamentos[0];
  const activeFilamento3 = filamentos.find((f) => f.id === selectedFilamentoId3) || filamentos[2] || filamentos[0];
  const activeFilamento4 = filamentos.find((f) => f.id === selectedFilamentoId4) || filamentos[3] || filamentos[0];
  const activeImpressora = impressoras.find((p) => p.id === selectedImpressoraId) || impressoras[0];

  const totalPesoG = (Number(pesoPeca) || 0) + (Number(pesoSuporte) || 0);
  const totalTempoMinutos = (Number(tempoImpressaoHoras) || 0) * 60 + (Number(tempoImpressaoMinutos) || 0);

  // 1. Material (g) - Primary & Optional Secondary, Tertiary, Quaternary (Até 4 total)
  const custoFilamentoPrimario = activeFilamento ? totalPesoG * (activeFilamento.preco / activeFilamento.peso) : 0;
  const custoFilamentoSecundario = (multiMaterialActive && activeFilamentoSecundario) ? (Number(pesoSecundario) || 0) * (activeFilamentoSecundario.preco / activeFilamentoSecundario.peso) : 0;
  const custoFilamentoTerciario = (multiMaterialActive && multiMaterialActive3 && activeFilamento3) ? (Number(pesoSecundario3) || 0) * (activeFilamento3.preco / activeFilamento3.peso) : 0;
  const custoFilamentoQuaternario = (multiMaterialActive && multiMaterialActive4 && activeFilamento4) ? (Number(pesoSecundario4) || 0) * (activeFilamento4.preco / activeFilamento4.peso) : 0;
  
  const custoFilamento = custoFilamentoPrimario + custoFilamentoSecundario + custoFilamentoTerciario + custoFilamentoQuaternario;

  // 2. Energia (kWh)
  const tempoImpressaoHorasDecimal = totalTempoMinutos / 60;
  const consumoKwh = activeImpressora ? (activeImpressora.potencia * tempoImpressaoHorasDecimal) / 1000 : 0;
  const custoEnergia = consumoKwh * (Number(custoKwh) || 0);

  // 3. Depreciação / Desgaste
  const custoDepreciacao = activeImpressora ? tempoImpressaoHorasDecimal * activeImpressora.custoDepreciacaoHora : 0;

  // 4. Mão de obra (Somente trabalho ativo em preparação e pós processamento)
  const tempoTrabalhoMinutos = (Number(tempoSetupMinutos) || 0) + (Number(tempoPosProcessamentoMinutos) || 0);
  const custoMaoDeObra = (tempoTrabalhoMinutos / 60) * (Number(custoMaoDeObraHora) || 0);

  // 5. Perda por falha (Calculado sobre custos reais de máquina + filamento)
  const subtotalProcesso = custoFilamento + custoEnergia + custoDepreciacao;
  const custoPerda = subtotalProcesso * ((Number(taxaFalha) || 0) / 100);

  const custoEmbalagemNum = Number(custoEmbalagem) || 0;
  const custoOutrosNum = Number(custoOutros) || 0;
  const taxaImpostosTaxasNum = Number(taxaImpostosTaxas) || 0;

  // 6. Custos totais de produção combinados (Produção + Mão de Obra + Embalagem + Outros Insumos)
  const custoProducaoTotal = subtotalProcesso + custoPerda + custoMaoDeObra + custoEmbalagemNum + custoOutrosNum;

  // 7 & 8. Determinar preço de venda sugerido e markup (lucro desejado) correspondente
  let precoVendaSugerido = 0;
  let activeLucroDesejado = Number(lucroDesejado) || 0;

  const taxaDivisor = 1 - (taxaImpostosTaxasNum / 100);

  if (margemModo === "porcentagem") {
    // Modo percentual (o usuário define o % de markup, calcula o preço de venda)
    const precoBaseSemTaxas = custoProducaoTotal * (1 + (Number(lucroDesejado) || 0) / 100);
    precoVendaSugerido = taxaDivisor > 0.05 ? (precoBaseSemTaxas / taxaDivisor) : (precoBaseSemTaxas / 0.05);
  } else {
    // Modo por valor final (o usuário define o preço final em R$, calcula o markup equivalente)
    precoVendaSugerido = Number(precoVendaAlvo) || 0;
    
    // De acordo com a álgebra reversa:
    // precoVendaSugerido = (custoProducaoTotal * (1 + lucroDesejado / 100)) / taxaDivisor
    // (precoVendaSugerido * taxaDivisor) / custoProducaoTotal = 1 + lucroDesejado / 100
    // lucroDesejado / 100 = ((precoVendaSugerido * taxaDivisor) / custoProducaoTotal) - 1
    const divisorCoef = taxaDivisor > 0.05 ? taxaDivisor : 0.05;
    const precoBase = precoVendaSugerido * divisorCoef;
    activeLucroDesejado = custoProducaoTotal > 0 ? parseFloat((((precoBase / custoProducaoTotal) - 1) * 100).toFixed(1)) : 0;
  }

  const custoImpostosTaxas = precoVendaSugerido * (taxaImpostosTaxasNum / 100);

  // 9. Lucro líquido real (Preço final - Gastos totais - Taxas deduzidas)
  const lucroLiquido = precoVendaSugerido - custoProducaoTotal - custoImpostosTaxas;

  // Efeito secundário para manter precoVendaAlvo atualizado enquanto estiver em modo percentual
  useEffect(() => {
    if (margemModo === "porcentagem" && precoVendaSugerido > 0) {
      setPrecoVendaAlvo(parseFloat(precoVendaSugerido.toFixed(2)));
    }
  }, [margemModo, precoVendaSugerido]);

  // --- Handlers for parsed slicer G-Code data ---
  const handleGCodeDataParsed = (data: { pesoGramas: number; tempoMinutos: number; slicerName: string }) => {
    setPesoPeca(data.pesoGramas);
    setPesoSuporte(0); // reset supports to avoid duplicate calculations since weight from slicer totals both

    const hours = Math.floor(data.tempoMinutos / 60);
    const mins = data.tempoMinutos % 60;
    setTempoImpressaoHoras(hours);
    setTempoImpressaoMinutos(mins);

    triggerFeedback(`Dados do fatiador (${data.slicerName}) aplicados: ${data.pesoGramas}g e ${hours}h ${mins}m`, "success");
  };

  // --- Reset All Parameters to 0 ---
  const handleResetAllFields = () => {
    setOrcamentoTitulo("Minha Nova Impressão 3D");
    setPesoPeca(0);
    setPesoSuporte(0);
    setPesoSecundario(0);
    setMultiMaterialActive3(false);
    setSelectedFilamentoId3("");
    setPesoSecundario3(0);
    setMultiMaterialActive4(false);
    setSelectedFilamentoId4("");
    setPesoSecundario4(0);
    setTempoImpressaoHoras(0);
    setTempoImpressaoMinutos(0);
    setTempoSetupMinutos(0);
    setTempoPosProcessamentoMinutos(0);
    setCustoKwh(0);
    setCustoMaoDeObraHora(0);
    setTaxaFalha(10); // Iniciando com 10% padrão conforme solicitado
    setMargemModo("porcentagem");
    setLucroDesejado(80);
    setCustoEmbalagem(0);
    setCustoOutros(0);
    setTaxaImpostosTaxas(0);
    triggerFeedback("Todos os campos do orçamento foram zerados!", "info");
  };

  // --- Save current quote ---
  const handleSaveOrcamento = () => {
    if (!orcamentoTitulo.trim()) {
      triggerFeedback("Escreva um título para salvar seu orçamento.", "error");
      return;
    }

    const extraFilamentosArray = [];
    if (multiMaterialActive3) {
      extraFilamentosArray.push({ filamentoId: selectedFilamentoId3, peso: Number(pesoSecundario3) || 0 });
    }
    if (multiMaterialActive4) {
      extraFilamentosArray.push({ filamentoId: selectedFilamentoId4, peso: Number(pesoSecundario4) || 0 });
    }

    const novoOrcamento: Orcamento = {
      id: "orc-" + Date.now(),
      titulo: orcamentoTitulo,
      data: new Date().toISOString(),
      filamentoId: selectedFilamentoId,
      pesoPeca: Number(pesoPeca) || 0,
      pesoSuporte: Number(pesoSuporte) || 0,
      tempoImpressaoMinutos: totalTempoMinutos,
      tempoSetupMinutos: Number(tempoSetupMinutos) || 0,
      tempoPosProcessamentoMinutos: Number(tempoPosProcessamentoMinutos) || 0,
      impressoraId: selectedImpressoraId,
      custoKwh: Number(custoKwh) || 0,
      custoMaoDeObraHora: Number(custoMaoDeObraHora) || 0,
      taxaFalha: Number(taxaFalha) || 0,
      lucroDesejado: Math.round(activeLucroDesejado),
      multiMaterialActive,
      filamentoIdSecundario: selectedFilamentoIdSecundario,
      pesoSecundario: Number(pesoSecundario) || 0,
      extraFilamentos: extraFilamentosArray,
      custoEmbalagem: Number(custoEmbalagem) || 0,
      custoOutros: Number(custoOutros) || 0,
      taxaImpostosTaxas: Number(taxaImpostosTaxas) || 0,
      calculado: {
        custoFilamento,
        custoEnergia,
        custoDepreciacao,
        custoMaoDeObra,
        custoPerda,
        custoEmbalagem: custoEmbalagemNum,
        custoOutros: custoOutrosNum,
        custoImpostosTaxas,
        custoProducaoTotal,
        precoVendaSugerido,
        lucroLiquido,
      },
    };

    const newList = [novoOrcamento, ...orcamentos];
    saveOrcamentosList(newList);
    triggerFeedback(`Orçamento "${orcamentoTitulo}" salvo localmente!`, "success");
  };

  // --- Load saved quote back to calculator state ---
  const handleLoadOrcamento = (orc: Orcamento) => {
    setActiveTab("calculadora");
    setMargemModo("porcentagem");
    setOrcamentoTitulo(orc.titulo);
    setSelectedFilamentoId(orc.filamentoId);
    setPesoPeca(orc.pesoPeca);
    setPesoSuporte(orc.pesoSuporte);

    setMultiMaterialActive(orc.multiMaterialActive || false);
    setSelectedFilamentoIdSecundario(orc.filamentoIdSecundario || "");
    setPesoSecundario(orc.pesoSecundario || 0);

    // Restaurar filamentos 3 e 4 se existirem na lista de extras
    if (orc.extraFilamentos && orc.extraFilamentos.length > 0) {
      const extra3 = orc.extraFilamentos[0];
      const extra4 = orc.extraFilamentos[1];

      if (extra3) {
        setMultiMaterialActive3(true);
        setSelectedFilamentoId3(extra3.filamentoId);
        setPesoSecundario3(extra3.peso);
      } else {
        setMultiMaterialActive3(false);
        setSelectedFilamentoId3("");
        setPesoSecundario3(0);
      }

      if (extra4) {
        setMultiMaterialActive4(true);
        setSelectedFilamentoId4(extra4.filamentoId);
        setPesoSecundario4(extra4.peso);
      } else {
        setMultiMaterialActive4(false);
        setSelectedFilamentoId4("");
        setPesoSecundario4(0);
      }
    } else {
      setMultiMaterialActive3(false);
      setSelectedFilamentoId3("");
      setPesoSecundario3(0);
      setMultiMaterialActive4(false);
      setSelectedFilamentoId4("");
      setPesoSecundario4(0);
    }

    const horas = Math.floor(orc.tempoImpressaoMinutos / 60);
    const mins = orc.tempoImpressaoMinutos % 60;
    setTempoImpressaoHoras(horas);
    setTempoImpressaoMinutos(mins);

    setTempoSetupMinutos(orc.tempoSetupMinutos);
    setTempoPosProcessamentoMinutos(orc.tempoPosProcessamentoMinutos);
    setSelectedImpressoraId(orc.impressoraId);
    
    setCustoKwh(orc.custoKwh);
    setCustoMaoDeObraHora(orc.custoMaoDeObraHora);
    setTaxaFalha(orc.taxaFalha);
    setLucroDesejado(orc.lucroDesejado);
    setCustoEmbalagem(orc.custoEmbalagem || 0);
    setCustoOutros(orc.custoOutros || 0);
    setTaxaImpostosTaxas(orc.taxaImpostosTaxas || 0);

    triggerFeedback(`Orçamento "${orc.titulo}" carregado com sucesso!`, "info");
    
    // Smooth scroll to fields
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // --- Delete saved quote ---
  const handleDeleteOrcamento = (id: string) => {
    const list = orcamentos.filter((o) => o.id !== id);
    saveOrcamentosList(list);
    triggerFeedback("Orçamento removido do histórico.", "info");
  };

  // --- Generate & Copy budget text summary ---
  const handleCopyTextSummary = (orc: Orcamento) => {
    const fil = filamentos.find((f) => f.id === orc.filamentoId) || activeFilamento;
    const filSec = orc.multiMaterialActive && orc.filamentoIdSecundario 
      ? (filamentos.find((f) => f.id === orc.filamentoIdSecundario) || activeFilamentoSecundario) 
      : null;
    const imp = impressoras.find((p) => p.id === orc.impressoraId) || activeImpressora;

    const h = Math.floor(orc.tempoImpressaoMinutos / 60);
    const m = orc.tempoImpressaoMinutos % 60;

    let totalPesoGNum = orc.pesoPeca + orc.pesoSuporte;
    let pesoSubstr = `Peça principal + Suporte: ${orc.pesoPeca + orc.pesoSuporte}g`;
    if (orc.multiMaterialActive) {
      if (orc.pesoSecundario && orc.pesoSecundario > 0) {
        totalPesoGNum += orc.pesoSecundario;
        pesoSubstr += ` | Filamento 2: ${orc.pesoSecundario}g`;
      }
      if (orc.extraFilamentos) {
        orc.extraFilamentos.forEach((extra, index) => {
          totalPesoGNum += extra.peso || 0;
          pesoSubstr += ` | Filamento ${index + 3}: ${extra.peso || 0}g`;
        });
      }
    }

    const embalagemStr = orc.custoEmbalagem && orc.custoEmbalagem > 0 ? `\n• Embalagem/Envio: R$ ${orc.custoEmbalagem.toFixed(2)}` : "";
    const outrosStr = orc.custoOutros && orc.custoOutros > 0 ? `\n• Outros Insumos: R$ ${orc.custoOutros.toFixed(2)}` : "";
    const impostoStr = orc.taxaImpostosTaxas && orc.taxaImpostosTaxas > 0 ? `\n• Plataforma / Tarifa de Venda (${orc.taxaImpostosTaxas}%): R$ ${(orc.calculado.custoImpostosTaxas || 0).toFixed(2)}` : "";

    let filamentosListStr = `• Filamento Primário: ${fil ? `${fil.nome} (${fil.tipo})` : "N/A"}`;
    if (orc.multiMaterialActive) {
      if (filSec) {
        filamentosListStr += `\n• Filamento Secundário: ${filSec.nome} (${filSec.tipo})`;
      }
      if (orc.extraFilamentos) {
        orc.extraFilamentos.forEach((extra, idx) => {
          const extraFil = filamentos.find((f) => f.id === extra.filamentoId);
          if (extraFil) {
            filamentosListStr += `\n• Filamento ${idx + 3}: ${extraFil.nome} (${extraFil.tipo})`;
          }
        });
      }
    }

    const texto = `🛠️ *ORÇAMENTO DE IMPRESSÃO 3D - ${orc.titulo.toUpperCase()}* 🚀

📦 *Especificações Técnicas:*
• Peso estimado total: ${totalPesoGNum}g (${pesoSubstr})
• Tempo de Impressão: ${h}h ${m}min
${filamentosListStr}
• Impressora: ${imp ? imp.nome : "N/A"}

💰 *Detalhamento dos Custos:*
• Matéria-prima (Filamento/s): R$ ${orc.calculado.custoFilamento.toFixed(2)}
• Consumo Elétrico: R$ ${orc.calculado.custoEnergia.toFixed(2)}
• Manutenção/Depreciação: R$ ${orc.calculado.custoDepreciacao.toFixed(2)}
• Mão de Obra de Acabamento & Setup: R$ ${orc.calculado.custoMaoDeObra.toFixed(2)}
• Taxa de Risco de Falha (${orc.taxaFalha}%): R$ ${orc.calculado.custoPerda.toFixed(2)}${embalagemStr}${outrosStr}${impostoStr}

---------------------------------------
💵 *Custo Total de Produção:* R$ ${orc.calculado.custoProducaoTotal.toFixed(2)}
⭐ *Preço de Venda Sugerido (Lucro ${orc.lucroDesejado}%): R$ ${orc.calculado.precoVendaSugerido.toFixed(2)}*
🌟 *Lucro Líquido Real esperado: R$ ${orc.calculado.lucroLiquido.toFixed(2)}*
---------------------------------------

*Obrigado pela preferência!* Um excelente dia. 
_Calculadora de Impressão 3D Premium_`;

    navigator.clipboard.writeText(texto)
      .then(() => triggerFeedback("Resumo completo copiado para o Clipboard!", "success"))
      .catch(() => triggerFeedback("Erro ao copiar para clipboard.", "error"));
  };

  // --- Copy current dynamic calculator state directly ---
  const handleCopyCurrentState = () => {
    const tempOrcObj: Orcamento = {
      id: "temp",
      titulo: orcamentoTitulo,
      data: new Date().toISOString(),
      filamentoId: selectedFilamentoId,
      pesoPeca,
      pesoSuporte,
      tempoImpressaoMinutos: totalTempoMinutos,
      tempoSetupMinutos,
      tempoPosProcessamentoMinutos,
      impressoraId: selectedImpressoraId,
      custoKwh,
      custoMaoDeObraHora,
      taxaFalha,
      lucroDesejado: Math.round(activeLucroDesejado),
      multiMaterialActive,
      filamentoIdSecundario: selectedFilamentoIdSecundario,
      pesoSecundario: Number(pesoSecundario) || 0,
      custoEmbalagem: Number(custoEmbalagem) || 0,
      custoOutros: Number(custoOutros) || 0,
      taxaImpostosTaxas: Number(taxaImpostosTaxas) || 0,
      calculado: {
        custoFilamento,
        custoEnergia,
        custoDepreciacao,
        custoMaoDeObra,
        custoPerda,
        custoEmbalagem: custoEmbalagemNum,
        custoOutros: custoOutrosNum,
        custoImpostosTaxas,
        custoProducaoTotal,
        precoVendaSugerido,
        lucroLiquido,
      }
    };
    handleCopyTextSummary(tempOrcObj);
  };

  // --- Export All configurations to a JSON backup file ---
  const handleExportJSON = () => {
    const backupData = {
      filamentos,
      impressoras,
      orcamentos,
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `calculadora_3d_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerFeedback("Configurações e histórico exportados com sucesso!", "success");
  };

  // --- Import configurations from a JSON backup file ---
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.filamentos && Array.isArray(parsed.filamentos)) {
          saveFilamentosList(parsed.filamentos);
          if (parsed.filamentos.length > 0) setSelectedFilamentoId(parsed.filamentos[0].id);
        }
        if (parsed.impressoras && Array.isArray(parsed.impressoras)) {
          saveImpressorasList(parsed.impressoras);
          if (parsed.impressoras.length > 0) setSelectedImpressoraId(parsed.impressoras[0].id);
        }
        if (parsed.orcamentos && Array.isArray(parsed.orcamentos)) {
          saveOrcamentosList(parsed.orcamentos);
        }
        triggerFeedback("Backup restaurado e sincronizado!", "success");
      } catch (err) {
        triggerFeedback("Código inválido ou arquivo incompatível.", "error");
      }
    };
    reader.readAsText(file);
  };

  // -- Trigger default printing flow of browser --
  const handlePrintQuote = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Toast feedback alerts */}
      {feedbackMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-slate-900 text-white rounded-xl shadow-xl px-4 py-3 border border-slate-800 animate-slide-up">
          <span className={`w-2.5 h-2.5 rounded-full ${
            feedbackMsg.type === "success" ? "bg-brand-orange" : feedbackMsg.type === "error" ? "bg-red-400" : "bg-brand-teal"
          }`} />
          <span className="text-xs font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Styled Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <ArteStudio3DLogo />

          {/* Navigation Tab selection and global actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
              <button
                onClick={() => setActiveTab("calculadora")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "calculadora"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Calculator size={13} />
                <span>Calculadora</span>
              </button>
              <button
                onClick={() => setActiveTab("orcamentos")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "orcamentos"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Receipt size={13} />
                <span>Orçamentos Salvos</span>
              </button>
              <button
                onClick={() => setActiveTab("inventario")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === "inventario"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Briefcase size={13} />
                <span>Inventário & Perfis</span>
              </button>
            </div>

            {/* JSON Backups Utility panel */}
            <div className="flex items-center space-x-1.5 ml-1 border-l pl-2.5 border-slate-200 dark:border-slate-800">
              <button
                onClick={handleExportJSON}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 transition-colors"
                title="Exportar backup completo"
              >
                <Download size={14} />
              </button>
              <label
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                title="Importar backup (.json)"
              >
                <Upload size={14} />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        
        {activeTab === "calculadora" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LADO ESQUERDO: Inputs Form (7 colunas no desktop) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Orçamento Titulação Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      Descrição do Serviço / Objeto do Orçamento
                    </label>
                    <input
                      type="text"
                      value={orcamentoTitulo}
                      onChange={(e) => setOrcamentoTitulo(e.target.value)}
                      className="w-full text-base font-bold bg-transparent border-b border-transparent hover:border-slate-200 focus:border-brand-teal font-sans focus:outline-none dark:text-white dark:hover:border-slate-700 py-0.5"
                      placeholder="Ex: Hollow Knight Action Figure"
                    />
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <button
                      onClick={handleResetAllFields}
                      className="flex-shrink-0 flex items-center justify-center gap-1.5 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-[0.98] text-slate-600 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                      title="Definir todos os parâmetros para zero"
                    >
                      <RefreshCw size={13} className="text-slate-500" />
                      <span>Zerar Campos</span>
                    </button>
                    <button
                      onClick={handleSaveOrcamento}
                      className="flex-shrink-0 flex items-center justify-center gap-1.5 bg-brand-orange hover:bg-brand-orange-hover active:scale-[0.98] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Sparkles size={13} />
                      <span>Salvar Orçamento</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Slicer File GCode Drag and Drop Parser */}
              <GCodeParser onDataParsed={handleGCodeDataParsed} />

              {/* Parâmetros do Filamento */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-brand-teal/10 text-brand-teal dark:bg-brand-teal/20 dark:text-brand-teal rounded-lg">
                      <Layers size={15} />
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                      1. Material & Fatiador (Gramas)
                    </h3>
                  </div>
                  
                  {/* Select dropdown pre-loaded filaments */}
                  <select
                    value={selectedFilamentoId}
                    onChange={(e) => setSelectedFilamentoId(e.target.value)}
                    className="text-xs p-1.5 pr-8 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-800 dark:text-white select-none max-w-[190px]"
                  >
                    {filamentos.map((fil) => (
                      <option key={fil.id} value={fil.id}>
                        {fil.nome} ({fil.tipo}) - R$ {fil.preco.toFixed(0)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Peso da Peça (g)
                      </label>
                      <span className="text-[10px] font-mono font-medium text-slate-400">g</span>
                    </div>
                    <input
                      type="number"
                      value={pesoPeca || ""}
                      onChange={(e) => setPesoPeca(Math.max(0, Number(e.target.value)))}
                      className="w-full font-mono text-sm p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-brand-teal text-slate-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Peso dos Suportes (g)
                      </label>
                      <span className="text-[10px] font-mono font-medium text-slate-400">g</span>
                    </div>
                    <input
                      type="number"
                      value={pesoSuporte || ""}
                      onChange={(e) => setPesoSuporte(Math.max(0, Number(e.target.value)))}
                      className="w-full font-mono text-sm p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-brand-teal text-slate-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {activeFilamento && (
                  <div className="flex items-center justify-between bg-brand-teal/5 dark:bg-brand-teal/10 px-3 py-2 rounded-xl text-[11px] text-brand-teal dark:text-cyan-400">
                    <span className="font-medium">
                      Filamento primário: <strong className="font-bold">{activeFilamento.nome}</strong> ({activeFilamento.tipo})
                    </span>
                    <span className="font-semibold font-mono">
                      Custo g: R$ {(activeFilamento.preco / activeFilamento.peso).toFixed(4)}
                    </span>
                  </div>
                )}

                {/* Opção para ativar Segundo Filamento / Multi-material */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Usa mais de um filamento neste projeto (Multi-material)?
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={multiMaterialActive}
                      onChange={(e) => setMultiMaterialActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-brand-teal"></div>
                  </label>
                </div>

                <AnimatePresence initial={false}>
                  {multiMaterialActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden space-y-4 border-t border-dashed border-slate-100 dark:border-slate-800 pt-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          2º Filamento
                        </h4>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          Filamento Secundário (ex: PETG, ABS, outra cor)
                        </label>
                        <select
                          value={selectedFilamentoIdSecundario}
                          onChange={(e) => setSelectedFilamentoIdSecundario(e.target.value)}
                          className="text-xs p-1.5 pr-8 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-800 dark:text-white select-none w-full sm:w-auto sm:max-w-[210px]"
                        >
                          {filamentos.map((fil) => (
                            <option key={fil.id} value={fil.id}>
                              {fil.nome} ({fil.tipo}) - R$ {fil.preco.toFixed(0)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            Peso do Filamento Secundário (g)
                          </label>
                          <span className="text-[10px] font-mono font-medium text-slate-400">g</span>
                        </div>
                        <input
                          type="number"
                          value={pesoSecundario || ""}
                          onChange={(e) => setPesoSecundario(Math.max(0, Number(e.target.value)))}
                          className="w-full font-mono text-sm p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-brand-teal text-slate-900 dark:text-white"
                          placeholder="Ex: 25"
                        />
                      </div>

                      {activeFilamentoSecundario && (
                        <div className="flex items-center justify-between bg-brand-teal/5 dark:bg-brand-teal/10 px-3 py-2 rounded-xl text-[11px] text-brand-teal">
                          <span className="font-medium">
                            Filamento secundário: <strong className="font-bold">{activeFilamentoSecundario.nome}</strong> ({activeFilamentoSecundario.tipo})
                          </span>
                          <span className="font-semibold font-mono">
                            Custo g: R$ {(activeFilamentoSecundario.preco / activeFilamentoSecundario.weight || activeFilamentoSecundario.preco / activeFilamentoSecundario.peso).toFixed(4)}
                          </span>
                        </div>
                      )}

                      {/* --- FILAMENTO 3 --- */}
                      {!multiMaterialActive3 ? (
                        <div className="pt-2 border-t border-dashed border-slate-100 dark:border-slate-805/60">
                          <button
                            type="button"
                            onClick={() => {
                              setMultiMaterialActive3(true);
                              if (!selectedFilamentoId3) {
                                setSelectedFilamentoId3(filamentos[2]?.id || filamentos[0]?.id || "");
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs text-brand-orange dark:text-brand-orange hover:text-brand-orange-hover dark:hover:text-brand-orange-hover font-semibold transition"
                          >
                            <Plus size={14} />
                            <span>+ Habilitar 3º Filamento</span>
                          </button>
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-dashed border-slate-150 dark:border-slate-800/60 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              3º Filamento
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                setMultiMaterialActive3(false);
                                setPesoSecundario3(0);
                              }}
                              className="text-[10px] text-red-500 hover:text-red-600 font-medium transition"
                            >
                              Remover
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              Filamento Terciário
                            </label>
                            <select
                              value={selectedFilamentoId3}
                              onChange={(e) => setSelectedFilamentoId3(e.target.value)}
                              className="text-xs p-1.5 pr-8 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-800 dark:text-white select-none w-full sm:w-auto sm:max-w-[210px]"
                            >
                              {filamentos.map((fil) => (
                                <option key={fil.id} value={fil.id}>
                                  {fil.nome} ({fil.tipo}) - R$ {fil.preco.toFixed(0)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                Peso do Filamento Terciário (g)
                              </label>
                              <span className="text-[10px] font-mono font-medium text-slate-400">g</span>
                            </div>
                            <input
                              type="number"
                              value={pesoSecundario3 || ""}
                              onChange={(e) => setPesoSecundario3(Math.max(0, Number(e.target.value)))}
                              className="w-full font-mono text-sm p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-brand-teal text-slate-900 dark:text-white"
                              placeholder="Ex: 15"
                            />
                          </div>

                          {activeFilamento3 && (
                            <div className="flex items-center justify-between bg-purple-50/40 dark:bg-purple-950/20 px-3 py-2 rounded-xl text-[11px] text-purple-800 dark:text-purple-300">
                              <span className="font-medium">
                                Filamento terciário: <strong className="font-bold">{activeFilamento3.nome}</strong> ({activeFilamento3.tipo})
                              </span>
                              <span className="font-semibold font-mono">
                                Custo g: R$ {(activeFilamento3.preco / activeFilamento3.peso).toFixed(4)}
                              </span>
                            </div>
                          )}

                          {/* --- FILAMENTO 4 --- */}
                          {!multiMaterialActive4 ? (
                            <div className="pt-2 border-t border-dashed border-slate-100 dark:border-slate-800/60">
                              <button
                                type="button"
                                onClick={() => {
                                  setMultiMaterialActive4(true);
                                  if (!selectedFilamentoId4) {
                                    setSelectedFilamentoId4(filamentos[3]?.id || filamentos[0]?.id || "");
                                  }
                                }}
                                className="flex items-center gap-1.5 text-xs text-brand-orange dark:text-brand-orange hover:text-brand-orange-hover dark:hover:text-brand-orange-hover font-semibold transition"
                              >
                                <Plus size={14} />
                                <span>+ Habilitar 4º Filamento</span>
                              </button>
                            </div>
                          ) : (
                            <div className="pt-4 border-t border-dashed border-slate-150 dark:border-slate-800/60 space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  4º Filamento
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMultiMaterialActive4(false);
                                    setPesoSecundario4(0);
                                  }}
                                  className="text-[10px] text-red-500 hover:text-red-600 font-medium transition"
                                >
                                  Remover
                                </button>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                  Filamento Quaternário
                                </label>
                                <select
                                  value={selectedFilamentoId4}
                                  onChange={(e) => setSelectedFilamentoId4(e.target.value)}
                                  className="text-xs p-1.5 pr-8 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-800 dark:text-white select-none w-full sm:w-auto sm:max-w-[210px]"
                                >
                                  {filamentos.map((fil) => (
                                    <option key={fil.id} value={fil.id}>
                                      {fil.nome} ({fil.tipo}) - R$ {fil.preco.toFixed(0)}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    Peso do Filamento Quaternário (g)
                                  </label>
                                  <span className="text-[10px] font-mono font-medium text-slate-400">g</span>
                                </div>
                                <input
                                  type="number"
                                  value={pesoSecundario4 || ""}
                                  onChange={(e) => setPesoSecundario4(Math.max(0, Number(e.target.value)))}
                                  className="w-full font-mono text-sm p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-brand-teal text-slate-900 dark:text-white"
                                  placeholder="Ex: 10"
                                />
                              </div>

                              {activeFilamento4 && (
                                <div className="flex items-center justify-between bg-orange-50/40 dark:bg-orange-950/20 px-3 py-2 rounded-xl text-[11px] text-orange-850 dark:text-orange-300">
                                  <span className="font-medium">
                                    Filamento quaternário: <strong className="font-bold">{activeFilamento4.nome}</strong> ({activeFilamento4.tipo})
                                  </span>
                                  <span className="font-semibold font-mono">
                                    Custo g: R$ {(activeFilamento4.preco / activeFilamento4.peso).toFixed(4)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tempo de Impressão & Energia */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-brand-teal/10 text-brand-teal dark:bg-brand-teal/20 dark:text-brand-teal rounded-lg">
                      <Clock size={15} />
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                      2. Estimativa de Tempo & Consumo Elétrico
                    </h3>
                  </div>

                  {/* Select preloaded printer select */}
                  <select
                    value={selectedImpressoraId}
                    onChange={(e) => setSelectedImpressoraId(e.target.value)}
                    className="text-xs p-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-800 dark:text-white-200 select-none max-w-[190px]"
                  >
                    {impressoras.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({p.potencia}W)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                      Tempo: Horas
                    </label>
                    <input
                      type="number"
                      value={tempoImpressaoHoras || ""}
                      onChange={(e) => setTempoImpressaoHoras(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-brand-teal"
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                      Tempo: Minutos
                    </label>
                    <input
                      type="number"
                      value={tempoImpressaoMinutos || ""}
                      onChange={(e) => setTempoImpressaoMinutos(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-brand-teal"
                      min="0"
                      max="59"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Custo da Energia (kWh)
                      </label>
                      <button 
                        onClick={() => triggerFeedback("Custo de referência do KWh de sua conta de luz regional (média de R$ 0.75 a R$ 0.95 no BR)", "info")}
                        className="text-slate-400 hover:text-slate-600"
                        title="Ajuda"
                      >
                        <Info size={11} />
                      </button>
                    </div>
                    <input
                      type="number"
                      value={custoKwh || ""}
                      onChange={(e) => setCustoKwh(Math.max(0, Number(e.target.value)))}
                      step="0.05"
                      className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-brand-teal"
                      placeholder="Ex: 0.85"
                    />
                  </div>
                </div>

                {activeImpressora && (
                  <div className="flex items-center justify-between bg-brand-teal/5 dark:bg-brand-teal/10 px-3 py-2 rounded-xl text-[11px] text-brand-teal">
                    <span className="font-medium">
                      Equipamento: <strong className="font-bold">{activeImpressora.nome}</strong> ({activeImpressora.potencia}W)
                    </span>
                    <span className="font-semibold font-mono">
                      Taxa de Desgaste: R$ {activeImpressora.custoDepreciacaoHora.toFixed(2)}/hora
                    </span>
                  </div>
                )}
              </div>

              {/* Mão de Obra & Setup */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="p-1.5 bg-brand-teal/10 text-brand-teal dark:bg-brand-teal/20 dark:text-brand-teal rounded-lg">
                    <Briefcase size={15} />
                  </span>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    3. Mão de Obra Operacional / Setup
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                      Fatiamento / Setup (m)
                    </label>
                    <input
                      type="number"
                      value={tempoSetupMinutos || ""}
                      onChange={(e) => setTempoSetupMinutos(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-brand-teal"
                      placeholder="Ex: 15"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                      Pós-Processamento (m)
                    </label>
                    <input
                      type="number"
                      value={tempoPosProcessamentoMinutos || ""}
                      onChange={(e) => setTempoPosProcessamentoMinutos(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-brand-teal"
                      placeholder="Ex: 20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                      Custo da sua Hora (R$)
                    </label>
                    <input
                      type="number"
                      value={custoMaoDeObraHora || ""}
                      onChange={(e) => setCustoMaoDeObraHora(Math.max(0, Number(e.target.value)))}
                      className="w-full font-mono text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-brand-teal"
                      placeholder="Ex: 25.00"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  * A mão de obra calcula o tempo gasto lavando peças de resina, aplicando primer, removendo suportes e fatiando. O tempo ocioso em que a máquina imprime é de responsabilidade da máquina (considerada no desgaste).
                </p>
              </div>

              {/* Embalagem, Plataformas e Outros Custos */}
              <div id="cost-packaging-others" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="p-1.5 bg-brand-teal/10 text-brand-teal dark:bg-brand-teal/20 dark:text-brand-teal rounded-lg">
                    <Package size={15} />
                  </span>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    4. Embalagem, Encomenda & Impostos / Taxas
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Custo de Embalagem */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Custo da Embalagem
                      </label>
                      <span className="text-[10px] font-mono font-medium text-slate-400">R$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={custoEmbalagem || ""}
                      onChange={(e) => setCustoEmbalagem(Math.max(0, Number(e.target.value)))}
                      className="w-full font-mono text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-brand-teal text-slate-900 dark:text-white"
                      placeholder="Ex: 5.00"
                    />
                    <span className="text-[10px] text-slate-400 block leading-tight">Caixas, plástico bolha, fitas</span>
                  </div>

                  {/* Outros Custos */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Outros Custos / Insumos
                      </label>
                      <span className="text-[10px] font-mono font-medium text-slate-400">R$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={custoOutros || ""}
                      onChange={(e) => setCustoOutros(Math.max(0, Number(e.target.value)))}
                      className="w-full font-mono text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-brand-teal text-slate-900 dark:text-white"
                      placeholder="Ex: 2.50"
                    />
                    <span className="text-[10px] text-slate-400 block leading-tight">Cola, spray, parafusos, lixas</span>
                  </div>

                  {/* Impostos / Comissão de Plataforma */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center bg-transparent">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Taxas / Tarifa de Venda
                      </label>
                      <span className="text-[10px] font-mono font-bold text-brand-teal">{taxaImpostosTaxas}%</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      step="1"
                      value={taxaImpostosTaxas || ""}
                      onChange={(e) => setTaxaImpostosTaxas(Math.min(90, Math.max(0, Number(e.target.value))))}
                      className="w-full font-mono text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-brand-teal text-slate-900 dark:text-white"
                      placeholder="Ex: 12"
                    />
                    <span className="text-[10px] text-slate-400 block leading-tight">Comissão MercadoLivre/Shopee, imposto</span>
                  </div>
                </div>
              </div>

              {/* Risco de Falha & Margem de Lucro */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 p-5 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="p-1.5 bg-brand-orange/10 text-brand-orange dark:bg-brand-orange/20 dark:text-brand-orange rounded-lg">
                    <TrendingUp size={15} />
                  </span>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    5. Seguros de Perda & Margem de Venda
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Taxa de Falha */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-slate-600 dark:text-slate-300">
                        Risco de Perda / Falhas
                      </label>
                      <span className="font-bold text-brand-orange dark:text-brand-orange font-mono">
                        {taxaFalha}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={taxaFalha}
                      onChange={(e) => setTaxaFalha(Number(e.target.value))}
                      className="w-full accent-brand-orange cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Impecável (0%)</span>
                      <span>Média (10%)</span>
                      <span>Complexo (50%)</span>
                    </div>
                  </div>

                  {/* Margem de Lucro */}
                  <div className="space-y-4 sm:border-l sm:pl-4 border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                        Definição do Lucro / Margem
                      </label>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setMargemModo("porcentagem")}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold text-center cursor-pointer transition-colors ${
                            margemModo === "porcentagem"
                              ? "bg-white dark:bg-slate-850 text-brand-teal shadow-xs dark:text-cyan-400"
                              : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                          }`}
                        >
                          % Porcentagem
                        </button>
                        <button
                          type="button"
                          onClick={() => setMargemModo("valor")}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold text-center cursor-pointer transition-colors ${
                            margemModo === "valor"
                              ? "bg-white dark:bg-slate-850 text-brand-teal shadow-xs dark:text-cyan-400"
                              : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                          }`}
                        >
                          R$ Valor de Venda
                        </button>
                      </div>
                    </div>

                    {margemModo === "porcentagem" ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-slate-600 dark:text-slate-300">
                            Margem de Lucro desejada
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="1000"
                              value={lucroDesejado}
                              onChange={(e) => setLucroDesejado(Math.max(0, Number(e.target.value)))}
                              className="w-16 font-mono text-center text-xs font-bold text-brand-teal dark:text-cyan-400 py-0.5 px-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 focus:outline-brand-teal"
                            />
                            <span className="font-bold text-brand-teal dark:text-cyan-400 font-mono">%</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="300"
                          step="5"
                          value={lucroDesejado}
                          onChange={(e) => setLucroDesejado(Number(e.target.value))}
                          className="w-full accent-brand-teal cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Sem Lucro (0%)</span>
                          <span>Padrão (80%)</span>
                          <span>Raridade (300%)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-slate-600 dark:text-slate-300">
                            Preço de Venda Final Desejado
                          </label>
                          <span className="font-bold text-brand-teal dark:text-cyan-400 font-mono">
                            {activeLucroDesejado > 0 ? `+${activeLucroDesejado.toFixed(1)}%` : `${activeLucroDesejado.toFixed(1)}%`}
                          </span>
                        </div>
                        <div className="relative rounded-xl shadow-xs">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 text-xs font-bold">R$</span>
                          </div>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={precoVendaAlvo}
                            onChange={(e) => setPrecoVendaAlvo(Math.max(0, Number(e.target.value)))}
                            className="w-full font-mono text-xs pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-brand-teal font-extrabold"
                            placeholder="Ex: 73.00"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 leading-normal bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-900">
                          Preço: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">R$ {Number(precoVendaAlvo).toFixed(2)}</span>
                          <br />
                          Custo de Produção: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">R$ {custoProducaoTotal.toFixed(2)}</span>
                          <br />
                          Margem: <span className="font-mono text-brand-teal dark:text-cyan-400 font-bold">{activeLucroDesejado.toFixed(1)}% (markup)</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>

            {/* LADO DIREITO: Painel de Resultados & Histórico (5 colunas) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Resumo Final de Custos Big Card */}
              <div className="bg-slate-900 border border-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/15 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Preço Final Proposto
                    </span>
                    <h4 className="text-3xl font-extrabold text-brand-orange font-mono mt-0.5 animate-pulse">
                      R$ {precoVendaSugerido.toFixed(2)}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Custo de Produção
                    </span>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      R$ {custoProducaoTotal.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Grid stats breakdowns */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5 transition-all hover:bg-white/10">
                    <span className="text-[10px] text-slate-400 font-medium block">Lucro Líquido Real</span>
                    <span className="text-base font-extrabold text-brand-teal font-mono">
                      R$ {lucroLiquido.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">({activeLucroDesejado.toFixed(1)}% markup)</span>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5 transition-all hover:bg-white/10">
                    <span className="text-[10px] text-slate-400 font-medium block">Tempo Total de Uso</span>
                    <span className="text-base font-extrabold text-brand-orange font-mono">
                      {Math.floor(totalTempoMinutos / 60)}h {totalTempoMinutos % 60}m
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Impressão total</span>
                  </div>
                </div>

                {/* Inline bullet details */}
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>🧵 Custo do Filamento ({totalPesoG}g)</span>
                    <span className="font-mono text-white">R$ {custoFilamento.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>⚡ Consumo Elétrico ({consumoKwh.toFixed(3)} kWh)</span>
                    <span className="font-mono text-white">R$ {custoEnergia.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>🛠️ Desgaste / Amortização Físico</span>
                    <span className="font-mono text-white">R$ {custoDepreciacao.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>👤 Trabalho Ativo (Setup + Acabamento)</span>
                    <span className="font-mono text-white">R$ {custoMaoDeObra.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>⚠️ Margem de Reposição / Falha ({taxaFalha}%)</span>
                    <span className="font-mono text-amber-300">R$ {custoPerda.toFixed(2)}</span>
                  </div>
                  {custoEmbalagemNum > 0 && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span>📦 Embalagem & Envio</span>
                      <span className="font-mono text-white">R$ {custoEmbalagemNum.toFixed(2)}</span>
                    </div>
                  )}
                  {custoOutrosNum > 0 && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span>🔧 Outros Custos / Insumos</span>
                      <span className="font-mono text-white">R$ {custoOutrosNum.toFixed(2)}</span>
                    </div>
                  )}
                  {custoImpostosTaxas > 0 && (
                    <div className="flex items-center justify-between text-slate-300 border-t border-white/5 pt-1.5 mt-1.5">
                      <span className="text-red-300">🏛️ Comissão Canal / Taxa ({taxaImpostosTaxas}%)</span>
                      <span className="font-mono text-red-350 font-bold">R$ {custoImpostosTaxas.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Card share and print button integrations */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3">
                  <button
                    onClick={handleCopyCurrentState}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/10 text-white font-semibold text-xs py-3 rounded-xl transition-all cursor-pointer"
                    title="Copiar texto detalhado para WhatsApp"
                  >
                    <Share2 size={13} className="text-slate-300" />
                    <span>Copiar Orçamento</span>
                  </button>
                  <button
                    onClick={handlePrintQuote}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-200 font-semibold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <FileText size={13} className="text-slate-400" />
                    <span>Imprimir Recibo</span>
                  </button>
                </div>
              </div>

              {/* Dynamic SVG cost breakdown chart */}
              <CostBreakdownChart
                custoFilamento={custoFilamento}
                custoEnergia={custoEnergia}
                custoDepreciacao={custoDepreciacao}
                custoMaoDeObra={custoMaoDeObra}
                custoPerda={custoPerda}
                custoEmbalagem={custoEmbalagemNum}
                custoOutros={custoOutrosNum}
              />

            </div>

          </div>
        ) : activeTab === "orcamentos" ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                Seus Orçamentos Guardados
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                Carregue rapidamente os dados salvos de volta para a calculadora ou copie as especificações formatadas para enviar ao cliente.
              </p>
            </div>
            
            <SavedQuotes
              orcamentos={orcamentos}
              onSelectOrcamento={handleLoadOrcamento}
              onDeleteOrcamento={handleDeleteOrcamento}
              onCopyTextSummary={handleCopyTextSummary}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Filament materials catalog tab */}
            <FilamentCatalog
              filamentos={filamentos}
              onAddFilamento={handleAddFilamento}
              onDeleteFilamento={handleDeleteFilamento}
              onUpdateFilamento={handleUpdateFilamento}
              selectedFilamentoId={selectedFilamentoId}
              onSelectFilamento={(id) => setSelectedFilamentoId(id)}
            />

            {/* Printer systems catalog tab */}
            <PrinterCatalog
              impressoras={impressoras}
              onAddImpressora={handleAddImpressora}
              onDeleteImpressora={handleDeleteImpressora}
              onUpdateImpressora={handleUpdateImpressora}
              selectedImpressoraId={selectedImpressoraId}
              onSelectImpressora={(id) => setSelectedImpressoraId(id)}
            />
          </div>
        )}

      </main>

      {/* Footer credits block */}
      <footer className="mt-16 border-t border-slate-200/50 dark:border-slate-900 bg-white dark:bg-slate-950 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Calculadora de Impressão 3D Premium • Projetado para fatiamento de PLA, ABS, PETG, TPU e Resina.
          </p>
          <p className="text-[10px] text-slate-300 dark:text-slate-650">
            Armazenamento 100% local e privado em seu próprio navegador.
          </p>
        </div>
      </footer>
    </div>
  );
}
