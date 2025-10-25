import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  @Input() isOpen = false;
  @Input() title = 'Confirmación';
  @Input() message = '¿Estás seguro de realizar esta acción?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() variant: 'primary' | 'danger' = 'primary';
  @Input() customContent = false; // Nueva propiedad
  @Input() showFooter = true; // Nueva propiedad

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() isOpenChange = new EventEmitter<boolean>();

  onConfirm(): void {
    this.confirm.emit();
    this.close();
  }

  onCancel(): void {
    this.cancel.emit();
    this.close();
  }

  onOverlayClick(): void {
    if (!this.customContent) {
      this.onCancel();
    }
  }

  private close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
