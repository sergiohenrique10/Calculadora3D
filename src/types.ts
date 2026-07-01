export interface Filamento {
  id: string;
  nome: string;
  marca: string;
  tipo: string; // PLA, ABS, PETG, TPU, Resin, etc.
  preco: number; // Preço do rolo (R$)
  peso: number; // Peso do rolo (g)
  densidade?: number; // Opcional, para resinas ou cálculo volumétrico
  cor?: string; // Hex ou nome da cor
}

export interface Impressora {
  id: string;
  nome: string;
  marca?: string;
  modelo?: string;
  volumeX?: number;
  volumeY?: number;
  volumeZ?: number;
  potencia: number; // Consumo em Watts (ex: 150W)
  custoDepreciacaoHora: number; // Custo de depreciação/manutenção por hora (R$)
  horasTotais?: number;
  horasDisponiveis?: number;
  horasDesdeManutencao?: number;
  status?: "disponivel" | "imprimindo" | "manutencao" | "ociosa";
  manutencaoLubrificacao?: number; // horas desde ultima lubrificacao
  manutencaoTrocaBico?: number; // horas desde ultima troca de bico
  manutencaoCorreia?: number; // horas desde ultima correia
}

export interface Orcamento {
  id: string;
  titulo: string;
  data: string;
  filamentoId: string;
  pesoPeca: number; // Gramas usadas na peça
  pesoSuporte: number; // Gramas usadas no suporte (opcional, ou peso total)
  tempoImpressaoMinutos: number; // Tempo total em minutos
  tempoSetupMinutos: number; // Tempo de fatiamento e preparação
  tempoPosProcessamentoMinutos: number; // Tempo de remoção de suportes, lixamento, etc.
  
  impressoraId: string;
  custoKwh: number; // Custo do kWh local (R$)
  custoMaoDeObraHora: number; // Custo da hora do profissional (R$)
  
  taxaFalha: number; // % de margem de erro/perda de filamento (ex: 10%)
  lucroDesejado: number; // % de lucro/markup (ex: 50%)

  // Suporte para Multi-Material / Segundo Filamento
  multiMaterialActive?: boolean;
  filamentoIdSecundario?: string;
  pesoSecundario?: number;
  
  // Lista de Filamentos Extra (Suporta até 3 extras para totalizar 4 filamentos)
  extraFilamentos?: { filamentoId: string; peso: number }[];

  // Custos Adicionais & Parâmetros de Venda Avançados
  custoEmbalagem?: number; // Custo de caixa, plástico bolha, etiquetas, etc.
  custoOutros?: number; // Outros custos fixos (cola, spray, fita, etc.)
  taxaImpostosTaxas?: number; // Taxas de venda / impostos em % (ex: 15% do preço final)
  
  // Resultados calculados
  calculado: {
    custoFilamento: number;
    custoEnergia: number;
    custoDepreciacao: number;
    custoMaoDeObra: number;
    custoPerda: number;
    custoEmbalagem?: number;
    custoOutros?: number;
    custoImpostosTaxas?: number;
    custoProducaoTotal: number;
    precoVendaSugerido: number;
    lucroLiquido: number;
  };
}

// --- ERP ENHANCEMENT INTERFACES ---

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  instagram: string;
  email: string;
  cidade: string;
  endereco: string;
  origem: string; // "Instagram", "Indicação", "Website", etc.
  vip: boolean;
  observacoes: string;
  totalGasto: number;
  lucroGerado: number;
  produtosCompradosCount: number;
}

export interface Produto {
  id: string;
  nome: string;
  imagem: string;
  categoria: string;
  descricao: string;
  stlId?: string;
  pesoMedio: number; // g
  tempoMedioMinutos: number; // minutos
  quantidade: number; // estoque disponivel
  material: string;
  cor: string;
  infill: number; // %
  suportes: "nenhum" | "normal" | "arvore";
  posProcessamento: "nenhum" | "lixamento" | "pintura" | "complexo";
  precoMinimo: number;
  precoIdeal: number;
  precoPremium: number;
  lucro: number;
  lucroHora: number;
  lucroGrama: number;
  rentabilidade: "inviavel" | "critica" | "aceitavel" | "boa" | "excelente";
  indiceFalha: number; // %
  ativo: boolean;
}

export interface ArquivoSTL {
  id: string;
  nome: string;
  imagem: string;
  arquivoNome: string;
  fornecedor: string;
  autor: string;
  licenca: string; // "Comercial", "Pessoal", "CC BY-NC", etc.
  categoria: string;
  tags: string[];
  peso: number; // g
  tempoMinutos: number;
  falhas: number;
  versao: string;
  observacoes: string;
}

export interface Pedido {
  id: string;
  orcamentoId?: string;
  titulo: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  status: "pagamento" | "fila" | "imprimindo" | "pos-processamento" | "embalando" | "enviado" | "entregue" | "cancelado";
  tempoPrevistoMinutos: number;
  tempoRealMinutos: number;
  falhasCount: number;
  observacoes: string;
  operador: string;
  impressoraId: string;
  totalPago: number;
  lucroLiquido: number;
  pesoG: number;
}

export interface ItemEstoque {
  id: string;
  categoria: "filamentos" | "resinas" | "parafusos" | "imas" | "ferragens" | "embalagens";
  nome: string;
  fornecedor: string;
  valor: number;
  lote: string;
  quantidade: number; // un, kg, ou rolos
  pesoRestanteG?: number; // Para filamentos/resinas
  estoqueMinimo: number;
  corHex?: string; // Para filamentos/resinas
}

export interface TransacaoFinanceira {
  id: string;
  tipo: "receita" | "despesa";
  categoria: string; // "Venda", "Compra Filamento", "Energia", "Manutenção", etc.
  valor: number;
  metodo: "pix" | "cartao" | "dinheiro" | "marketplace";
  data: string;
  descricao: string;
}

