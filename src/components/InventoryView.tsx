import React, { useState } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Filter, 
  CheckCircle2, 
  Trash2, 
  Sparkles,
  Layers,
  Percent,
  TrendingDown
} from "lucide-react";
import { ItemEstoque } from "../types";

interface InventoryViewProps {
  estoque: ItemEstoque[];
  onAddItemEstoque: (item: Omit<ItemEstoque, "id">) => void;
  onDeleteItemEstoque: (id: string) => void;
  onUpdateQuantity: (id: string, nextQty: number) => void;
}

export function InventoryView({ estoque, onAddItemEstoque, onDeleteItemEstoque, onUpdateQuantity }: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"Todas" | "filamentos" | "resinas" | "parafusos" | "imas" | "ferragens" | "embalagens">("Todas");

  // Form states
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<ItemEstoque["categoria"]>("filamentos");
  const [fornecedor, setFornecedor] = useState("");
  const [valor, setValor] = useState(125.00);
  const [lote, setLote] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [pesoRestanteG, setPesoRestanteG] = useState(1000);
  const [estoqueMinimo, setEstoqueMinimo] = useState(2);
  const [corHex, setCorHex] = useState("#10B981");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    onAddItemEstoque({
      categoria,
      nome,
      fornecedor: fornecedor || "3D Fila",
      valor,
      lote: lote || `${categoria.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`,
      quantidade,
      pesoRestanteG: ["filamentos", "resinas"].includes(categoria) ? pesoRestanteG : undefined,
      estoqueMinimo,
      corHex: ["filamentos", "resinas"].includes(categoria) ? corHex : undefined
    });

    // Reset
    setNome("");
    setFornecedor("");
    setLote("");
    setQuantidade(1);
    setPesoRestanteG(1000);
    setEstoqueMinimo(2);
    setShowAddForm(false);
  };

  const filteredEstoque = estoque.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.lote.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" ? true : item.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: "Todas", label: "Tudo" },
    { key: "filamentos", label: "Filamentos" },
    { key: "resinas", label: "Resinas" },
    { key: "parafusos", label: "Parafusos" },
    { key: "imas", label: "Ímãs" },
    { key: "ferragens", label: "Ferragens" },
    { key: "embalagens", label: "Embalagens" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Gestão de Estoque & Insumos</h2>
          <p className="text-xs text-slate-400">Controle bobinas de filamento, frascos de resina, parafusos, ímãs e caixas de papelão com alertas automáticos de reposição</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brand-orange text-white hover:bg-brand-orange/90 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          {showAddForm ? "Cancelar cadastro" : "Adicionar Insumo"}
        </button>
      </div>

      {/* Stats summary banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-950 p-4.5 rounded-2xl">
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Bobinas em Estoque</span>
          <span className="text-xl font-black text-slate-100 font-mono">
            {estoque.filter(i => i.categoria === "filamentos").reduce((acc, i) => acc + i.quantidade, 0)} rolos
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Peso Restante Total</span>
          <span className="text-xl font-black text-cyan-400 font-mono">
            {(estoque.filter(i => i.pesoRestanteG).reduce((acc, i) => acc + (i.pesoRestanteG || 0), 0) / 1000).toFixed(1)} kg
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Alertas Ativos</span>
          <span className="text-xl font-black text-red-400 font-mono">
            {estoque.filter(item => (item.pesoRestanteG ? item.pesoRestanteG : item.quantidade) <= item.estoqueMinimo).length} insumos
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Investido em Estoque</span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            R$ {estoque.reduce((acc, i) => acc + (i.valor * i.quantidade), 0).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Add Inventory Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-950 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">
            Cadastrar Novo Insumo no Almoxarifado
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Comercial do Insumo *</label>
              <input 
                type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Filamento PLA Silk Champanhe"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
              <select 
                value={categoria} onChange={(e) => setCategoria(e.target.value as any)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
              >
                <option value="filamentos">Filamentos</option>
                <option value="resinas">Resinas</option>
                <option value="parafusos">Parafusos</option>
                <option value="imas">Ímãs</option>
                <option value="ferragens">Ferragens</option>
                <option value="embalagens">Embalagens</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Fornecedor</label>
              <input 
                type="text" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Ex: 3D Fila, Esun, Lojão 3D"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Valor de Compra Unitário (R$)</label>
              <input 
                type="number" value={valor} onChange={(e) => setValor(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Código do Lote</label>
              <input 
                type="text" value={lote} onChange={(e) => setLote(e.target.value)}
                placeholder="Ex: LOTE-PLA-44"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Quantidade Inicial (un)</label>
              <input 
                type="number" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Estoque de Alerta Mínimo</label>
              <input 
                type="number" value={estoqueMinimo} onChange={(e) => setEstoqueMinimo(Number(e.target.value))}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-center font-mono text-red-400"
              />
            </div>

            {["filamentos", "resinas"].includes(categoria) ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Peso Restante (g)</label>
                  <input 
                    type="number" value={pesoRestanteG} onChange={(e) => setPesoRestanteG(Number(e.target.value))}
                    className="w-full font-sans text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Cor Visual</label>
                  <input 
                    type="color" value={corHex} onChange={(e) => setCorHex(e.target.value)}
                    className="w-full h-8 rounded border border-slate-800 cursor-pointer p-0 bg-slate-950"
                  />
                </div>
              </div>
            ) : <div />}
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
              Dar Entrada
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
            placeholder="Pesquisar por insumo, fornecedor, lote..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-950 rounded-xl text-xs text-white focus:border-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                selectedCategory === cat.key
                  ? "bg-brand-orange/15 border-brand-orange/30 text-brand-orange"
                  : "bg-slate-900 border-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {filteredEstoque.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-slate-900 border border-slate-950 rounded-2xl text-slate-500 text-xs">
            Nenhum insumo encontrado no almoxarifado.
          </div>
        ) : (
          filteredEstoque.map((item) => {
            const qtyOrWeight = item.pesoRestanteG !== undefined ? item.pesoRestanteG : item.quantidade;
            const isLowStock = qtyOrWeight <= item.estoqueMinimo;

            return (
              <div 
                key={item.id} 
                className={`bg-slate-900 border p-4.5 rounded-2xl flex flex-col justify-between space-y-3.5 hover:border-slate-800 transition-all ${
                  isLowStock ? "border-red-500/15" : "border-slate-950"
                }`}
              >
                {/* Header info */}
                <div>
                  <div className="flex justify-between items-center text-[8px] uppercase font-bold text-slate-400">
                    <span>{item.categoria}</span>
                    <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-500">Lote: {item.lote}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {item.corHex && (
                      <span className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/10" style={{ backgroundColor: item.corHex }} />
                    )}
                    <h4 className="font-extrabold text-slate-100 text-xs truncate leading-normal" title={item.nome}>{item.nome}</h4>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-1">Fornecedor: <strong className="text-slate-400 font-normal">{item.fornecedor}</strong></p>
                </div>

                {/* Quantitative Status bar */}
                <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-bold">Nível do Estoque</span>
                    <span className={`font-mono font-black ${isLowStock ? "text-red-400" : "text-emerald-400"}`}>
                      {item.pesoRestanteG !== undefined 
                        ? `${item.pesoRestanteG}g (${item.quantidade} rolos)` 
                        : `${item.quantidade} unidades`}
                    </span>
                  </div>

                  {item.pesoRestanteG !== undefined && (
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isLowStock ? "bg-red-400" : "bg-emerald-400"}`}
                        style={{ width: `${Math.min(100, (item.pesoRestanteG / (item.quantidade * 1000)) * 100)}%` }}
                      />
                    </div>
                  )}

                  {isLowStock && (
                    <span className="text-[8px] font-bold text-red-400 flex items-center gap-1 mt-1 bg-red-400/5 px-2 py-0.5 rounded border border-red-500/10">
                      <AlertTriangle size={9} />
                      Reposição Necessária! Mínimo {item.estoqueMinimo}
                    </span>
                  )}
                </div>

                {/* Quick operations */}
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[9px] text-slate-500">Qtd:</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantidade - 1))}
                      className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-[10px] font-bold rounded cursor-pointer text-slate-400"
                    >
                      -
                    </button>
                    <span className="font-mono text-[10px] font-bold text-slate-300 px-1">{item.quantidade}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantidade + 1)}
                      className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-[10px] font-bold rounded cursor-pointer text-slate-400"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">R$ {item.valor.toFixed(0)}</span>
                    <button 
                      onClick={() => onDeleteItemEstoque(item.id)}
                      className="text-slate-700 hover:text-red-400 transition-all cursor-pointer p-0.5"
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
