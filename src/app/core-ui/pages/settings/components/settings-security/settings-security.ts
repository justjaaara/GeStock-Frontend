import { CommonModule } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '@/auth/services/auth';
import { ChangePasswordRequest } from '../../../../../auth/interfaces/auth';
import { strongPasswordValidator } from '@/shared/validators/strong-password.validator';

@Component({
  selector: 'app-settings-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-security.html',
  styleUrl: './settings-security.css',
})
export class SettingsSecurity {
  showPasswordModal = signal(false);
  passwordForm: FormGroup;
  isLoading = signal(false);
  isPasswordChanged = signal(false);
  errorMessage = signal('');
  
  private authService = inject(Auth);

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, strongPasswordValidator()]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  openPasswordModal() {
    this.showPasswordModal.set(true);
    this.passwordForm.reset();
    this.isPasswordChanged.set(false);
    this.errorMessage.set('');
  }

  closePasswordModal() {
    this.showPasswordModal.set(false);
    this.passwordForm.reset();
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid) return;

    const formData = this.passwordForm.value;
    
    // Create the request object (no confirmPassword needed for API)
    const changePasswordRequest: ChangePasswordRequest = {
      currentPassword: formData.currentPassword!,
      newPassword: formData.newPassword!
    };
    
    // Verificar autenticación antes de proceder
    if (!this.authService.isAuthenticated()) {
      this.errorMessage.set('Debes estar autenticado para cambiar la contraseña');
      return;
    }

    if (!this.authService.token()) {
      this.errorMessage.set('Token de autenticación no encontrado. Por favor, inicia sesión nuevamente');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.authService.changePassword(changePasswordRequest).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isPasswordChanged.set(true);
        
        // Close modal after showing success message
        setTimeout(() => {
          this.closePasswordModal();
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        
        // Extract error message from different error response formats
        let errorMsg = 'Error al cambiar la contraseña';
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.errorMessage.set(errorMsg);
      }
    });
  }

  getFieldError(field: string): string {
    const control = this.passwordForm.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['strongPassword']) return control.errors['strongPassword'].message;
      if (control.errors['mismatch']) return 'Las contraseñas no coinciden';
    }
    return '';
  }
}
