import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { RoiCardComponent } from './components/sales-chart/sales-chart.component';
import { SellerRankingComponent } from './components/recent-orders/recent-orders.component';
import { SalesDataService } from './services/sales-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    KpiCardComponent,
    RoiCardComponent,
    SellerRankingComponent,
  ],
})
export class AppComponent {
  private salesDataService = inject(SalesDataService);

  kpis = this.salesDataService.kpis;
  roiData = this.salesDataService.roiData;
  sellerRanking = this.salesDataService.sellerRankingData;

  private getInitialDateRange() {
    const now = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    return {
      startDate: formatDate(now),
      endDate: formatDate(now),
    };
  }

  startDate = signal(this.getInitialDateRange().startDate);
  endDate = signal(this.getInitialDateRange().endDate);

  onStartDateChange(event: Event) {
    this.startDate.set((event.target as HTMLInputElement).value);
  }

  onEndDateChange(event: Event) {
    this.endDate.set((event.target as HTMLInputElement).value);
  }

  updateDashboard() {
    this.salesDataService.updateDateRange(this.startDate(), this.endDate());
  }
}
