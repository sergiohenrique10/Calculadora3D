import React, { useState } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Info, 
  Clock, 
  Coins, 
  Layers, 
  Trash2, 
  Check, 
  ShieldAlert,
  Sliders,
  DollarSign
} from "lucide-react";
import { Produto, ArquivoSTL } from "../types";

interface ProductsViewProps {
  produtos: Produto[];
  stls: ArquivoSTL[];
  onAddProduto: (produto: Omit<Produto, "id" | "lucro" | "lucroHora" | "lucroGrama" | "rentabilidade">) => void;
  onToggleAtivo: (id: string) => void;
  onDeleteProduto: (id: string) => void;
}

export function ProductsView({ produtos, stls, onAddProduto, onToggleAtivo, onDeleteProduto }: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Form states
  const [nome, setNome] = useState("");
  const [imagem, setImagem] = useState("");
  const [categoria, setCategoria] = useState("Colecionáveis");
  const [descricao, setDescricao] = useState("");
  const [stlId, setStlId] = useState("");
  const [pesoMedio, setPesoMedio] = useState(50);
  const [tempoMedioMinutos, setTempoMedioMinutos] = useState(180);
  const [quantidade, setQuantidade] = useState(10);
  const [material, setMaterial] = useState("PLA Premium");
  const [cor, setCor] = useState("Preto");
  const [infill, setInfill] = useState(15);
  const [suportes, setSuportes] = useState<"nenhum" | "normal" | "arvore">("arvore");
  const [posProcessamento, setPosProcessamento] = useState<"nenhum" | "lixamento" | "pintura" | "complexo">("nenhum");
  const [precoMinimo, setPrecoMinimo] = useState(50);
  const [precoIdeal, setPrecoIdeal] = useState(85);
  const [precoPremium, setPrecoPremium] = useState(120);
  const [indiceFalha, setIndiceFalha] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    onAddProduto({
      nome,
      imagem: imagem || "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=200&auto=format&fit=crop",
      categoria,
      descricao,
      stlId: stlId || undefined,
      pesoMedio,
      tempoMedioMinutos,
      quantidade,
      material,
      cor,
      infill,
      suportes,
      posProcessamento,
      precoMinimo,
      precoIdeal,
      precoPremium,
      indiceFalha,
      ativo: true
    });

    // Reset
    setNome("");
    setImagem("");
    setDescricao("");
    setStlId("");
    setPesoMedio(50);
    setTempoMedioMinutos(180);
    setQuantidade(10);
    setInfill(15);
    setPrecoMinimo(50);
    setPrecoIdeal(85);
    setPrecoPremium(120);
    setIndiceFalha(5);
    setShowAddForm(false);
  };

  const getRentabilityBadge = (rent: Produto["rentabilidade"]) => {
    const scales = {
      excelente: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      boa: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      aceitavel: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      critica: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      inviavel: "bg-red-500/10 text-red-400 border-red-500/20"
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold border capitalize ${scales[rent] || scales.aceitavel}`}>
        {rent}
      </span>
    );
  };

  const categories = ["Todas", "Colecionáveis", "Organizadores", "Industrial", "Decoração", "Outros"];

  const filteredProdutos = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" ? true : p.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Produtos Cadastrados</h2>
          <p className="text-xs text-slate-400">Modelos prontos para comercialização e fabricação com perfis de fatia salvos</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brand-orange text-white hover:bg-brand-orange/90 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-brand-orange/10 cursor-pointer transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          {showAddForm ? "Cancelar cadastro" : "Novo Produto"}
        </button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-950 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">
            Cadastrar Novo Produto
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Comercial *</label>
              <input 
                type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Action Figure Hollow Knight 15cm"
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
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Link de Imagem (URL)</label>
              <input 
                type="text" value={imagem} onChange={(e) => setImagem(e.target.value)}
                placeholder="https://exemplo.com/foto.jpg"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Vincular Arquivo STL da Biblioteca</label>
              <select 
                value={stlId} onChange={(e) => setStlId(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange"
              >
                <option value="">Nenhum (Sem link de biblioteca)</option>
                {stls.map(stl => (
                  <option key={stl.id} value={stl.id}>{stl.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Material de Fabricação</label>
              <input 
                type="text" value={material} onChange={(e) => setMaterial(e.target.value)}
                placeholder="Ex: PLA Premium, PETG, ABS"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cor do Material</label>
              <input 
                type="text" value={cor} onChange={(e) => setCor(e.target.value)}
                placeholder="Ex: Preto Fosco, Grafite"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 md:col-span-1">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block truncate">Peso (g)</label>
                <input 
                  type="number" value={pesoMedio} onChange={(e) => setPesoMedio(Number(e.target.value))}
                  className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block truncate">Tempo (min)</label>
                <input 
                  type="number" value={tempoMedioMinutos} onChange={(e) => setTempoMedioMinutos(Number(e.target.value))}
                  className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block truncate">Estoque un</label>
                <input 
                  type="number" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))}
                  className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:col-span-1">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block truncate">Preench. %</label>
                <input 
                  type="number" value={infill} onChange={(e) => setInfill(Number(e.target.value))}
                  className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block">Suportes</label>
                <select 
                  value={suportes} onChange={(e) => setSuportes(e.target.value as any)}
                  className="w-full font-sans text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-center"
                >
                  <option value="nenhum">Nenhum</option>
                  <option value="normal">Normal</option>
                  <option value="arvore">Árvore</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase block">Pós-Proc.</label>
                <select 
                  value={posProcessamento} onChange={(e) => setPosProcessamento(e.target.value as any)}
                  className="w-full font-sans text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-center"
                >
                  <option value="nenhum">Nenhum</option>
                  <option value="lixamento">Lixado</option>
                  <option value="pintura">Pintado</option>
                  <option value="complexo">Completo</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Índice Estimado de Falha (%)</label>
              <input 
                type="number" value={indiceFalha} onChange={(e) => setIndiceFalha(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Preço Mínimo de Venda (R$)</label>
              <input 
                type="number" value={precoMinimo} onChange={(e) => setPrecoMinimo(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Preço Ideal (R$)</label>
              <input 
                type="number" value={precoIdeal} onChange={(e) => setPrecoIdeal(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-mono font-bold text-emerald-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Preço Premium (R$)</label>
              <input 
                type="number" value={precoPremium} onChange={(e) => setPrecoPremium(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-mono font-bold text-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição do Produto</label>
              <input 
                type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Altura 15cm, pintura acrílica com selante semi-brilho."
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
              Salvar Produto
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
            placeholder="Pesquisar por nome, material, descrição..."
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
                  ? "bg-brand-orange/15 border-brand-orange/30 text-brand-orange"
                  : "bg-slate-900 border-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProdutos.length === 0 ? (
          <div className="col-span-2 text-center py-10 bg-slate-900 border border-slate-950 rounded-2xl text-slate-500 text-xs">
            Nenhum produto cadastrado corresponde aos critérios de pesquisa.
          </div>
        ) : (
          filteredProdutos.map((p) => {
            const isLowStock = p.quantidade <= 2;
            return (
              <div 
                key={p.id} 
                className={`bg-slate-900 border border-slate-950 rounded-2xl p-4.5 flex gap-4 hover:border-slate-800 transition-all ${
                  !p.ativo ? "opacity-60" : ""
                }`}
              >
                {/* Product Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-950 relative border border-white/5">
                  <img 
                    src={p.imagem} 
                    alt={p.nome}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=200&auto=format&fit=crop";
                    }}
                  />
                  {isLowStock && p.ativo && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-red-500 text-white font-black rounded text-[8px] uppercase tracking-wide flex items-center gap-0.5 shadow">
                      <ShieldAlert size={8} />
                      Faltando
                    </span>
                  )}
                </div>

                {/* Info and metrics */}
                <div className="flex-1 flex flex-col justify-between space-y-2 min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{p.categoria}</span>
                      <div className="flex gap-1.5">
                        {getRentabilityBadge(p.rentabilidade)}
                        <button 
                          onClick={() => onToggleAtivo(p.id)}
                          className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                            p.ativo 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                              : "bg-slate-950 border-slate-800 text-slate-600"
                          }`}
                          title={p.ativo ? "Desativar produto" : "Ativar produto"}
                        >
                          <Check size={10} />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-extrabold text-slate-100 text-sm truncate mt-0.5">{p.nome}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal mt-0.5">{p.descricao}</p>
                  </div>

                  {/* Print Parameters */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 border-t border-white/5 pt-1.5">
                    <span className="flex items-center gap-0.5"><Clock size={11} /> {Math.floor(p.tempoMedioMinutos / 60)}h{p.tempoMedioMinutos % 60}m</span>
                    <span className="flex items-center gap-0.5"><Layers size={11} /> {p.pesoMedio}g</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 rounded text-slate-400 border border-slate-850 font-mono">{p.material}</span>
                  </div>

                  {/* Financial outputs */}
                  <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850">
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase block font-bold leading-none">Lucro Líquido</span>
                      <span className="font-mono text-[11px] font-black text-emerald-400">R$ {p.lucro.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-500 uppercase block font-bold leading-none">R$/h Rentabilidade</span>
                      <span className="font-mono text-[10px] font-black text-slate-300">R$ {p.lucroHora.toFixed(2)}/h</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-500 uppercase block font-bold leading-none">Estoque</span>
                      <span className="font-mono text-[10px] font-black text-cyan-400">{p.quantidade} un</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1">
                    <span>Preço ideal de venda: <strong className="text-slate-300 font-mono font-bold">R$ {p.precoIdeal.toFixed(2)}</strong></span>
                    <button 
                      onClick={() => onDeleteProduto(p.id)}
                      className="text-slate-600 hover:text-red-400 transition-all cursor-pointer p-0.5 rounded"
                      title="Excluir produto"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
