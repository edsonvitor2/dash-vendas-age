import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoiData } from '../../models/sales.model';

@Component({
  selector: 'app-roi-card', // Selector changed
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-chart.component.html', // File is reused
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoiCardComponent {
  data = input.required<RoiData>();
}