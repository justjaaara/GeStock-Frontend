import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
  const password = form.get('password');
  const rePassword = form.get('rePassword');

  if (password && rePassword && password.value !== rePassword.value) {
    rePassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }

  if (rePassword?.errors?.['passwordMismatch']) {
    delete rePassword.errors['passwordMismatch'];
    if (Object.keys(rePassword.errors).length === 0) {
      rePassword.setErrors(null);
    }
  }
  return null;
}
