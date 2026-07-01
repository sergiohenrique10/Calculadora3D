import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  MessageSquare, 
  Instagram, 
  Mail, 
  MapPin, 
  Search, 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  ChevronRight,
  Filter,
  Check
} from "lucide-react";
import { Cliente } from "../types";

interface CRMViewProps {
  clientes: Cliente[];
  onAddCliente: (cliente: Omit<Cliente, "id" | "totalGasto" | "lucroGerado" | "produtosCompradosCount">) => void;
  onToggleVip: (id: string) => void;
}

export function CRMView({ clientes, onAddCliente, onToggleVip }: CRMViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterVipOnly, setFilterVipOnly] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [origem, setOrigem] = useState("Instagram");
  const [vip, setVip] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;
    
    // Auto format whatsapp if needed
    const cleanWpp = whatsapp.replace(/\D/g, "");
    
    onAddCliente({
      nome,
      telefone,
      whatsapp: cleanWpp || "5511999999999",
      instagram: instagram.startsWith("@") ? instagram : `@${instagram}`,
      email,
      cidade,
      endereco,
      origem,
      vip,
      observacoes
    });

    // Reset
    setNome("");
    setTelefone("");
    setWhatsapp("");
    setInstagram("");
    setEmail("");
    setCidade("");
    setEndereco("");
    setOrigem("Instagram");
    setVip(false);
    setObservacoes("");
    setShowAddForm(false);
  };

  const filteredClientes = clientes.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVip = filterVipOnly ? c.vip : true;
    return matchesSearch && matchesVip;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">Gestão de Clientes (CRM)</h2>
          <p className="text-xs text-slate-400">Gerencie contatos, histórico de compras, fidelidade e margem de lucros gerada</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brand-orange text-white hover:bg-brand-orange/90 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-brand-orange/10 cursor-pointer transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          {showAddForm ? "Cancelar cadastro" : "Novo Cliente"}
        </button>
      </div>

      {/* CRM Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-950 p-4.5 rounded-2xl">
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Total de Clientes</span>
          <span className="text-xl font-black text-slate-100 font-mono">{clientes.length}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Clientes VIP</span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {clientes.filter(c => c.vip).length}
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Maior Investidor</span>
          <span className="text-xs font-bold text-cyan-400 truncate block mt-1">
            {clientes.length > 0 ? [...clientes].sort((a,b) => b.totalGasto - a.totalGasto)[0].nome : "-"}
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block uppercase font-bold">Origem Líder</span>
          <span className="text-xl font-black text-brand-orange font-mono">Instagram</span>
        </div>
      </div>

      {/* Add Client Collapsible Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-950 p-5 rounded-2xl space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">
            Cadastrar Novo Cliente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nome */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo *</label>
              <input 
                type="text" 
                required 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ana Maria de Oliveira"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: ana@exemplo.com"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Instagram</label>
              <input 
                type="text" 
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Ex: @ana3d_decor"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Telefone de Contato</label>
              <input 
                type="text" 
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Ex: (11) 99999-8888"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Whatsapp */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp (DDD + Número) *</label>
              <input 
                type="text" 
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 11999998888 (Apenas números)"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Cidade */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cidade / Estado</label>
              <input 
                type="text" 
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: São Paulo - SP"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Endereco */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Endereço Completo</label>
              <input 
                type="text" 
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Bairro Novo"
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:border-brand-orange focus:outline-none"
              />
            </div>

            {/* Origem */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Origem do Lead</label>
              <select 
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-brand-orange focus:outline-none"
              >
                <option value="Instagram">Instagram</option>
                <option value="Indicação">Indicação</option>
                <option value="Website">Website</option>
                <option value="Feira / Evento">Feira / Evento</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Obs e VIP */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-9 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Observações Internas</label>
              <input 
                type="text" 
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Tem preferência por filamento preto fosco. Exige faturamento em boleto..."
                className="w-full font-sans text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 flex items-center h-full pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300">
                <input 
                  type="checkbox" 
                  checked={vip}
                  onChange={(e) => setVip(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-brand-orange bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                />
                Marcar como Cliente VIP
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded-xl text-xs uppercase tracking-wider font-bold bg-brand-orange text-white hover:bg-brand-orange/90 transition-all shadow-md shadow-brand-orange/15 cursor-pointer"
            >
              Confirmar Cadastro
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
            placeholder="Pesquisar por nome, cidade, email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-950 rounded-xl text-xs text-white placeholder-slate-500 focus:border-slate-700 focus:outline-none"
          />
        </div>

        <button 
          onClick={() => setFilterVipOnly(!filterVipOnly)}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
            filterVipOnly 
              ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-400" 
              : "bg-slate-900 border-slate-950 text-slate-400 hover:text-white"
          }`}
        >
          <Filter size={13} />
          {filterVipOnly ? "Filtrado por VIPs" : "Apenas VIPs"}
        </button>
      </div>

      {/* CRM Customer List Grid */}
      <div className="space-y-3.5">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-10 bg-slate-900 border border-slate-950 rounded-2xl text-slate-500 text-xs">
            Nenhum cliente cadastrado corresponde aos critérios de pesquisa.
          </div>
        ) : (
          filteredClientes.map((c) => (
            <div 
              key={c.id} 
              className="bg-slate-900 border border-slate-950 rounded-2xl p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-800 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-200 text-sm">{c.nome}</h4>
                  
                  {c.vip && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <UserCheck size={9} />
                      VIP
                    </span>
                  )}

                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-semibold">
                    via {c.origem}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1.5 gap-x-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-500 shrink-0" /> {c.cidade || "Endereço não informado"}</span>
                  <span className="flex items-center gap-1"><Mail size={12} className="text-slate-500 shrink-0" /> {c.email || "E-mail não informado"}</span>
                  <span className="flex items-center gap-1"><Instagram size={12} className="text-slate-500 shrink-0" /> {c.instagram || "-"}</span>
                </div>

                {c.observacoes && (
                  <p className="text-[10px] text-slate-500 leading-normal italic border-l-2 border-slate-800 pl-2">
                    "{c.observacoes}"
                  </p>
                )}
              </div>

              {/* Financial metrics & direct actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full md:w-auto pt-3 md:pt-0 border-t border-white/5 md:border-t-0">
                <div className="grid grid-cols-2 gap-3 shrink-0 text-center sm:text-right pr-0 sm:pr-4 md:border-r border-white/5">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-bold">Investimento</span>
                    <span className="font-mono text-xs font-black text-slate-200">R$ {c.totalGasto.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-bold">Lucro Gerado</span>
                    <span className="font-mono text-xs font-black text-emerald-400">R$ {c.lucroGerado.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => onToggleVip(c.id)}
                    className={`p-2 rounded-xl text-xs border cursor-pointer transition-all ${
                      c.vip 
                        ? "bg-slate-950 border-emerald-500/30 text-emerald-400 hover:bg-slate-900" 
                        : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                    }`}
                    title={c.vip ? "Remover de VIP" : "Tornar VIP"}
                  >
                    <UserCheck size={14} />
                  </button>

                  <a 
                    href={`https://wa.me/${c.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs cursor-pointer flex items-center justify-center transition-all"
                    title="Enviar WhatsApp"
                  >
                    <MessageSquare size={14} />
                  </a>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
