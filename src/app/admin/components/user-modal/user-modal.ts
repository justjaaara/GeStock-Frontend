import { Component, EventEmitter, Output, ViewChildren, QueryList, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '@/auth/validators/password-match';
import { Auth } from '@/auth/services/auth';
import { InputField } from '@/shared/components/input/input-field';
import { RegisterRequestBackend, Role, RolesResponse } from '@/auth/interfaces/auth';
import { strongPasswordValidator } from '@/shared/validators/strong-password.validator';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputField],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.css',
})
export class UserModal implements OnInit {
  @ViewChildren(InputField) inputFields!: QueryList<InputField>;
  @Output() closeModal = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<void>();

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  availableRoles: Role[] = [
    { roleId: 1, roleName: 'ADMIN' },
    { roleId: 2, roleName: 'JEFE DE ALMACEN' },
    { roleId: 3, roleName: 'OPERARIO' },
  ];

  constructor(private formBuilder: FormBuilder, private authService: Auth) {
    this.registerForm = this.formBuilder.group(
      {
        Nombre: [
          '',
          [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)],
        ],
        Email: ['', [Validators.required, Validators.email]],
        Contraseña: ['', [Validators.required, strongPasswordValidator()]],
        'Confirmar contraseña': ['', [Validators.required]],
        Rol: [null, [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Modal se inicializa con los roles predefinidos
  }

  focusField(fieldId: string): void {
    const inputField = this.inputFields?.find((field) => field.id === fieldId);
    if (inputField) {
      inputField.focusInput();
    }
  }

  onSubmit(): void {
    this.clearMessages();

    if (!this.registerForm.valid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      return;
    }

    const formData = this.registerForm.value;

    this.isLoading = true;

    const registerData: RegisterRequestBackend = {
      name: formData.Nombre,
      email: formData.Email,
      password: formData.Contraseña,
      roleId: Number(formData.Rol), // ← Convertir a número
    };

    console.log('Datos a enviar:', registerData);
    console.log('Tipo de roleId:', typeof registerData.roleId);

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
    
    // Emitir evento para que el componente padre actualice la lista
    // No cerramos inmediatamente para que el usuario vea el mensaje
    setTimeout(() => {
      this.userCreated.emit();
      this.close();
    }, 1500);
  }  private handleRegistrationError(error: any): void {
    this.isLoading = false;
    this.successMessage = '';

    // Log detallado del error para debugging
    console.error('Error completo:', error);
    console.error('Error message:', error.error?.message);
    console.error('Error details:', error.error);

    this.errorMessage = this.getErrorMessage(error.status, error);

    if (error.status >= 500) {
      console.error('Error 500 en registro:', error);
    }
  }

  private getErrorMessage(status: number, error: any): string {
    // Si hay mensajes de validación específicos del backend
    if (error.error?.message && Array.isArray(error.error.message)) {
      return error.error.message.join('. ');
    }

    const errorMessages: { [key: number]: string } = {
      0: 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose.',
      400: 'Datos inválidos. Por favor revisar los campos',
      401: 'No estás autenticado. Por favor inicia sesión nuevamente.',
      403: 'No tienes permisos para crear usuarios. Solo los administradores pueden hacerlo.',
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
    if (errors['strongPassword']) {
      return errors['strongPassword'].message;
    }
    if (errors['pattern']) {
      return this.getPatternErrorMessage(fieldName);
    }
    return '';
  }

  private getPatternErrorMessage(fieldName: string): string {
    const patternMessages: { [key: string]: string } = {
      Nombre: 'El nombre solo puede contener letras',
      Email: 'Formato de email inválido',
      Contraseña: 'La contraseña debe contener al menos una letra y un número',
    };

    return patternMessages[fieldName] || 'Formato inválido';
  }

  close(): void {
    this.closeModal.emit();
  }
}
