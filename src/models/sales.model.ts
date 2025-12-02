export type KpiIcon = 
  'vendas-internet' | 'vendas-movel' | 'efetivadas-internet' | 'efetivadas-movel' | 
  'investment' | 'leads' | 'custo-lead' | 'conversao';

export interface Kpi {
  title: string;
  value: string;
  icon: KpiIcon;
}

export interface Venda {
  vnd_id: number;
  vnd_cli_nome: string;
  vnp_valor: number;
  vnd_data_efetivacao: string;
  vnd_origem?: string;
}

export interface Order {
  id: string;
  customer: {
    name: string;
    avatar: string;
  };
  amount: number;
  status: 'Efetivada';
  date: string;
}

export interface PaginatedVendasResponse {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Venda[];
}

export interface TotalVendidoResponse {
  total_vendido: number;
}

export interface TotalInvestidoResponse {
  total_investido: number;
}

export interface Lead {
  id: number;
  // ... other lead properties
}

export interface RoiData {
  roi: number;
  investido: number;
  vendido: number;
}

export interface SellerRanking {
  position: number;
  vendedor: string;
  concluidasInternet: number;
  concluidasMovel: number;
  efetivadasInternet: number;
  efetivadasMovel: number;
  leads: number;
  conv: string;
}

export interface VendasPorVendedorResponse {
  vendedor: string;
  total_vendas: number;
}

export interface LeadsPorVendedorData {
    vendedor: string;
    total_leads: number;
}

export interface LeadsPorVendedorResponse {
    success: boolean;
    data: LeadsPorVendedorData[];
}