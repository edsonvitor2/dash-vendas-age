import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, forkJoin, of, timer, combineLatest } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import {
  Kpi,
  PaginatedVendasResponse,
  TotalVendidoResponse,
  TotalInvestidoResponse,
  Lead,
  RoiData,
  SellerRanking,
  VendasPorVendedorResponse,
  LeadsPorVendedorResponse,
} from '../models/sales.model';

const API_BASE_URL = 'https://api.rotaportasdeaco.com:3064/api';

@Injectable({
  providedIn: 'root',
})
export class SalesDataService {
  private http = inject(HttpClient);
  private apiUrl = API_BASE_URL;

  private dateRange$ = new BehaviorSubject<{ startDate: string; endDate: string }>(this.getCurrentDayDateRange());
  private autoRefresh$ = timer(0, 120_000); // 0ms initial delay, then every 2 minutes

  private dashboardData$ = combineLatest([this.dateRange$, this.autoRefresh$]).pipe(
    switchMap(([dateRange, _tick]) => this.fetchDashboardDataForRange(dateRange))
  );

  // Expose data as signals
  kpis = toSignal(this.dashboardData$.pipe(map((data) => data.kpis)), {
    initialValue: [],
  });
  roiData = toSignal(this.dashboardData$.pipe(map((data) => data.roiData)), {
    initialValue: { roi: 0, investido: 0, vendido: 0 },
  });
  sellerRankingData = toSignal(
    this.dashboardData$.pipe(map((data) => data.sellerRanking)),
    { initialValue: [] }
  );

  public updateDateRange(startDate: string, endDate: string) {
    this.dateRange$.next({ startDate, endDate });
  }

  private getCurrentDayDateRange(): { startDate: string; endDate: string } {
    const now = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    return {
      startDate: formatDate(now),
      endDate: formatDate(now),
    };
  }

