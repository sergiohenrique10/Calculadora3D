import React, { useState } from "react";
import { 
  FolderOpen, 
  Plus, 
  Search, 
  FileText, 
  Tag, 
  Clock, 
  Layers, 
  ShieldCheck, 
  AlertOctagon, 
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Trash2
} from "lucide-react";
import { GCodeParser } from "./GCodeParser";
import { ArquivoSTL, Filamento, Impressora } from "../types";

interface STLLibraryViewProps {
  stls: ArquivoSTL[];
  filamentos: Filamento[];
  impressoras: Impressora[];
  onAddSTL: (stl: Omit<ArquivoSTL, "id" | "falhas" | "versao">) => void;
  onDeleteSTL: (id: string) => void;
  onOpenCalculatorWithSTL: (stl: ArquivoSTL) => void;
}

export function STLLibraryView({ stls, filamentos, impressoras, onAddSTL, onDeleteSTL, onOpenCalculatorWithSTL }: STLLibraryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [showParser, setShowParser] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [arquivoNome, setArquivoNome] = useState("");
  const [imagem, setImagem] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [autor, setAutor] = useState("");
  const [licenca, setLicenca] = useState("Comercial (Merchant Tier)");
  const [categoria, setCategoria] = useState("Colecionáveis");
  const [tagInput, setTagInput] = useState("");
  const [peso, setPeso] = useState(45);
  const [tempoMinutos, setTempoMinutos] = useState(180);
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    const tagsArr = tagInput ? tagInput.split(",").map(t => t.trim()) : ["STL", categoria];

    onAddSTL({
      nome,
      arquivoNome: arquivoNome || `${nome.replace(/\s+/g, "_")}.stl`,
      imagem: imagem || "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=200&auto=format&fit=crop",
      fornecedor: fornecedor || "Cults3D",
      autor: autor || "Autor Anônimo",
      licenca,
      categoria,
      tags: tagsArr,
      peso,
      tempoMinutos,
      observacoes
    });

    // Reset
    setNome("");
    setArquivoNome("");
    setImagem("");
    setFornecedor("");
    setAutor("");
    setLicenca("Comercial (Merchant Tier)");
    setTagInput("");
    setPeso(45);
    setTempoMinutos(180);
    setObservacoes("");
    setShowAddForm(false);
  };

  const handleParsed = (parsed: { name: string; weightG: number; timeMinutes: number }) => {
    setNome(parsed.name.replace(".gcode", ""));
    setArquivoNome(parsed.name.replace(".gcode", ".stl"));
    setPeso(parsed.weightG);
    setTempoMinutos(parsed.timeMinutes);
    setShowParser(false);
    setShowAddForm(true);
  };

  const categories = ["Todas", "Colecionáveis", "Organizadores", "Industrial", "Decoração"];

  const filteredSTLs = stls.filter(s => {
    const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.arquivoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Todas" ? true : s.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Biblioteca de Arquivos STL</h2>
          <p className="text-xs text-slate-400">Banco de modelos 3D digitais cadastrados, licenças de propriedade intelectual e histórico de falhas</p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowParser(!showParser)}
            className="px-3 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700"
          >
            <Sparkles size={14} className="text-cyan-400 shrink-0" />
            Analisar G-Code
          </button>
          
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowParser(false);
            }}
            className="px-4 py-2 bg-brand-orange text-white hover:bg-brand-orange/90 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-brand-orange/10 cursor-pointer transition-all"
          >
            <Plus size={15} />
            {showAddForm ? "Cancelar" : "Cadastrar STL"}
          </button>
        </div>
      </div>

      {/* Parser box */}
      {showParser && (
        <div className="bg-slate-900 border border-slate-950 p-5 rounded-2xl animate-fadeIn space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} />
              Importação Inteligente de Parâmetros de Faturamento
            </h3>
            <button onClick={() => setShowParser(false)} className="text-xs text-slate-500 hover:text-slate-300">Fechar</button>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Faça upload do seu arquivo de impressão fatiado (.gcode ou .gcode.3mf) para extrair o nome original da peça, o tempo exato em minutos e o peso estimado de filamento em gramas. Esses dados preencherão o cadastro do seu STL automaticamente.
          </p>
          <GCodeParser onDataParsed={(data) => handleParsed({ name: "G-Code Import", weightG: data.pesoGramas, timeMinutes: data.tempoMinutos })} />
        </div>
      )}

      {/* Add STL Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-950 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">
            Adicionar Novo STL à Biblioteca
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Amigável do Modelo *</label>
              <input 
                type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Vaso Helicoidal Moderno"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Real do Arquivo (.stl)</label>
              <input 
                type="text" value={arquivoNome} onChange={(e) => setArquivoNome(e.target.value)}
                placeholder="Ex: vaso_modular_v2_spiral.stl"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
              <select 
                value={categoria} onChange={(e) => setCategoria(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              >
                <option value="Colecionáveis">Colecionáveis</option>
                <option value="Organizadores">Organizadores</option>
                <option value="Industrial">Industrial</option>
                <option value="Decoração">Decoração</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Fornecedor / Origem</label>
              <input 
                type="text" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Ex: Patreon, Cults3D, Thingiverse"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Autor do Design (Modelador)</label>
              <input 
                type="text" value={autor} onChange={(e) => setAutor(e.target.value)}
                placeholder="Ex: Sanix, Eastman, Craft3D"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Licença</label>
              <select 
                value={licenca} onChange={(e) => setLicenca(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange"
              >
                <option value="Comercial (Merchant Tier)">Comercial (Merchant Tier)</option>
                <option value="Pessoal Limitada">Pessoal Limitada</option>
                <option value="CC BY-NC (Atribuição Não Comercial)">CC BY-NC (Atribuição Não Comercial)</option>
                <option value="Domínio Público">Domínio Público</option>
                <option value="Privada / Cliente Exclusivo">Privada / Cliente Exclusivo</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Peso Médio Estimado (gramas)</label>
              <input 
                type="number" value={peso} onChange={(e) => setPeso(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tempo Médio Estimado (minutos)</label>
              <input 
                type="number" value={tempoMinutos} onChange={(e) => setTempoMinutos(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tags (Separadas por vírgula)</label>
              <input 
                type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                placeholder="Ex: geek, vaso, utilitario"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Observações de Impressão / Fatiador</label>
              <input 
                type="text" value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Necessário 3 paredes. Altura de camada 0.16mm. Suportes de árvore apenas na base."
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">URL da Imagem do Modelo</label>
              <input 
                type="text" value={imagem} onChange={(e) => setImagem(e.target.value)}
                placeholder="https://exemplo.com/render.png"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
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
              Adicionar à Biblioteca
            </button>
          </div>
        </form>
      )}

      {/* Filter and search controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={15} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome de STL, arquivo, tag..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-950 rounded-xl text-xs text-white focus:border-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                selectedCategory === cat
                  ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400"
                  : "bg-slate-900 border-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* STL Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSTLs.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-950 rounded-2xl p-4.5 flex gap-4 hover:border-slate-800 transition-all">
            {/* Render Preview */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-950 relative border border-white/5">
              <img 
                src={s.imagem} 
                alt={s.nome}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=200&auto=format&fit=crop";
                }}
              />
              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-slate-950/85 backdrop-blur-md text-slate-300 font-bold rounded text-[8px] border border-white/10 font-mono">
                v{s.versao || "1.0"}
              </span>
            </div>

            {/* STL Metadata info */}
            <div className="flex-1 flex flex-col justify-between space-y-2 min-w-0">
              <div>
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{s.categoria}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-violet-500/10 text-violet-400 font-bold rounded-md border border-violet-500/20 max-w-40 truncate">
                    {s.licenca}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-100 text-sm truncate mt-0.5" title={s.nome}>{s.nome}</h4>
                <p className="text-[9px] font-mono text-slate-500 truncate leading-none mt-1">{s.arquivoNome}</p>
              </div>

              {/* Tags block */}
              <div className="flex flex-wrap gap-1">
                {s.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-950 rounded text-[9px] text-slate-400 border border-slate-850 font-semibold">
                    <Tag size={8} />
                    {tag}
                  </span>
                ))}
                {s.tags.length > 3 && <span className="text-[9px] text-slate-600 font-bold self-center">+{s.tags.length - 3}</span>}
              </div>

              {/* Slicing specifications */}
              <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-0.5 font-semibold text-slate-300">
                    <Clock size={11} className="text-slate-500" />
                    {Math.floor(s.tempoMinutos / 60)}h{s.tempoMinutos % 60}m
                  </span>
                  <span className="flex items-center gap-0.5 font-semibold text-slate-300">
                    <Layers size={11} className="text-slate-500" />
                    {s.peso}g
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[9px]">
                  <span className="text-slate-500">Falhas:</span>
                  <span className={`font-bold ${s.falhas > 0 ? "text-amber-400" : "text-emerald-400"}`}>{s.falhas}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px]">
                <button 
                  onClick={() => onOpenCalculatorWithSTL(s)}
                  className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/15 font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 uppercase text-[8px] tracking-wide"
                >
                  <RefreshCw size={10} />
                  Calcular Custo / Preço
                </button>

                <button 
                  onClick={() => onDeleteSTL(s.id)}
                  className="text-slate-600 hover:text-red-400 transition-all cursor-pointer p-0.5"
                  title="Remover da biblioteca"
                >
                  <Trash2 size={12} />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
