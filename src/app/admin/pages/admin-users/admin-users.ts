import { Component, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@/auth/services/auth';
import { UserModal } from '@/admin/components/user-modal/user-modal';
import { ToastrService } from 'ngx-toastr';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  roleId: number;
  state: string;
  stateId: number;
}

interface RoleChangeConfirmation {
  userId: number;
  userName: string;
  oldRoleId: number;
  oldRoleName: string;
  newRoleId: number;
  newRoleName: string;
}

interface StateChangeConfirmation {
  userId: number;
  userName: string;
  currentState: string;
  currentStateId: number;
  newState: string;
  newStateId: number;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, UserModal],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showModal = false;
  showConfirmationModal = false;
  pendingRoleChange: RoleChangeConfirmation | null = null;
  showStateConfirmationModal = false;
  pendingStateChange: StateChangeConfirmation | null = null;

  constructor(
    private authService: Auth,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    // Usar afterNextRender para asegurar que se ejecute después del render inicial
    afterNextRender(() => {
      console.log('🔄 afterNextRender - Iniciando carga de usuarios...');
      this.loadUsers();
    });
  }

  ngOnInit(): void {
    console.log('🔄 AdminUsers ngOnInit ejecutado');
  }

  loadUsers(): void {
    console.log('📋 loadUsers() llamado');
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck(); // ← Forzar detección de cambios

    console.log('🌐 Llamando a authService.getAllUsers()...');
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        console.log('✅ Usuarios recibidos:', users);
        this.users = users;
        this.isLoading = false;
        this.cdr.markForCheck(); // ← Forzar detección de cambios después de actualizar
      },
      error: (error) => {
        console.error('❌ Error cargando usuarios:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error completo:', error);

        const errorMsg = this.getUsersErrorMessage(error.status);
        this.errorMessage = errorMsg;
        this.isLoading = false;
        this.cdr.markForCheck(); // ← Forzar detección de cambios

        this.toastr.error(errorMsg, 'Error al cargar usuarios', {
          progressBar: true,
          timeOut: 5000,
        });
      },
    });
  }  private getUsersErrorMessage(status: number): string {
    const errorMessages: { [key: number]: string } = {
      0: 'No se puede conectar al servidor',
      401: 'No estás autenticado. Por favor inicia sesión nuevamente',
      403: 'No tienes permisos para ver los usuarios',
      500: 'Error interno del servidor',
    };
    return errorMessages[status] || 'Error al cargar usuarios';
  }

  openModal(): void {
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  onUserCreated(): void {
    this.toastr.success('Usuario creado exitosamente', 'Éxito', {
      progressBar: true,
    });
    this.loadUsers();
  }

  getRoleName(roleId: number): string {
    const roles: { [key: number]: string } = {
      1: 'ADMIN',
      2: 'JEFE DE ALMACEN',
      3: 'OPERARIO',
    };
    return roles[roleId] || 'Desconocido';
  }

  onRoleSelectChange(event: Event, userId: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const newRoleId = +selectElement.value;

    const user = this.users.find((u) => u.id === userId);
    if (!user) return;

    // Si el rol no cambió, no hacer nada
    if (user.roleId === newRoleId) return;

    // Preparar la confirmación
    this.pendingRoleChange = {
      userId: user.id,
      userName: user.name,
      oldRoleId: user.roleId,
      oldRoleName: this.getRoleName(user.roleId),
      newRoleId: newRoleId,
      newRoleName: this.getRoleName(newRoleId),
    };

    // Mostrar modal de confirmación
    this.showConfirmationModal = true;

    // Restaurar el valor anterior en el select temporalmente
    selectElement.value = user.roleId.toString();
  }

  confirmRoleChange(): void {
    if (!this.pendingRoleChange) return;

    const { userId, newRoleId, newRoleName, oldRoleId, oldRoleName } =
      this.pendingRoleChange;

    // Cerrar el modal inmediatamente
    this.closeConfirmationModal();

    // Actualizar el usuario localmente de forma optimista
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.roleId = newRoleId;
      user.role = newRoleName;
      this.cdr.markForCheck(); // ← Forzar actualización visual
    }

    // Llamar al backend
    this.authService.updateUserRole(userId, newRoleId).subscribe({
      next: () => {
        console.log('✅ Rol actualizado correctamente');
        this.toastr.success(
          `El rol se cambió a ${newRoleName}`,
          'Rol actualizado',
          {
            progressBar: true,
          }
        );
      },
      error: (error) => {
        console.error('❌ Error al actualizar rol:', error);

        // Revertir cambio en caso de error
        if (user) {
          user.roleId = oldRoleId;
          user.role = oldRoleName;
          this.cdr.markForCheck(); // ← Forzar actualización visual
        }

        const errorMsg = this.getUpdateRoleErrorMessage(error.status);
        this.toastr.error(errorMsg, 'Error al actualizar rol', {
          progressBar: true,
          timeOut: 5000,
        });
      },
    });
  }

  private getUpdateRoleErrorMessage(status: number): string {
    const errorMessages: { [key: number]: string } = {
      0: 'No se puede conectar al servidor',
      401: 'Sesión expirada. Por favor inicia sesión nuevamente',
      403: 'No tienes permisos para cambiar roles',
      404: 'Usuario no encontrado',
      500: 'Error interno del servidor',
    };
    return errorMessages[status] || 'Error al actualizar el rol';
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.pendingRoleChange = null;
    this.cdr.markForCheck();
  }

  toggleUserState(userId: number): void {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;

    const newStateId = user.stateId === 1 ? 2 : 1;
    const newState = newStateId === 1 ? 'Activo' : 'Inactivo';

    // Preparar la confirmación
    this.pendingStateChange = {
      userId: user.id,
      userName: user.name,
      currentState: user.state,
      currentStateId: user.stateId,
      newState: newState,
      newStateId: newStateId,
    };

    // Mostrar modal de confirmación
    this.showStateConfirmationModal = true;
    this.cdr.markForCheck();
  }

  confirmStateChange(): void {
    if (!this.pendingStateChange) return;

    const { userId, currentStateId, currentState, newStateId, newState } = this.pendingStateChange;

    // Cerrar el modal inmediatamente
    this.closeStateConfirmationModal();

    // Actualizar el usuario localmente de forma optimista
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.stateId = newStateId;
      user.state = newState;
      this.cdr.markForCheck();
    }

    // Llamar al backend
    this.authService.toggleUserState(userId).subscribe({
      next: (response) => {
        console.log('✅ Estado actualizado correctamente:', response);
        this.toastr.success(
          response.message,
          'Estado actualizado',
          {
            progressBar: true,
          }
        );
      },
      error: (error) => {
        console.error('❌ Error al cambiar estado:', error);

        // Revertir cambio en caso de error
        if (user) {
          user.stateId = currentStateId;
          user.state = currentState;
          this.cdr.markForCheck();
        }

        const errorMsg = this.getToggleStateErrorMessage(error.status);
        this.toastr.error(errorMsg, 'Error al cambiar estado', {
          progressBar: true,
          timeOut: 5000,
        });
      },
    });
  }

  closeStateConfirmationModal(): void {
    this.showStateConfirmationModal = false;
    this.pendingStateChange = null;
    this.cdr.markForCheck();
  }

  private getToggleStateErrorMessage(status: number): string {
    const errorMessages: { [key: number]: string } = {
      0: 'No se puede conectar al servidor',
      401: 'Sesión expirada. Por favor inicia sesión nuevamente',
      403: 'No tienes permisos para cambiar el estado de usuarios',
      404: 'Usuario no encontrado',
      500: 'Error interno del servidor',
    };
    return errorMessages[status] || 'Error al cambiar el estado del usuario';
  }
}
