import { apiFetch } from './httpClient';

class ApiService {
  async request(endpoint, options = {}) {
    const { headers: optionHeaders = {}, ...requestOptions } = options;
    const headers = { ...optionHeaders };
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const config = {
      ...requestOptions,
      headers,
    };

    try {
      const response = await apiFetch(endpoint, config);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('La sesión terminó. Vuelve a iniciar sesión.');
        }
        if (response.status === 403) {
          throw new Error('Tu usuario no tiene permiso para realizar esta acción.');
        }
        let payload = {};
        try { payload = await response.json(); } catch { payload = {}; }
        const requestError = new Error(payload.message || `HTTP error! status: ${response.status}`);
        requestError.code = payload.code;
        requestError.status = response.status;
        throw requestError;
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Users endpoints (huéspedes)
  async getUsers() {
    return this.request('/users');
  }

  async createUser(user) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id, user) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  // Endpoint para actualizar estados de usuarios basado en reservas
  async updateUserStatesBasedOnReservations() {
    return this.request('/admin/users/update-states', {
      method: 'POST',
    });
  }

  // Cabins endpoints
  async getCabins() {
    return this.request('/admin/cabins');
  }

  async createCabin(cabin) {
    const formData = new FormData();
    Object.keys(cabin).forEach(key => {
      if (cabin[key] !== null && cabin[key] !== undefined) {
        formData.append(key, cabin[key]);
      }
    });

    return this.request('/admin/cabins', {
      method: 'POST',
      headers: {}, // Remove Content-Type for FormData
      body: formData,
    });
  }

  async updateCabin(id, cabin) {
    const formData = new FormData();
    Object.keys(cabin).forEach(key => {
      if (cabin[key] !== null && cabin[key] !== undefined) {
        formData.append(key, cabin[key]);
      }
    });

    return this.request(`/admin/cabins/${id}`, {
      method: 'PUT',
      headers: {}, // Remove Content-Type for FormData
      body: formData,
    });
  }

  async deleteCabin(id) {
    return this.request(`/admin/cabins/${id}`, {
      method: 'DELETE',
    });
  }

  // Reservations endpoints
  async getReservations() {
    return this.request('/admin/reservations');
  }

