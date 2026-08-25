import React, { useState, useEffect, useCallback } from 'react';
// Utilidad para formatear fechas a 'yyyy-MM-dd'
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Divider,
  Tooltip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Hotel as HotelIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

// Utilidad para calcular precio basado en las reglas del negocio
const calculatePrice = (cabinType, startDate, endDate) => {
  if (!startDate || !endDate || !cabinType) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  if (nights <= 0) return 0;
  
  // Mapear nombres de cabañas a tipos cortos
  let tipoCabana = '';
  if (cabinType.toLowerCase().includes('tortuga')) {
    tipoCabana = 'tortuga';
  } else if (cabinType.toLowerCase().includes('delfín') || cabinType.toLowerCase().includes('delfin')) {
    tipoCabana = 'delfin';
  } else if (cabinType.toLowerCase().includes('tiburón') || cabinType.toLowerCase().includes('tiburon')) {
    tipoCabana = 'tiburon';
  }
  
  if (!tipoCabana) return 0;
  
  // Implementar lógica de cálculo de precio del servicio
  return calcularPrecioTotal(tipoCabana, start, nights);
};

// Función auxiliar para calcular precio (copiada del servicio backend)
const calcularPrecioTotal = (tipoCabana, fechaEntrada, noches) => {
  if (tipoCabana === 'tortuga') {
    return 1500 * noches;
  }
  
  if (tipoCabana === 'delfin') {
    if (noches === 1) {
      const dayOfWeek = fechaEntrada.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Viernes o sábado
        return 5000;
      } else {
        return 3000;
      }
    } else if (noches === 2) {
      const diaEntrada = fechaEntrada.getDay();
      const diaSalida = new Date(fechaEntrada.getTime() + 24 * 60 * 60 * 1000).getDay();
      if (diaEntrada === 5 && diaSalida === 6) {
        return 7000;
      } else {
        return 3000 * noches;
      }
    } else {
      let total = 0;
      for (let i = 0; i < noches; i++) {
        const diaReserva = new Date(fechaEntrada.getTime() + i * 24 * 60 * 60 * 1000).getDay();
        if (diaReserva >= 1 && diaReserva <= 4) {
          total += 3000;
        } else {
          total += 5000;
        }
      }
      return total;
    }
  }
  
  if (tipoCabana === 'tiburon') {
    if (noches === 1) {
      const dayOfWeek = fechaEntrada.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        return 5000;
      } else {
        return 3500;
      }
    } else if (noches === 2) {
      const diaEntrada = fechaEntrada.getDay();
      const diaSalida = new Date(fechaEntrada.getTime() + 24 * 60 * 60 * 1000).getDay();
      if (diaEntrada === 5 && diaSalida === 6) {
        return 8000;
      } else {
        return 3500 * noches;
      }
    } else {
      let total = 0;
      for (let i = 0; i < noches; i++) {
        const diaReserva = new Date(fechaEntrada.getTime() + i * 24 * 60 * 60 * 1000).getDay();
        if (diaReserva >= 1 && diaReserva <= 4) {
          total += 3500;
        } else {
          total += 5000;
        }
      }
      return total;
    }
  }
  
  return 0;
};