  private fetchDashboardDataForRange(dateRange: { startDate: string; endDate: string }): Observable<{
    kpis: Kpi[];
    roiData: RoiData;
    sellerRanking: SellerRanking[];
  }> {
    const baseParams = new HttpParams()
      .set('start_date', dateRange.startDate)
      .set('end_date', dateRange.endDate);
      
    const kpiParamsInternet = baseParams.set('vnp_ctg_nome', 'Internet');
    const kpiParamsMovel = baseParams.set('vnp_ctg_nome', 'Movel');

    // Seller ranking API calls now use 'categoria'
    const sellerParamsInternet = baseParams.set('categoria', 'internet');
    const sellerParamsMovel = baseParams.set('categoria', 'movel');

    // KPI API Calls
    const vendasConcluidasInternet$ = this.http.get<PaginatedVendasResponse>(`${this.apiUrl}/vendas/concluidas`, { params: kpiParamsInternet }).pipe(catchError(() => of({ pagination: { total: 0 } } as PaginatedVendasResponse)));
    const vendasConcluidasMovel$ = this.http.get<PaginatedVendasResponse>(`${this.apiUrl}/vendas/concluidas`, { params: kpiParamsMovel }).pipe(catchError(() => of({ pagination: { total: 0 } } as PaginatedVendasResponse)));
    const vendasEfetivadasInternet$ = this.http.get<PaginatedVendasResponse>(`${this.apiUrl}/vendas/efetivadas`, { params: kpiParamsInternet }).pipe(catchError(() => of({ pagination: { total: 0 } } as PaginatedVendasResponse)));
    const vendasEfetivadasMovel$ = this.http.get<PaginatedVendasResponse>(`${this.apiUrl}/vendas/efetivadas`, { params: kpiParamsMovel }).pipe(catchError(() => of({ pagination: { total: 0 } } as PaginatedVendasResponse)));
    
    const totalInvestido$ = this.http.get<TotalInvestidoResponse>(`${this.apiUrl}/metas/total-investido`, { params: baseParams }).pipe(catchError(() => of({ total_investido: 0 })));
    const totalVendido$ = this.http.get<TotalVendidoResponse>(`${this.apiUrl}/total-vendido`, { params: baseParams }).pipe(catchError(() => of({ total_vendido: 0 })));
    const leads$ = this.http.get<Lead[]>(`${this.apiUrl}/leads`, { params: new HttpParams().set('dataInicio', dateRange.startDate).set('dataFim', dateRange.endDate) }).pipe(catchError(() => of([])));
    
    // Seller ranking API calls
    const vendasEfetivadasPorVendedorInternet$ = this.http.get<VendasPorVendedorResponse[]>(`${this.apiUrl}/vendas-efetivadas/por-vendedor`, { params: sellerParamsInternet }).pipe(catchError(() => of([])));
    const vendasEfetivadasPorVendedorMovel$ = this.http.get<VendasPorVendedorResponse[]>(`${this.apiUrl}/vendas-efetivadas/por-vendedor`, { params: sellerParamsMovel }).pipe(catchError(() => of([])));
    const vendasConcluidasPorVendedorInternet$ = this.http.get<VendasPorVendedorResponse[]>(`${this.apiUrl}/vendas-concluidas/por-vendedor`, { params: sellerParamsInternet }).pipe(catchError(() => of([])));
    const vendasConcluidasPorVendedorMovel$ = this.http.get<VendasPorVendedorResponse[]>(`${this.apiUrl}/vendas-concluidas/por-vendedor`, { params: sellerParamsMovel }).pipe(catchError(() => of([])));
    const leadsPorVendedor$ = this.http.get<LeadsPorVendedorResponse>(`${this.apiUrl}/leads-por-vendedor`, { params: baseParams }).pipe(catchError(() => of({ success: false, data: [] } as LeadsPorVendedorResponse)));


    return forkJoin({
      vendasConcluidasInternet: vendasConcluidasInternet$,
      vendasConcluidasMovel: vendasConcluidasMovel$,
      vendasEfetivadasInternet: vendasEfetivadasInternet$,
      vendasEfetivadasMovel: vendasEfetivadasMovel$,
      totalInvestido: totalInvestido$,
      totalVendido: totalVendido$,
      leads: leads$,
      vendasEfetivadasPorVendedorInternet: vendasEfetivadasPorVendedorInternet$,
      vendasEfetivadasPorVendedorMovel: vendasEfetivadasPorVendedorMovel$,
      vendasConcluidasPorVendedorInternet: vendasConcluidasPorVendedorInternet$,
      vendasConcluidasPorVendedorMovel: vendasConcluidasPorVendedorMovel$,
      leadsPorVendedor: leadsPorVendedor$,
    }).pipe(
      map(
        ({
          vendasConcluidasInternet,
          vendasConcluidasMovel,
          vendasEfetivadasInternet,
          vendasEfetivadasMovel,
          totalInvestido,
          totalVendido,
          leads,
          vendasEfetivadasPorVendedorInternet,
          vendasEfetivadasPorVendedorMovel,
          vendasConcluidasPorVendedorInternet,
          vendasConcluidasPorVendedorMovel,
          leadsPorVendedor,
        }) => {
          
          const totalLeads = leads.length;
          const totalEfetivadas = vendasEfetivadasInternet.pagination.total + vendasEfetivadasMovel.pagination.total;
          const investido = totalInvestido.total_investido || 0;
          const vendido = totalVendido.total_vendido || 0;

          const custoPorLead = totalLeads > 0 ? investido / totalLeads : 0;
          const conversao = totalLeads > 0 ? (totalEfetivadas / totalLeads) * 100 : 0;
          const roi = investido > 0 ? (vendido - investido) / investido : 0;
          
          const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

          const kpis: Kpi[] = [
            { title: 'Vendas Concluídas Internet', value: vendasConcluidasInternet.pagination.total.toString(), icon: 'vendas-internet' },
            { title: 'Vendas Concluídas Móvel', value: vendasConcluidasMovel.pagination.total.toString(), icon: 'vendas-movel' },
            { title: 'Vendas Efetivadas Internet', value: vendasEfetivadasInternet.pagination.total.toString(), icon: 'efetivadas-internet' },
            { title: 'Vendas Efetivadas Móvel', value: vendasEfetivadasMovel.pagination.total.toString(), icon: 'efetivadas-movel' },
            { title: 'Investimento Total', value: formatCurrency(investido), icon: 'investment' },
            { title: 'Leads Totais', value: totalLeads.toString(), icon: 'leads' },
            { title: 'Custo por Lead', value: formatCurrency(custoPorLead), icon: 'custo-lead' },
            { title: 'Conversão', value: `${conversao.toFixed(2)}%`, icon: 'conversao' },
          ];
          
          const roiData: RoiData = { roi, investido, vendido };

          const sellerData: { [key: string]: { concluidasInternet: number; concluidasMovel: number; efetivadasInternet: number; efetivadasMovel: number; leads: number } } = {};
          
          const initializeSeller = (vendedor: string) => {
            if (!sellerData[vendedor]) {
              sellerData[vendedor] = { concluidasInternet: 0, concluidasMovel: 0, efetivadasInternet: 0, efetivadasMovel: 0, leads: 0 };
            }
          };

          vendasConcluidasPorVendedorInternet.forEach(item => {
              initializeSeller(item.vendedor);
              sellerData[item.vendedor].concluidasInternet = item.total_vendas;
          });
          
          vendasConcluidasPorVendedorMovel.forEach(item => {
              initializeSeller(item.vendedor);
              sellerData[item.vendedor].concluidasMovel = item.total_vendas;
          });

          vendasEfetivadasPorVendedorInternet.forEach(item => {
              initializeSeller(item.vendedor);
              sellerData[item.vendedor].efetivadasInternet = item.total_vendas;
          });
          
          vendasEfetivadasPorVendedorMovel.forEach(item => {
              initializeSeller(item.vendedor);
              sellerData[item.vendedor].efetivadasMovel = item.total_vendas;
          });

          if(leadsPorVendedor && leadsPorVendedor.data) {
            leadsPorVendedor.data.forEach(item => {
                if(item.vendedor) {
                  initializeSeller(item.vendedor);
                  sellerData[item.vendedor].leads = item.total_leads;
                }
            });
          }

          const sellerRankingArray = Object.keys(sellerData)
            .map(vendedor => {
              const data = sellerData[vendedor];
              const conv = data.leads > 0 ? `${((data.efetivadasInternet / data.leads) * 100).toFixed(1)}%` : '0.0%';
              return {
                  vendedor: vendedor,
                  ...data,
                  conv: conv
              }
            });
            
          sellerRankingArray.sort((a, b) => (b.efetivadasInternet + b.efetivadasMovel) - (a.efetivadasInternet + a.efetivadasMovel));

          const sellerRanking: SellerRanking[] = sellerRankingArray.map((seller, index) => ({
              ...seller,
              position: index + 1
          }));

          return { kpis, roiData, sellerRanking };
        }
      )
    );
  }
}
