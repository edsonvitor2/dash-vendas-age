import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellerRanking } from '../../models/sales.model';

@Component({
  selector: 'app-seller-ranking', // Selector changed
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-orders.component.html', // File is reused
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerRankingComponent {
  sellers = input.required<SellerRanking[]>();
}