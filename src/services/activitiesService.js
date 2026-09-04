import { apiFetch } from './httpClient';

const activitiesService = {
  // Obtener todas las actividades
  getAllActivities: async () => {
    try {
      const response = await apiFetch('/admin/activities', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching activities:', error);
      throw error;
    }
  },

  // Obtener una actividad específica
  getActivity: async (activityKey) => {
    try {
      const response = await apiFetch(`/admin/activities/${activityKey}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching activity:', error);
      throw error;
    }
  },

  // Actualizar actividad
  updateActivity: async (activityKey, updateData) => {
    try {
      const response = await apiFetch(`/admin/activities/${activityKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error updating activity:', error);
      throw error;
    }
  },

  // Cambiar estado activo/inactivo
  toggleActivity: async (activityKey, activo) => {
    try {
      const response = await apiFetch(`/admin/activities/${activityKey}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activo })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error toggling activity:', error);
      throw error;
    }
  },

  // Crear nueva actividad
  createActivity: async (activityData) => {
    try {
      const response = await apiFetch('/admin/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error creating activity:', error);
      throw error;
    }
  },

  // Obtener vista previa del menú dinámico para el bot
  getMenuPreview: async () => {
    try {
      const response = await apiFetch('/admin/activities/menu/preview', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching menu preview:', error);
      throw error;
    }
  }
};

export default activitiesService;
