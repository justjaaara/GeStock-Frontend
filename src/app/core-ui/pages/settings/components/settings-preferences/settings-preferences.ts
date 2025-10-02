import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-settings-preferences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-preferences.html',
  styleUrl: './settings-preferences.css',
})
export class SettingsPreferences {
  preferences = {
    language: 'es',
    timezone: 'America/Bogota',
    currency: 'COP',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
  };

  languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
  ];

  timezones = [
    { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
    { value: 'America/Santiago', label: 'Santiago (GMT-3)' },
    { value: 'America/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
    { value: 'America/Lima', label: 'Lima (GMT-5)' },
  ];

  currencies = [
    { value: 'COP', label: 'Peso Colombiano (COP)' },
    { value: 'CLP', label: 'Peso Chileno (CLP)' },
    { value: 'USD', label: 'Dólar Americano (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
  ];

  dateFormats = [
    { value: 'DD/MM/YYYY', label: '31/12/2024' },
    { value: 'MM/DD/YYYY', label: '12/31/2024' },
    { value: 'YYYY-MM-DD', label: '2024-12-31' },
  ];

  themes = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'auto', label: 'Automático' },
  ];

  updatePreference(key: string, value: any) {
    (this.preferences as any)[key] = value;
  }

  onSelectChange(event: Event, key: string) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.updatePreference(key, target.value);
    }
  }
}
