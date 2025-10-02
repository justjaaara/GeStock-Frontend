import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null; // Si no hay valor, no validamos (el required se encarga)
    }

    // Al menos 6 caracteres
    if (value.length < 6) {
      return { strongPassword: { message: 'La contraseña debe tener al menos 6 caracteres' } };
    }

    // Al menos un número
    if (!/\d/.test(value)) {
      return { strongPassword: { message: 'La contraseña debe incluir al menos un número' } };
    }

    // Al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      return {
        strongPassword: {
          message: 'La contraseña debe incluir al menos un carácter especial (!@#$%^&*...)',
        },
      };
    }

    return null; // Válido
  };
}
