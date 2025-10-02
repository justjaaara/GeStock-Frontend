import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsSidebar } from './components/settings-sidebar/settings-sidebar';
import { SettingsProfile } from './components/settings-profile/settings-profile';
import { SettingsNotifications } from './components/settings-notifications/settings-notifications';
import { SettingsPreferences } from './components/settings-preferences/settings-preferences';
import { SettingsSecurity } from './components/settings-security/settings-security';

export type SettingsSection = 'profile' | 'notifications' | 'preferences' | 'security';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    SettingsSidebar,
    SettingsProfile,
    SettingsNotifications,
    SettingsPreferences,
    SettingsSecurity
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  activeSection = signal<SettingsSection>('profile');

  onSectionChange(section: SettingsSection) {
    this.activeSection.set(section);
  }
}