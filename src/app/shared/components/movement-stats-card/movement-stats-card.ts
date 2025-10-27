import { Component, Input, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovementStats } from '@/core-ui/services/inventory';

@Component({
  selector: 'app-movement-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movement-stats-card.html',
  styleUrl: './movement-stats-card.css',
})
export class MovementStatsCard implements OnChanges {
  @Input() stats: MovementStats | null = null;
  @Input() isLoading = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['stats'] && this.stats) {
      // Stats are ready to display
    }
  }
}
