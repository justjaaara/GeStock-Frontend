import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  imports: [CommonModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputField),
      multi: true
    }
  ]
})
export class InputField implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() textColor: string = '';
  @Input() backgroundColor: string = '';
  @Input() width: string = '';
  @Input() height: string = '';
  @Input() type: string = 'text';
  @Input() showPasswordToggle: boolean = false;

  value: string = '';
  isPasswordVisible: boolean = false;
  disabled: boolean = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get inputType(): string {
    if (this.type === 'password' && this.isPasswordVisible) {
      return 'text';
    }
    return this.type;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
