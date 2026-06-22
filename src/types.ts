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
  potencia: number; // Consumo em Watts (ex: 150W)
  custoDepreciacaoHora: number; // Custo de depreciação/manutenção por hora (R$)
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
