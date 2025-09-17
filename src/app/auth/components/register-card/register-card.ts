import { Component, inject } from '@angular/core';

// todo: revisar si estos 2 componentes si son necesarios
import { Button } from '../../../shared/components/button/button';
import { InputField } from '../../../shared/components/input/input-field';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { RegisterRequestBackend } from '../../interfaces/auth';

@Component({
  selector: 'app-register-card',
  imports: [ReactiveFormsModule],
  templateUrl: './register-card.html',
  styleUrl: './register-card.css',
})
export class RegisterCard {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private formBuilder: FormBuilder, private authService: Auth) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const registerData: RegisterRequestBackend = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.description;
          this.registerForm.reset();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.description || 'Error al registrar usuario';
        },
      });
    } else {
      this.markFormGroupTouched();
    }
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
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength'])
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}
