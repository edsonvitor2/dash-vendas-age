import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Kpi, KpiIcon } from '../../models/sales.model';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardComponent {
  kpi = input.required<Kpi>();

  getIconWrapperClass(icon: KpiIcon): string {
    const baseClass = 'rounded-full p-2';
    switch (icon) {
      case 'vendas-internet': return `${baseClass} bg-blue-100 text-blue-600`;
      case 'vendas-movel': return `${baseClass} bg-indigo-100 text-indigo-600`;
      case 'efetivadas-internet': return `${baseClass} bg-orange-100 text-orange-600`;
      case 'efetivadas-movel': return `${baseClass} bg-green-100 text-green-600`;
      case 'investment': return `${baseClass} bg-yellow-100 text-yellow-600`;
      case 'leads': return `${baseClass} bg-blue-100 text-blue-600`;
      case 'custo-lead': return `${baseClass} bg-red-100 text-red-600`;
      case 'conversao': return `${baseClass} bg-teal-100 text-teal-600`;
      default: return `${baseClass} bg-gray-100 text-gray-600`;
    }
  }
}