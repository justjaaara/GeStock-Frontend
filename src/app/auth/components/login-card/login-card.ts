import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '@/auth/services/auth';
import { Router } from '@angular/router';
import { LoginRequest } from '@/auth/interfaces/auth';
import { InputField } from '../../../shared/components/input/input-field';

@Component({
  selector: 'app-login-card',
  imports: [ReactiveFormsModule, InputField],
  templateUrl: './login-card.html',
  styleUrl: './login-card.css',
})
export class LoginCard {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // Redirige al dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false); // ← IMPORTANTE: Siempre habilitar el botón

          console.error('Error en login:', error);

          if (error.status === 0) {
            this.errorMessage.set('No se puede conectar al servidor. Verifica que el backend esté ejecutándose.');
          } else if (error.status === 401) {
            this.errorMessage.set('Credenciales inválidas. Verifica tu email y contraseña.');
          } else if (error.status === 404) {
            this.errorMessage.set('Servidor no encontrado. Verifica que el backend esté ejecutándose en el puerto 3000.');
          } else if (error.status >= 500) {
            this.errorMessage.set('Error interno del servidor. Intenta más tarde.');
          } else {
            this.errorMessage.set('Error al iniciar sesión. Intenta nuevamente.');
          }
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required'])
        return `${fieldName === 'email' ? 'Email' : 'Contraseña'} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }
}
