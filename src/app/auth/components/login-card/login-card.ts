import { LoginRequest } from '@/auth/interfaces/auth';
import { Auth } from '@/auth/services/auth';
import { CommonModule } from '@angular/common';
import { Component, inject, QueryList, signal, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputField } from '../../../shared/components/input/input-field';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login-card',
  imports: [ReactiveFormsModule, InputField, CommonModule, RouterLink],
  templateUrl: './login-card.html',
  styleUrl: './login-card.css',
})
export class LoginCard {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  @ViewChildren(InputField) inputFields!: QueryList<InputField>;

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.loginForm = this.formBuilder.group({
      Email: ['', [Validators.required, Validators.email]],
      Contraseña: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  focusField(fieldId: string): void {
    const inputField = this.inputFields?.find((field) => field.id === fieldId);
    if (inputField) {
      inputField.focusInput();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const loginData: LoginRequest = {
        email: this.loginForm.value.Email,
        password: this.loginForm.value.Contraseña,
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error en login:', error);

          if (error.status === 401) {
            this.errorMessage.set('Credenciales inválidas. Verifica tu email y contraseña.');
            this.toastr.error('Credenciales inválidas', 'Error de autenticación');
          } else if (error.status >= 500) {
            this.errorMessage.set('Error interno del servidor.');
            this.toastr.error('Error interno del servidor', 'Error');
          } else {
            this.errorMessage.set('Error al iniciar sesión. Intenta nuevamente.');
            this.toastr.error('Error al iniciar sesión', 'Error');
          }
        },
      });
    } else {
      // No marcar campos como touched para evitar mostrar errores automáticamente
      // this.markFormGroupTouched();
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
        return `${fieldName === 'Email' ? 'Email' : 'Contraseña'} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }
}
