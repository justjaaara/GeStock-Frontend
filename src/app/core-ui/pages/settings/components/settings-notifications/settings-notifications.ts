import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-settings-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-notifications.html',
  styleUrl: './settings-notifications.css',
})
export class SettingsNotifications {
  notificationSettings = {
    email: true,
    push: false,
    sms: false,
    stockAlerts: true,
    orderUpdates: true,
    systemNotifications: false,
  };

  toggleSetting(setting: keyof typeof this.notificationSettings) {
    this.notificationSettings[setting] = !this.notificationSettings[setting];
  }
}
