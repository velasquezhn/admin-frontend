import { apiFetch } from './httpClient';

class AdminUsersService {
  constructor() {
    this.baseUrl = '/admin/admin-users';
  }

  // Headers por defecto
  getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Obtener todos los administradores
  async getAllAdmins() {
    try {
      const response = await apiFetch(this.baseUrl, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo administradores:', error);
      throw error;
    }
  }

  // Crear nuevo administrador
  async createAdmin(adminData) {
    try {
      const response = await apiFetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando administrador:', error);
      throw error;
    }
  }

  // Actualizar datos de administrador
  async updateAdmin(adminId, adminData) {
    try {
      const response = await apiFetch(`${this.baseUrl}/${adminId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando administrador:', error);
      throw error;
    }
  }

  // Cambiar contraseña de administrador
  async changePassword(adminId, passwordData) {
    try {
      const response = await apiFetch(`${this.baseUrl}/${adminId}/password`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  }

  // Activar/desactivar administrador
  async toggleAdminStatus(adminId, isActive) {
    try {
      const response = await apiFetch(`${this.baseUrl}/${adminId}/toggle`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cambiando estado del administrador:', error);
      throw error;
    }
  }

  // Eliminar administrador (soft delete)
  async deleteAdmin(adminId) {
    try {
      const response = await apiFetch(`${this.baseUrl}/${adminId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error eliminando administrador:', error);
      throw error;
    }
  }
}

// Crear una instancia del servicio
const adminUsersService = new AdminUsersService();

export default adminUsersService;