const CrearReserva = () => {
  // Estado para feedback en el modal de usuario
  const [userModalMessage, setUserModalMessage] = useState({ type: '', text: '' });

  // Guardar nuevo usuario desde el modal
  const handleSaveNewUser = async () => {
    try {
      setUserModalMessage({ type: '', text: '' });
      if (!newUserData.name || !newUserData.phone_number) {
        setUserModalMessage({ type: 'error', text: 'Nombre y teléfono son obligatorios' });
        return;
      }
      setLoading(prev => ({ ...prev, save: true }));
      const userPayload = {
        name: newUserData.name,
        phone_number: newUserData.phone_number,
        role: 'guest',
        is_active: 1
      };
      const result = await apiService.createUser(userPayload);
      // El backend responde { success, user_id }
      if (result && result.success && result.user_id) {
        await loadUsers();
        setFormData(prev => ({ ...prev, user_id: result.user_id, phone_number: newUserData.phone_number }));
        setUserModalMessage({ type: 'success', text: 'Usuario creado exitosamente' });
        setTimeout(() => {
          setShowUserModal(false);
          setNewUserData({ name: '', phone_number: '' });
          setUserModalMessage({ type: '', text: '' });
          setActiveStep(3);
        }, 1200);
      } else {
        setUserModalMessage({ type: 'error', text: 'No se pudo crear el usuario' });
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setUserModalMessage({ type: 'error', text: 'Error al crear usuario' });
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };
  // Abrir modal para crear usuario
  const handleCreateUser = () => {
    setShowUserModal(true);
  };
  // Estados principales
  const [cabins, setCabins] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState({
    cabins: true,
    users: false,
    save: false,
    checkDates: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    cabin_id: '',
    user_id: '',
    phone_number: '',
    start_date: '',
    end_date: '',
    personas: '',
    total_price: 0,
    status: 'pendiente'
  });
  
  // Estados de validación y UI
  const [fieldsEnabled, setFieldsEnabled] = useState({
    personas: false,
    start_date: false,
    end_date: false,
    user_id: false
  });
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Modal para crear usuario
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    phone_number: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(prev => ({ ...prev, cabins: true }));
      
      // Cargar cabañas
      const cabinsData = await apiService.getCabins();
      setCabins(Array.isArray(cabinsData) ? cabinsData : []);
      
      // Cargar reservas para detectar fechas ocupadas
      const reservationsData = await apiService.getReservations();
      setReservations(reservationsData.data || []);
      
      setError(null);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(prev => ({ ...prev, cabins: false }));
    }
  };

  // Cargar usuarios cuando se necesite
  const loadUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const usersResult = await apiService.getUsers();
      // El backend responde { success, data: [...] }
      const usersData = usersResult && Array.isArray(usersResult.data) ? usersResult.data : [];
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Manejar selección de cabaña
  const handleCabinChange = useCallback((cabinId) => {
    const selectedCabin = cabins.find(cabin => cabin.cabin_id === cabinId || cabin.id === cabinId);
    
    if (selectedCabin) {
      // Habilitar campos
      setFieldsEnabled({
        personas: true,
        start_date: true,
        end_date: true,
        user_id: true
      });
      
      // Establecer capacidad máxima automáticamente (solo lectura)
      setFormData(prev => ({
        ...prev,
        cabin_id: cabinId,
        personas: selectedCabin.capacity || selectedCabin.capacidad,
        start_date: '',
        end_date: '',
        total_price: 0
      }));
      
      // Cargar fechas ocupadas para esta cabaña
      loadOccupiedDates(cabinId);
      
      setActiveStep(1);
      setValidationErrors({});
    } else {
      // Resetear todo si no hay cabaña seleccionada
      resetForm();
    }
  }, [cabins]);

  // Cargar fechas ocupadas para una cabaña específica
  const loadOccupiedDates = async (cabinId) => {
    try {
      setLoading(prev => ({ ...prev, checkDates: true }));
      
      // Usar el nuevo método del API service
      const occupied = await apiService.getCabinOccupiedDates(cabinId);
      setOccupiedDates(occupied);
      
    } catch (err) {
      console.error('Error loading occupied dates:', err);
      setError('Error al cargar fechas ocupadas');
    } finally {
      setLoading(prev => ({ ...prev, checkDates: false }));
    }
  };

  // Validar y establecer fechas
  const handleDateChange = async (field, date) => {
    if (!date) {
      setFormData(prev => ({ ...prev, [field]: '', total_price: 0 }));
      return;
    }
    const dateStr = formatDate(date);
    // Verificar si la fecha está ocupada
    if (occupiedDates.includes(dateStr)) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: 'Esta fecha no está disponible'
      }));
      return;
    }
    setValidationErrors(prev => ({ ...prev, [field]: null }));
    // Usar los valores actualizados para ambos campos
    let newStart = field === 'start_date' ? date : formData.start_date;
    let newEnd = field === 'end_date' ? date : formData.end_date;
    // Validar que check-out > check-in
    if (newStart && newEnd && new Date(newStart) >= new Date(newEnd)) {
      setValidationErrors(prev => ({
        ...prev,
        start_date: 'La fecha de entrada debe ser anterior a la salida',
        end_date: 'La fecha de salida debe ser posterior a la entrada'
      }));
      setFormData(prev => ({ ...prev, [field]: date, total_price: 0 }));
      return;
    }
    // Calcular precio automáticamente si ambas fechas están definidas
    let total_price = 0;
    if (newStart && newEnd) {
      const selectedCabin = cabins.find(cabin => 
        cabin.cabin_id === formData.cabin_id || cabin.id === formData.cabin_id
      );
      if (selectedCabin) {
        try {
          setLoading(prev => ({ ...prev, checkDates: true }));
          const priceData = await apiService.calculateReservationPrice(
            formData.cabin_id,
            formatDate(newStart),
            formatDate(newEnd)
          );
          if (priceData && typeof priceData.total_price === 'number' && priceData.total_price > 0) {
            total_price = priceData.total_price;
          } else {
            total_price = calculatePrice(selectedCabin.name, newStart, newEnd);
          }
        } catch (err) {
          console.error('Error calculating price:', err);
          total_price = calculatePrice(selectedCabin.name, newStart, newEnd);
        } finally {
          setLoading(prev => ({ ...prev, checkDates: false }));
        }
      }
      setActiveStep(2);
    }
    setFormData(prev => ({ ...prev, [field]: date, total_price }));
  };

  // Validar usuario
  // Cambiado: ahora busca por número de teléfono
  const handleUserChange = async (phone) => {
    if (!phone) {
      setFormData(prev => ({ ...prev, user_id: '', phone_number: '' }));
      return;
    }
    // Buscar usuario por número de teléfono
    let foundUser = null;
    // Si no hay usuarios cargados, intenta cargarlos
    if (users.length === 0) {
      try {
        await loadUsers();
      } catch (err) {
        // Si falla, igual sigue con users vacíos
      }
    }
    foundUser = users.find(u => u.phone_number === phone);
    if (foundUser) {
      setFormData(prev => ({ ...prev, user_id: foundUser.user_id || foundUser.id, phone_number: phone }));
      setValidationErrors(prev => ({ ...prev, phone_number: null }));
    } else {
      setFormData(prev => ({ ...prev, user_id: '', phone_number: phone }));
      setValidationErrors(prev => ({ ...prev, phone_number: 'Usuario no encontrado, puedes crearlo con el botón ➕' }));
    }
  };

  // Guardar la reserva
  const handleSaveReservation = async () => {
    try {
      // Validaciones finales
      const errors = {};
      if (!formData.cabin_id) errors.cabin_id = 'Cabaña es obligatoria';
      if (!formData.user_id) errors.user_id = 'Usuario es obligatorio';
      if (!formData.phone_number) errors.phone_number = 'Número de teléfono es obligatorio';
      if (!formData.start_date) errors.start_date = 'Fecha de entrada es obligatoria';
      if (!formData.end_date) errors.end_date = 'Fecha de salida es obligatoria';
      if (!formData.personas || formData.personas <= 0) errors.personas = 'Cantidad de personas debe ser mayor a 0';
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      setLoading(prev => ({ ...prev, save: true }));
      const reservationData = {
        cabin_id: formData.cabin_id,
        user_id: formData.user_id,
        phone_number: formData.phone_number,
        start_date: formatDate(formData.start_date),
        end_date: formatDate(formData.end_date),
        personas: formData.personas,
        total_price: formData.total_price,
        status: formData.status
      };
      const response = await apiService.createReservation(reservationData);
      // Recargar la lista de reservas
      await loadInitialData();
      // Mostrar resumen de la reserva creada con formato y estado
      let resumen = '';
      if (response && (response.reservation_id || response.id)) {
        resumen += `<b>ID:</b> ${response.reservation_id || response.id}<br/>`;
      }
      resumen += `<b>Cabaña:</b> ${selectedCabin ? (selectedCabin.name || selectedCabin.nombre) : formData.cabin_id}<br/>`;
      resumen += `<b>Usuario:</b> ${formData.phone_number}<br/>`;
      resumen += `<b>Fechas:</b> ${formData.start_date} a ${formData.end_date}<br/>`;
      resumen += `<b>Total:</b> L ${formData.total_price.toLocaleString('es-HN')}<br/>`;
      resumen += `<b>Estado:</b> pendiente`;
      setSuccess({ __html: 'Reserva creada exitosamente.<br/>' + resumen });
      // Resetear formulario después de un tiempo
      setTimeout(() => {
        resetForm();
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error saving reservation:', err);
      setError('Error al guardar la reserva');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      cabin_id: '',
      user_id: '',
      phone_number: '',
      start_date: '',
      end_date: '',
      personas: '',
      total_price: 0,
      status: 'pendiente'
    });
    setFieldsEnabled({
      personas: false,
      start_date: false,
      end_date: false,
      user_id: false
    });
    setOccupiedDates([]);
    setActiveStep(0);
    setValidationErrors({});
    setError(null);
  };

  // Función para deshabilitar fechas en el DatePicker
  // Esta función ya no se usa con los inputs nativos, pero se deja como referencia
  // const shouldDisableDate = (date) => {
  //   const dateStr = formatDate(date);
  //   return occupiedDates.includes(dateStr) || isBefore(date, new Date());
  // };

  const selectedCabin = cabins.find(cabin => 
    cabin.cabin_id === formData.cabin_id || cabin.id === formData.cabin_id
  );

  const nights = formData.start_date && formData.end_date 
    ? Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24))
    : 0;

  const steps = [
    {
      label: 'Seleccionar Cabaña',
      description: 'Elige la cabaña para la reserva'
    },
    {
      label: 'Fechas y Huéspedes',
      description: 'Define las fechas de estadía'
    },
    {
      label: 'Precio Total',
      description: 'Verificar costo calculado'
    },
    {
      label: 'Usuario',
      description: 'Asignar o crear usuario'
    }
  ];

  return (
    <DashboardLayout title="Crear Reserva">
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
              🇭🇳 Crear Reserva
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete el formulario para agregar una nueva reserva
            </Typography>
          </Box>

          {/* Alertas */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
              <span dangerouslySetInnerHTML={success} />
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Panel izquierdo - Stepper */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Progreso de la Reserva
                </Typography>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {step.label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Card>

              {/* Resumen de la reserva */}
              {selectedCabin && (
                <Card sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
                    📋 Resumen de la Reserva
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><HotelIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Cabaña"
                        secondary={selectedCabin.name || selectedCabin.nombre}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><GroupIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Capacidad Máxima"
                        secondary={`${selectedCabin.capacity || selectedCabin.capacidad} personas`}
                      />
                    </ListItem>
                    {formData.start_date && formData.end_date && (
                      <>
                        <ListItem>
                          <ListItemIcon><EventIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Estadía"
                            secondary={`${nights} noche${nights !== 1 ? 's' : ''}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><MoneyIcon color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Precio Total"
                            secondary={`L ${formData.total_price.toLocaleString('es-HN')}`}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </Card>
              )}
            </Grid>

            {/* Panel derecho - Formulario */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Paso 1: Selección de Cabaña */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HomeIcon color="primary" />
                        1. Seleccionar Cabaña
                      </Typography>
                      <FormControl fullWidth error={!!validationErrors.cabin_id}>
                        <InputLabel>Cabaña *</InputLabel>
                        <Select
                          value={formData.cabin_id}
                          label="Cabaña *"
                          onChange={(e) => handleCabinChange(e.target.value)}
                          disabled={loading.cabins}
                        >
                          <MenuItem value="">
                            <em>Seleccione una cabaña</em>
                          </MenuItem>
                          {cabins.map((cabin) => (
                            <MenuItem key={cabin.cabin_id || cabin.id} value={cabin.cabin_id || cabin.id}>
                              {cabin.name || cabin.nombre} (Capacidad: {cabin.capacity || cabin.capacidad} personas)
                            </MenuItem>
                          ))}
                        </Select>
                        {validationErrors.cabin_id && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            {validationErrors.cabin_id}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    {/* Paso 2: Cantidad de Personas (Solo lectura) */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon color="primary" />
                        2. Cantidad de Personas
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Cantidad de Personas"
                        type="number"
                        value={formData.personas}
                        disabled={!fieldsEnabled.personas}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon />
                            </InputAdornment>
                          ),
                        }}
                        helperText={fieldsEnabled.personas ? 
                          "Capacidad máxima de la cabaña seleccionada" : 
                          "Seleccione una cabaña primero"
                        }
                      />
                    </Grid>

                    {/* Paso 3: Fechas */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon color="primary" />
                        3. Fechas de Reserva
                      </Typography>
                    </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Fecha Check-in *"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleDateChange('start_date', e.target.value)}
                      disabled={!fieldsEnabled.start_date}
                      error={!!validationErrors.start_date}
                      helperText={validationErrors.start_date || 
                        (!fieldsEnabled.start_date ? "Seleccione una cabaña primero" : 
                        "Las fechas ocupadas están marcadas como no disponibles")}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().split('T')[0]
                      }}
                    />
                    {/* Mostrar fechas ocupadas */}
                    {occupiedDates.length > 0 && fieldsEnabled.start_date && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Fechas ocupadas: {occupiedDates.slice(0, 5).join(', ')}
                        {occupiedDates.length > 5 && '...'}
                      </Typography>
                    )}
                  </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Fecha Check-out *"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleDateChange('end_date', e.target.value)}
                        disabled={!fieldsEnabled.end_date}
                        error={!!validationErrors.end_date}
                        helperText={validationErrors.end_date || 
                          (!fieldsEnabled.end_date ? "Seleccione fechas de entrada primero" : 
                          "Mínimo 1 noche de estadía")}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          min: formData.start_date ? 
                            new Date(new Date(formData.start_date).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
                            new Date().toISOString().split('T')[0]
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    {/* Paso 4: Precio Total (Solo lectura) */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MoneyIcon color="primary" />
                        4. Precio Total
                      </Typography>
                      
                      <TextField
                        fullWidth
                        label="Precio Total (Lempiras)"
                        value={formData.total_price ? `L ${formData.total_price.toLocaleString('es-HN')}` : ''}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              {loading.checkDates ? <CircularProgress size={20} /> : <MoneyIcon />}
                            </InputAdornment>
                          ),
                        }}
                        helperText={loading.checkDates ? 
                          "Calculando precio..." : 
                          "Calculado automáticamente según fechas y tipo de cabaña"
                        }
                        sx={{
                          '& .MuiInputBase-input': {
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: '#2e7d32'
                          }
                        }}
                      />
                    </Grid>

                    {/* Paso 5: Usuario */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        5. Usuario
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                          fullWidth
                          label="Teléfono del Usuario *"
                          type="tel"
                          value={formData.phone_number || ''}
                          onChange={(e) => handleUserChange(e.target.value)}
                          disabled={!fieldsEnabled.user_id}
                          error={!!validationErrors.phone_number}
                          helperText={validationErrors.phone_number || 
                            (!fieldsEnabled.user_id ? "Complete los pasos anteriores" : 
                            "Ingrese el número de teléfono del usuario registrado")}
                          placeholder="+504 1234-5678"
                        />
                        <Tooltip title="Crear nuevo usuario">
                          <IconButton
                            color="primary"
                            onClick={handleCreateUser}
                            disabled={!fieldsEnabled.user_id}
                            sx={{ mt: 1 }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    {/* Botones de acción */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={resetForm}
                          disabled={loading.save}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveReservation}
                          disabled={
                            loading.save || 
                            !formData.cabin_id || 
                            !formData.user_id || 
                            !formData.start_date || 
                            !formData.end_date ||
                            Object.keys(validationErrors).some(key => validationErrors[key])
                          }
                          sx={{ bgcolor: '#2e7d32' }}
                        >
                          {loading.save ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            'Crear Reserva'
                          )}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Modal para crear usuario */}
          <Dialog open={showUserModal} onClose={() => setShowUserModal(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
              ➕ Crear Nuevo Usuario
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
          {/* Mensaje de éxito/error en el modal */}
          {userModalMessage.text && (
            <Alert severity={userModalMessage.type} sx={{ mb: 2 }}>
              {userModalMessage.text}
            </Alert>
          )}
          <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre Completo *"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teléfono *"
                    value={newUserData.phone_number}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, phone_number: e.target.value }))}
                    required
                    placeholder="+504 1234-5678"
                  />
                </Grid>
                {/* Email field removed as it is not present in the database */}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setShowUserModal(false)} color="inherit">
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveNewUser} 
                variant="contained" 
                disabled={loading.save || !newUserData.name || !newUserData.phone_number}
                sx={{ bgcolor: '#2e7d32' }}
              >
                {loading.save ? <CircularProgress size={20} color="inherit" /> : 'Crear Usuario'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      {/* Fin del formulario */}
    </DashboardLayout>
  );
};

export default CrearReserva;