  async createReservation(reservation) {
    // Mapear los campos al formato correcto del backend
    const requestData = {
      cabin_id: Number(reservation.cabin_id),
      user_id: Number(reservation.user_id),
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      status: reservation.status,
      total_price: Number(reservation.total_price),
      number_of_people: Number(reservation.personas || reservation.number_of_people)
    };
    
    return this.request('/admin/reservations', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async updateReservation(id, reservation) {
    // Mapear los campos al formato correcto del backend
    const requestData = {
      cabin_id: Number(reservation.cabin_id),
      user_id: Number(reservation.user_id),
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      status: reservation.status,
      total_price: Number(reservation.total_price),
      number_of_people: Number(reservation.personas || reservation.number_of_people)
    };
    
    return this.request(`/admin/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  }

  async approveReservation(id) {
    return this.request(`/admin/reservations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  }

  async authorizeReservationPayment(id) {
    return this.request(`/admin/reservations/${id}/authorize-payment`, {
      method: 'POST', body: JSON.stringify({})
    });
  }

  async getPaymentSettings() {
    return this.request('/admin/payment-settings');
  }

  async updatePaymentSettings(data) {
    return this.request('/admin/payment-settings', {
      method: 'PUT', body: JSON.stringify(data)
    });
  }

  async rejectReservation(id, reason) {
    return this.request(`/admin/reservations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async deleteReservation(id) {
    return this.request(`/admin/reservations/${id}`, {
      method: 'DELETE',
    });
  }

  async getUpcomingReservations() {
    return this.request('/admin/reservations/upcoming');
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/admin/dashboard');
  }

  async getRevenueReport(period = 'monthly', months = 12) {
    return this.request(`/admin/dashboard/revenue?period=${encodeURIComponent(period)}&months=${encodeURIComponent(months)}`);
  }

  async getOccupancyReport(startDate, endDate) {
    const query = new URLSearchParams();
    if (startDate) query.set('start_date', startDate);
    if (endDate) query.set('end_date', endDate);
    return this.request(`/admin/dashboard/occupancy?${query.toString()}`);
  }

  async downloadReservationsReport(startDate, endDate) {
    const query = new URLSearchParams({ start_date: startDate, end_date: endDate });
    const response = await apiFetch(`/admin/dashboard/export?${query.toString()}`);
    if (!response.ok) {
      let data = {}; try { data = await response.json(); } catch { data = {}; }
      throw new Error(data.message || 'No se pudo generar el reporte.');
    }
    return response.blob();
  }

  // Activities endpoints
  async getActivities() {
    return this.request('/admin/activities');
  }

  async createActivity(activity) {
    return this.request('/admin/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  async updateActivity(id, activity) {
    return this.request(`/admin/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activity),
    });
  }

  async deleteActivity(id) {
    return this.request(`/admin/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Calendar endpoints
  async getCalendarOccupancy(year, month) {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month.toString().padStart(2, '0'));
    
    const endpoint = `/admin/calendar-occupancy${params.toString() ? '?' + params.toString() : ''}`;
    return this.request(endpoint);
  }

  // Get occupied dates for a specific cabin
  async getCabinOccupiedDates(cabinId, year, month) {
    try {
      const endpoint = `/admin/cabins/${cabinId}/occupied-dates`;
      const result = await this.request(endpoint);
      return result.data || [];
    } catch (error) {
      console.error('Error getting occupied dates from API:', error);
      
      // Fallback to local calculation
      try {
        const reservationsData = await this.getReservations();
        const reservations = reservationsData.data || [];
        
        // Filter reservations for this cabin that are confirmed or pending
        const cabinReservations = reservations.filter(r => 
          (r.cabin_id === cabinId) && 
          (r.status === 'confirmada' || r.status === 'confirmado' || r.status === 'pendiente')
        );
        
        const occupiedDates = [];
        cabinReservations.forEach(reservation => {
          const start = new Date(reservation.start_date);
          const end = new Date(reservation.end_date);
          
          // Add all dates between start and end (inclusive)
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            occupiedDates.push(d.toISOString().split('T')[0]);
          }
        });
        
        return occupiedDates;
      } catch (fallbackError) {
        console.error('Error in fallback occupied dates calculation:', fallbackError);
        return [];
      }
    }
  }

  // Calculate price for reservation
  async calculateReservationPrice(cabinId, startDate, endDate) {
    try {
      const requestData = {
        cabin_id: cabinId,
        start_date: startDate,
        end_date: endDate
      };
      
      const result = await this.request('/admin/reservations/calculate-price', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      
      return result.data || { total_price: 0 };
    } catch (error) {
      console.error('Error calculating price from API:', error);
      
      // Fallback to local calculation
      try {
        const cabinsData = await this.getCabins();
        const cabin = cabinsData.find(c => c.cabin_id === cabinId || c.id === cabinId);
        
        if (!cabin || !startDate || !endDate) return { total_price: 0 };
        
        // Calculate nights
        const start = new Date(startDate);
        const end = new Date(endDate);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        if (nights <= 0) return { total_price: 0 };
        
        // Basic pricing logic (fallback)
        const cabinName = cabin.name || cabin.nombre || '';
        let pricePerNight = cabin.price || cabin.precio_noche || 1500;
        
        // Apply weekend pricing if needed
        const isWeekend = start.getDay() === 5 || start.getDay() === 6; // Friday or Saturday
        if (isWeekend && cabinName.toLowerCase().includes('delfin')) {
          pricePerNight = Math.max(pricePerNight, 5000);
        } else if (isWeekend && cabinName.toLowerCase().includes('tiburon')) {
          pricePerNight = Math.max(pricePerNight, 5000);
        }
        
        const totalPrice = pricePerNight * nights;
        
        return {
          total_price: totalPrice,
          nights: nights,
          price_per_night: Math.round(totalPrice / nights),
          cabin_name: cabin.name || cabin.nombre,
          cabin_type: 'fallback'
        };
      } catch (fallbackError) {
        console.error('Error in fallback price calculation:', fallbackError);
        return { total_price: 0 };
      }
    }
  }

  async getWhatsAppAdmins() {
    return this.request('/admin/whatsapp-admins');
  }

  async createWhatsAppAdmin(data) {
    return this.request('/admin/whatsapp-admins', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateWhatsAppAdmin(id, data) {
    return this.request(`/admin/whatsapp-admins/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteWhatsAppAdmin(id) {
    return this.request(`/admin/whatsapp-admins/${id}`, { method: 'DELETE' });
  }

  async testWhatsAppAdmin(id) {
    return this.request(`/admin/whatsapp-admins/${id}/test`, { method: 'POST' });
  }

  async getNotifications(status = '') {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request(`/admin/notifications${query}`);
  }

  async retryNotification(id) {
    return this.request(`/admin/notifications/${id}/retry`, { method: 'POST' });
  }

  async getBackupStatus() {
    return this.request('/admin/backup/status');
  }

  async getBackups() {
    return this.request('/admin/backup/list');
  }

  async createBackup() {
    return this.request('/admin/backup/create', { method: 'POST' });
  }

  async downloadBackup(filename) {
    const response = await apiFetch(`/admin/backup/download/${encodeURIComponent(filename)}`);
    if (!response.ok) throw new Error('No se pudo descargar la copia de seguridad.');
    return response.blob();
  }

  // Conversation States endpoints
  async getConversationStates() {
    return this.request('/admin/conversation-states');
  }

  async createConversationState(state) {
    return this.request('/admin/conversation-states', {
      method: 'POST',
      body: JSON.stringify(state),
    });
  }

  async updateConversationState(id, state) {
    return this.request(`/admin/conversation-states/${id}`, {
      method: 'PUT',
      body: JSON.stringify(state),
    });
  }

  async deleteConversationState(id) {
    return this.request(`/admin/conversation-states/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
