import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCard {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() badge?: string;           // "↑ 6% mes", "↓ 2 hoy", etc.
  @Input() tone: 'neutral'|'good'|'bad' = 'neutral';
}
