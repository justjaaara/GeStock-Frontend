import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-input-field',
  imports: [CommonModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.css',
})
export class InputField {
  @Input() placeholder: string = '';
  @Input() textColor: string = '';
  @Input() backgroundColor: string = '';
  @Input() width: string = '';
  @Input() height: string = '';
}
