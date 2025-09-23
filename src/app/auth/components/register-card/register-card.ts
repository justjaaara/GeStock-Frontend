import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { passwordMatchValidator } from '@/auth/validators/password-match';
import { Auth } from '@/auth/services/auth';
import { InputField } from '@/shared/components/input/input-field';
import { RegisterRequestBackend } from '@/auth/interfaces/auth';

@Component({
  selector: 'app-register-card',
  imports: [ReactiveFormsModule, InputField],
  templateUrl: './register-card.html',
  styleUrl: './register-card.css',
})
export class RegisterCard {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: Auth,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group(
      {
        name: [
          '',
          [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/),
          ],
        ],
        rePassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator } // ← USAR EL VALIDADOR IMPORTADO (sin 'this')
    );
  }

  onSubmit(): void {
    this.clearMessages();

    if (!this.registerForm.valid) {
      this.markFormGroupTouched();
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      return;
    }

    const formData = this.registerForm.value;
    if (formData.password !== formData.rePassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    const registerData: RegisterRequestBackend = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.handleSuccessfulRegistration(response);
      },
      error: (error) => {
        this.handleRegistrationError(error);
      },
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private handleSuccessfulRegistration(response: any): void {
    this.isLoading = false;
    this.successMessage = 'Usuario registrado exitosamente';
    this.registerForm.reset();

    // TODO: Mover esto a AuthService
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));

    this.router.navigate(['/dashboard']); // TODO: Verificar que esta ruta existe
  }

  private handleRegistrationError(error: any): void {
    this.isLoading = false;
    this.successMessage = '';
    this.cdr.detectChanges();

    this.errorMessage = this.getErrorMessage(error.status, error);

    // Log solo para errores 500+
    if (error.status >= 500) {
      console.error('Error 500 en registro:', error);
    }
  }

  private getErrorMessage(status: number, error: any): string {
    const errorMessages: { [key: number]: string } = {
      0: 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose.',
      400: 'Datos inválidos. Por favor revisar los campos',
      404: 'Servidor no encontrado. Verifica que el backend esté ejecutándose en el puerto 3000.',
      409: 'Este email ya está registrado',
      500: 'Error interno del servidor. Intenta más tarde.',
    };

    return (
      errorMessages[status] ||
      error.error?.message ||
      'Error al registrar usuario. Intenta nuevamente.'
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      return this.getFieldErrorMessage(fieldName, field.errors);
    }
    return '';
  }

  private getFieldErrorMessage(fieldName: string, errors: any): string {
    if (errors['required']) return `${fieldName} es requerido`;
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) {
      return `${fieldName} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    }
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    if (errors['pattern']) {
      return this.getPatternErrorMessage(fieldName);
    }
    return '';
  }

  private getPatternErrorMessage(fieldName: string): string {
    const patternMessages: { [key: string]: string } = {
      name: 'El nombre solo puede contener letras',
      email: 'Formato de email inválido',
      password: 'La contraseña debe contener al menos una letra y un número',
    };

    return patternMessages[fieldName] || 'Formato inválido';
  }
}
