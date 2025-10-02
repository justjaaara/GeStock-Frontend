import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-profile.html',
  styleUrl: './settings-profile.css',
})
export class SettingsProfile {
  profileForm: FormGroup;
  isLoading = signal(false);
  isSaved = signal(false);

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: ['Nombre ejemplo', [Validators.required, Validators.minLength(2)]],
      lastName: ['Ejemplo', [Validators.required, Validators.minLength(2)]],
      email: ['example@example.com', [Validators.required, Validators.email]],
      phone: ['+56 9 1234 5678', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      position: ['Rol ejemplo'],
      department: ['Gestión de Stock'],
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading.set(true);

      // Simular guardado
      setTimeout(() => {
        this.isLoading.set(false);
        this.isSaved.set(true);

        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
          this.isSaved.set(false);
        }, 3000);
      }, 1000);
    }
  }

  getFieldError(field: string): string {
    const control = this.profileForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['email']) return 'Ingresa un email válido';
      if (control.errors['minlength']) return 'Mínimo 2 caracteres';
      if (control.errors['pattern']) return 'Formato de teléfono inválido';
    }
    return '';
  }
}
