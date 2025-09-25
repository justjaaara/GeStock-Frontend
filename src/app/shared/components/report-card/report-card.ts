import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [],
  templateUrl: './report-card.html',
  styleUrl: './report-card.css'
})
export class ReportCard {
  @Input() icon = '📄';
  @Input({ required: true }) title!: string;
  @Input() description = '';
  @Input() cta = 'Generar';
  @Output() generate = new EventEmitter<void>();
}
