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

  getMockData(endpoint) {
    // Extract base endpoint without query parameters
    const baseEndpoint = endpoint.split('?')[0];
    
    if (baseEndpoint === '/admin/users') {
      return [
        { user_id: 1, name: 'Juan Pérez', phone_number: '+54911234567', role: 'guest', is_active: 1, created_at: '2024-01-15T10:00:00Z' },
        { user_id: 2, name: 'María García', phone_number: '+54911234568', role: 'guest', is_active: 1, created_at: '2024-02-20T10:00:00Z' },
        { user_id: 3, name: 'Carlos López', phone_number: '+54911234569', role: 'guest', is_active: 0, created_at: '2024-03-10T10:00:00Z' }
      ];
    }
    
    if (baseEndpoint === '/admin/cabins') {
      return [
        // 3 Cabañas Tortuga
        { cabin_id: 1, id: 1, name: 'Cabaña Tortuga 1', nombre: 'Cabaña Tortuga 1', capacity: 3, capacidad: 3, price: 1500, precio_noche: 1500, description: 'Apartamento de 1 cuarto y 1 baño para máximo 3 personas', disponible: 1 },
        { cabin_id: 2, id: 2, name: 'Cabaña Tortuga 2', nombre: 'Cabaña Tortuga 2', capacity: 3, capacidad: 3, price: 1500, precio_noche: 1500, description: 'Apartamento de 1 cuarto y 1 baño para máximo 3 personas', disponible: 1 },
        { cabin_id: 3, id: 3, name: 'Cabaña Tortuga 3', nombre: 'Cabaña Tortuga 3', capacity: 3, capacidad: 3, price: 1500, precio_noche: 1500, description: 'Apartamento de 1 cuarto y 1 baño para máximo 3 personas', disponible: 1 },
        
        // 2 Cabañas Delfín
        { cabin_id: 4, id: 4, name: 'Cabaña Delfín 1', nombre: 'Cabaña Delfín 1', capacity: 6, capacidad: 6, price: 4500, precio_noche: 4500, description: 'Cabaña amplia de 2 cuartos y 2 baños para máximo 6 personas', disponible: 1 },
        { cabin_id: 5, id: 5, name: 'Cabaña Delfín 2', nombre: 'Cabaña Delfín 2', capacity: 6, capacidad: 6, price: 4500, precio_noche: 4500, description: 'Cabaña amplia de 2 cuartos y 2 baños para máximo 6 personas', disponible: 1 },
        
        // 8 Cabañas Tiburón
        { cabin_id: 6, id: 6, name: 'Cabaña Tiburón 1', nombre: 'Cabaña Tiburón 1', capacity: 9, capacidad: 9, price: 6000, precio_noche: 6000, description: 'Cabaña grande de 3 cuartos y 3 baños para máximo 9 personas', disponible: 1 },
        { cabin_id: 7, id: 7, name: 'Cabaña Tiburón 2', nombre: 'Cabaña Tiburón 2', capacity: 9, capacidad: 9, price: 6000, precio_noche: 6000, description: 'Cabaña grande de 3 cuartos y 3 baños para máximo 9 personas', disponible: 1 },
        { cabin_id: 8, id: 8, name: 'Cabaña Tiburón 3', nombre: 'Cabaña Tiburón 3', capacity: 9, capacidad: 9, price: 6000, precio_noche: 6000, description: 'Cabaña grande de 3 cuartos y 3 baños para máximo 9 personas', disponible: 1 },
        { cabin_id: 9, id: 9, name: 'Cabaña Tiburón 4', nombre: 'Cabaña Tiburón 4', capacity: 9, capacidad: 9, price: 6000, precio_noche: 6000, description: 'Cabaña grande de 3 cuartos y 3 baños para máximo 9 personas', disponible: 1 },
        { cabin_id: 10, id: 10, name: 'Cabaña Tiburón 5', nombre: 'Cabaña Tiburón 5', capacity: 9, capacidad: 9, price: 6000, precio_noche: 6000, description: 'Cabaña grande de 3 cuartos y 3 baños para máximo 9 personas', disponible: 1 },
        { cabin_id: 11, id: 11, name: 'Cabaña Tiburón 6', nombre: 'Cabaña Tiburón 6', capacity: 9, capacidad: 9, price: 6000, precio_noche: 6000, description: 'Cabaña grande de 3 cuartos y 3 baños para máximo 9 personas', disponible: 1 },
        { cabin_id: 12, id: 12, name: 'Cabaña Tiburón 7', nombre: 'Cabaña Tiburón 7', capacity: 9, capacidad: 9, price: 6000, precio_noche: 6000, description: 'Cabaña grande de 3 cuartos y 3 baños para máximo 9 personas', disponible: 1 },
        { cabin_id: 13, id: 13, name: 'Cabaña Tiburón 8', nombre: 'Cabaña Tiburón 8', capacity: 9, capacidad: 9, price: 6000, precio_noche: 6000, description: 'Cabaña grande de 3 cuartos y 3 baños para máximo 9 personas', disponible: 1 }
      ];
    }

    if (baseEndpoint === '/admin/activities') {
      return {
        success: true,
        activities: [
          {
            activity_id: 1,
            activity_key: 'act1',
            nombre: 'Senderismo en Punta Sal',
            descripcion: 'Caminata guiada por los senderos naturales con vistas panorámicas del océano.',
            categoria: 'Aventura',
            duracion: '3 horas',
            capacidad_maxima: 12,
            precios: {
              adulto: 800,
              niño: 400
            },
            ubicacion: {
              lugar: 'Punta Sal',
              coordenadas: { lat: -4.123, lng: -81.045 }
            },
            contacto: {
              whatsapp: '+51987654321',
              email: 'actividades@villasjulie.com'
            },
            multimedia: [
              'https://example.com/senderismo1.jpg',
              'https://example.com/senderismo2.jpg'
            ],
            activo: true,
            incluir_en_menu: true,
            orden_menu: 1,
            created_at: '2025-01-15T08:00:00Z',
            updated_at: '2025-01-15T08:00:00Z'
          },
          {
            activity_id: 2,
            activity_key: 'act2',
            nombre: 'Restaurante Mirador Las Playas',
            descripcion: 'Disfruta de la mejor gastronomía local con vista al mar en nuestro restaurante mirador.',
            categoria: 'Gastronomía',
            duracion: '2 horas',
            capacidad_maxima: 40,
            precios: {
              adulto: 1200,
              niño: 600,
              menu_ejecutivo: 850
            },
            ubicacion: {
              lugar: 'Mirador Las Playas',
              coordenadas: { lat: -4.127, lng: -81.042 }
            },
            contacto: {
              whatsapp: '+51987654322',
              email: 'restaurante@villasjulie.com'
            },
            multimedia: [
              'https://example.com/restaurante1.jpg',
              'https://example.com/restaurante2.jpg',
              'https://example.com/menu.pdf'
            ],
            activo: true,
            incluir_en_menu: true,
            orden_menu: 2,
            created_at: '2025-01-20T10:00:00Z',
            updated_at: '2025-01-20T10:00:00Z'
          }
        ]
      };
    }

    if (baseEndpoint === '/admin/reservations') {
      return {
        success: true,
        data: [
          { 
            reservation_id: 1, 
            user_id: 1,
            user_name: 'Ana Martínez', 
            phone_number: '+54911234570',
            cabin_id: 1,
            cabin_name: 'Cabaña Tortuga 1',
            start_date: '2025-08-15', 
            end_date: '2025-08-20', 
            status: 'confirmada', 
            total_price: 7500,
            personas: 3,
            comprobante_nombre_archivo: null
          },
          { 
            reservation_id: 2, 
            user_id: 2,
            user_name: 'Roberto Silva', 
            phone_number: '+54911234571',
            cabin_id: 2,
            cabin_name: 'Cabaña Delfín 1',
            start_date: '2025-08-22', 
            end_date: '2025-08-25', 
            status: 'pendiente', 
            total_price: 5400,
            personas: 2,
            comprobante_nombre_archivo: null
          },
          { 
            reservation_id: 7, 
            user_id: 7,
            user_name: 'Patricia López', 
            phone_number: '+54911234576',
            cabin_id: 3,
            cabin_name: 'Cabaña Tortuga 3',
            start_date: '2025-07-28', 
            end_date: '2025-08-02', 
            status: 'confirmada', 
            total_price: 6000,
            personas: 4,
            comprobante_nombre_archivo: null
          },
          { 
            reservation_id: 8, 
            user_id: 8,
            user_name: 'Miguel Torres', 
            phone_number: '+54911234577',
            cabin_id: 6,
            cabin_name: 'Cabaña Tiburón 1',
            start_date: '2025-08-05', 
            end_date: '2025-08-12', 
            status: 'confirmada', 
            total_price: 12600,
            personas: 6,
            comprobante_nombre_archivo: 'comprobante-001.jpg'
          },
          { 
            reservation_id: 9, 
            user_id: 9,
            user_name: 'Sandra Ramírez', 
            phone_number: '+54911234578',
            cabin_id: 4,
            cabin_name: 'Cabaña Delfín 1',
            start_date: '2025-09-10', 
            end_date: '2025-09-15', 
            status: 'pendiente', 
            total_price: 9000,
            personas: 5,
            comprobante_nombre_archivo: null
          },
          { 
            reservation_id: 10, 
            user_id: 10,
            user_name: 'Fernando Vega', 
            phone_number: '+54911234579',
            cabin_id: 7,
            cabin_name: 'Cabaña Tiburón 2',
            start_date: '2025-08-30', 
            end_date: '2025-09-06', 
            status: 'confirmada', 
            total_price: 12000,
            personas: 8,
            comprobante_nombre_archivo: 'comprobante-002.pdf'
          },
          { 
            reservation_id: 11, 
            user_id: 11,
            user_name: 'Claudia Herrera', 
            phone_number: '+54911234580',
            cabin_id: 2,
            cabin_name: 'Cabaña Tortuga 2',
            start_date: '2025-07-15', 
            end_date: '2025-07-22', 
            status: 'cancelada', 
            total_price: 4500,
            personas: 2,
            comprobante_nombre_archivo: null
          },
          { 
            reservation_id: 12, 
            user_id: 12,
            user_name: 'Alejandro Méndez', 
            phone_number: '+54911234581',
            cabin_id: 5,
            cabin_name: 'Cabaña Delfín 2',
            start_date: '2025-10-01', 
            end_date: '2025-10-07', 
            status: 'pendiente', 
            total_price: 10800,
            personas: 6,
            comprobante_nombre_archivo: null
          }
        ]
      };
    }

    if (baseEndpoint === '/admin/reservations/upcoming') {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const dayAfterTomorrow = new Date(today.getTime() + 48 * 60 * 60 * 1000);
      
      const mockData = [
        {
          reservation_id: 3,
          user_id: 3,
          user_name: 'María González',
          phone_number: '+54911234572',
          cabin_id: 1,
          cabin_name: 'Cabaña Tortuga 1',
          start_date: today.toISOString().split('T')[0],
          end_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'confirmada',
          total_price: 4500,
          personas: 2,
          event_type: 'check_in',
          urgency: 'today'
        },
        {
          reservation_id: 4,
          user_id: 4,
          user_name: 'Carlos Rodríguez',
          phone_number: '+54911234573',
          cabin_id: 2,
          cabin_name: 'Cabaña Delfín 1',
          start_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: today.toISOString().split('T')[0],
          status: 'confirmada',
          total_price: 3000,
          personas: 2,
          event_type: 'check_out',
          urgency: 'today'
        },
        {
          reservation_id: 5,
          user_id: 5,
          user_name: 'Laura Fernández',
          phone_number: '+54911234574',
          cabin_id: 3,
          cabin_name: 'Cabaña Tortuga 2',
          start_date: tomorrow.toISOString().split('T')[0],
          end_date: new Date(tomorrow.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'confirmada',
          total_price: 6000,
          personas: 3,
          event_type: 'check_in',
          urgency: 'tomorrow'
        },
        {
          reservation_id: 6,
          user_id: 6,
          user_name: 'Diego Morales',
          phone_number: '+54911234575',
          cabin_id: 4,
          cabin_name: 'Cabaña Delfín 2',
          start_date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: dayAfterTomorrow.toISOString().split('T')[0],
          status: 'confirmada',
          total_price: 7500,
          personas: 4,
          event_type: 'check_out',
          urgency: 'later'
        }
      ];
      
      return mockData;
    }

    if (baseEndpoint === '/admin/calendar-occupancy') {
      return {
        success: true,
        data: {
          cabanas: [
            { id: 1, nombre: 'Cabaña Tortuga 1', capacidad: 3 },
            { id: 2, nombre: 'Cabaña Tortuga 2', capacidad: 3 },
            { id: 3, nombre: 'Cabaña Tortuga 3', capacidad: 3 },
            { id: 4, nombre: 'Cabaña Delfín 1', capacidad: 6 },
            { id: 5, nombre: 'Cabaña Delfín 2', capacidad: 6 },
            { id: 6, nombre: 'Cabaña Tiburón 1', capacidad: 8 },
            { id: 7, nombre: 'Cabaña Tiburón 2', capacidad: 8 },
            { id: 8, nombre: 'Cabaña Tiburón 3', capacidad: 8 },
            { id: 9, nombre: 'Cabaña Tiburón 4', capacidad: 8 },
            { id: 10, nombre: 'Cabaña Tiburón 5', capacidad: 8 },
            { id: 11, nombre: 'Cabaña Tiburón 6', capacidad: 8 },
            { id: 12, nombre: 'Cabaña Tiburón 7', capacidad: 8 },
            { id: 13, nombre: 'Cabaña Tiburón 8', capacidad: 8 }
          ],
          ocupacion: {
            1: {
              '2025-08-05': 'confirmada',
              '2025-08-06': 'confirmada',
              '2025-08-07': 'confirmada'
            },
            4: {
              '2025-08-10': 'pendiente',
              '2025-08-11': 'pendiente',
              '2025-08-12': 'pendiente'
            },
            6: {
              '2025-08-15': 'confirmada',
              '2025-08-16': 'confirmada'
            },
            2: {
              '2025-08-20': 'confirmada',
              '2025-08-21': 'confirmada',
              '2025-08-22': 'confirmada'
            }
          },
          year: 2025,
          month: 8
        }
      };
    }
    
    return [];
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
      cabin_id: reservation.cabin_id,
      user_id: reservation.user_id,
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      status: reservation.status,
      total_price: reservation.total_price,
      number_of_people: reservation.personas || reservation.number_of_people
    };
    
    return this.request('/admin/reservations', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async updateReservation(id, reservation) {
    // Mapear los campos al formato correcto del backend
    const requestData = {
      cabin_id: reservation.cabin_id,
      user_id: reservation.user_id,
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      status: reservation.status,
      total_price: reservation.total_price,
      number_of_people: reservation.personas || reservation.number_of_people
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
