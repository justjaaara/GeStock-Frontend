import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

export interface SettingsMenuItem {
  id: string;
  label: string;
  icon: string;
  children?: SettingsSubMenuItem[];
}

export interface SettingsSubMenuItem {
  id: string;
  label: string;
  icon: string;
}

type SettingsSection = 'profile' | 'notifications' | 'preferences' | 'security';

@Component({
  selector: 'app-settings-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-sidebar.html',
  styleUrl: './settings-sidebar.css',
})
export class SettingsSidebar {
  @Input() activeSection: SettingsSection = 'profile';
  @Output() sectionChange = new EventEmitter<SettingsSection>();

  expandedSections = signal<Set<string>>(new Set());

  menuItems: SettingsMenuItem[] = [
    {
      id: 'profile',
      label: 'Perfil',
      icon: 'user',
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: 'bell',
    },
    {
      id: 'preferences',
      label: 'Preferencias',
      icon: 'cog',
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: 'shield-check',
    },
  ];

  toggleSection(sectionId: string) {
    const expanded = this.expandedSections();
    const newExpanded = new Set(expanded);

    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }

    this.expandedSections.set(newExpanded);
  }

  selectSection(sectionId: SettingsSection) {
    this.sectionChange.emit(sectionId);
  }

  selectSubSection(parentId: string, subSectionId: string) {
    // Para las subsecciones de seguridad, emitimos 'security' como sección principal
    if (parentId === 'security') {
      this.sectionChange.emit('security');

      // Aquí podrías emitir eventos adicionales para manejar subsecciones
      // Por ejemplo, para abrir el modal de cambio de contraseña
      if (subSectionId === 'change-password') {
        // Esto se manejará desde el componente de seguridad
      }
    }
  }

  isExpanded(sectionId: string): boolean {
    return this.expandedSections().has(sectionId);
  }

  handleMenuClick(item: SettingsMenuItem) {
    if (item.children) {
      this.toggleSection(item.id);
    } else {
      // Verificar que el id es un SettingsSection válido
      if (this.isValidSettingsSection(item.id)) {
        this.selectSection(item.id as SettingsSection);
      }
    }
  }

  private isValidSettingsSection(id: string): id is SettingsSection {
    return ['profile', 'notifications', 'preferences', 'security'].includes(id);
  }
}
