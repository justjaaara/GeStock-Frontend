import { ResetPasswordRequest } from '@/auth/interfaces/auth';
import { Auth } from '@/auth/services/auth';
import { passwordMatchValidator } from '@/auth/validators/password-match';
import { InputField } from '@/shared/components/input/input-field';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputField],
  templateUrl: './reset-password-card.html',
  styleUrl: './reset-password-card.css',
})
export class ResetPasswordCard implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetPasswordForm: FormGroup;
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  token = signal('');
  isTokenValid = signal(false);

  constructor() {
    this.resetPasswordForm = this.fb.group(
      {
        Contraseña: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
        'Confirmar contraseña': ['', [Validators.required]],
      },
      {
        validators: passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {
    // Obtener token de la URL
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.token.set(token);
        this.isTokenValid.set(true);
      } else {
        this.errorMessage.set('Token inválido o no proporcionado');
        this.isTokenValid.set(false);
      }
    });
  }

  onSubmit(): void {
    if (!this.resetPasswordForm.valid) {
      this.errorMessage.set('Por favor completa todos los campos correctamente');
      return;
    }

    if (!this.isTokenValid()) {
      this.errorMessage.set('Token inválido. Solicita un nuevo enlace de recuperación');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const resetPasswordData: ResetPasswordRequest = {
      token: this.token(),
      newPassword: this.resetPasswordForm.value['Contraseña'],
    };

    this.authService.resetPassword(resetPasswordData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(response.message);
        this.resetPasswordForm.reset();

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMsg = error.error?.message || 'Error al restablecer la contraseña';

        if (errorMsg.includes('expirado')) {
          this.errorMessage.set('El enlace ha expirado. Solicita un nuevo enlace de recuperación');
        } else if (errorMsg.includes('inválido')) {
          this.errorMessage.set('El enlace es inválido. Solicita un nuevo enlace de recuperación');
        } else {
          this.errorMessage.set(errorMsg);
        }
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  get newPassword() {
    return this.resetPasswordForm.get('Contraseña');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('Confirmar contraseña');
  }

  get formErrors() {
    return this.resetPasswordForm.errors;
  }

  get isFormValid(){
    return this.resetPasswordForm.valid;
  }

  get isFormTouched(){
    return this.resetPasswordForm.touched;
  }
}
