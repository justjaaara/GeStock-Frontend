import { ForgotPasswordRequest } from '@/auth/interfaces/auth';
import { Auth } from '@/auth/services/auth';
import { InputField } from '@/shared/components/input/input-field';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputField, RouterLink],
  templateUrl: './forgot-password-card.html',
  styleUrl: './forgot-password-card.css',
})
export class ForgotPasswordCard {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  forgotPasswordForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (!this.forgotPasswordForm.valid) {
      this.errorMessage.set('Por favor ingresa un email válido');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const forgotPasswordData: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.value.email,
    };

    this.authService.forgotPassword(forgotPasswordData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(response.message);
        this.forgotPasswordForm.reset();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Error al enviar el correo de recuperación');
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }
}