import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  TablePagination,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Collapse,
  Avatar,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  CalendarToday,
  Person,
  Home,
  ExpandMore,
  ExpandLess,
  Phone,
  Group,
  LocalAtm,
  ReceiptLong as ReceiptIcon,
  Close as RejectIcon
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

const PENDING_STATUSES = ['pendiente_autorizacion', 'esperando_pago', 'pendiente_verificacion'];
const REJECTABLE_STATUSES = new Set(PENDING_STATUSES);

/**
 * 🏨 INTERFAZ PROFESIONAL DE GESTIÓN DE RESERVAS MEJORADA
 * 
 * Características nuevas:
 * ✅ Dashboard con pestañas interactivas (Próximas, Pasadas, Pendientes, Todas)
 * ✅ Búsqueda por usuario, teléfono y cabaña
 * ✅ Filtros avanzados colapsables
 * ✅ Tabla responsive con avatares y estados coloridos
 * ✅ Paginación configurable
 * ✅ Exportación a CSV
 * ✅ Acciones: Confirmar, Editar, Eliminar
 * ✅ Validaciones y confirmaciones
 * ✅ Notificaciones profesionales
 * ✅ Ordenamiento automático por fecha
 */
const ReservationsPageSimplePro = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de UI mejorados
  const [currentTab, setCurrentTab] = useState(0); // 0: Próximas, 1: Pasadas, 2: Pendientes, 3: Todas
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  
  // Estados de filtros avanzados
  const [filters, setFilters] = useState({
    status: '',
    cabin: '',
    dateFrom: '',
    dateTo: '',
    guests: ''
  });
  
  // Estados de dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    cabin_id: '',
    user_id: '',
    start_date: '',
    end_date: '',
    status: 'pendiente_autorizacion',
    total_price: '',
    personas: ''
  });

  // 🔄 Cargar datos iniciales
  useEffect(() => {
    fetchReservations();
  }, []);

  /**
   * 📊 Obtiene todas las reservas del backend
   */
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando reservas...');
      const response = await apiService.getReservations();
      
      if (response.success) {
        // Ordenar por fecha de inicio por defecto
        const sortedReservations = response.data.sort((a, b) => 
          new Date(a.start_date) - new Date(b.start_date)
        );
        setReservations(sortedReservations);
        console.log('✅ Reservas cargadas:', sortedReservations.length);
      } else {
        throw new Error(response.message || 'Error al cargar reservas');
      }
    } catch (error) {
      console.error('❌ Error fetching reservations:', error);
      setError(error.message);
      showSnackbar('Error al cargar las reservas', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔍 Filtrar y ordenar reservas según la pestaña activa
   */
  const filteredReservations = useMemo(() => {
    let filtered = [...reservations];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filtrado por pestaña
    switch (currentTab) {
      case 0: // Próximas
        filtered = filtered.filter(r => new Date(r.start_date) >= today);
        filtered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        break;
      case 1: // Pasadas
        filtered = filtered.filter(r => new Date(r.end_date) < today);
        filtered.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
        break;
      case 2: // Pendientes
        filtered = filtered.filter(r => PENDING_STATUSES.includes(r.status));
        filtered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        break;
      case 3: // Todas
        filtered.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        break;
      default:
        break;
    }

    // Filtrado por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        (r.user_name && r.user_name.toLowerCase().includes(term)) ||
        (r.phone_number && r.phone_number.includes(term)) ||
        (r.cabin_name && r.cabin_name.toLowerCase().includes(term)) ||
        (r.reservation_id && r.reservation_id.toString().includes(term))
      );
    }

    // Filtros adicionales
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    if (filters.cabin) {
      filtered = filtered.filter(r =>
        (r.cabin_name && r.cabin_name.toLowerCase().includes(filters.cabin.toLowerCase())) ||
        (r.cabin_id && r.cabin_id.toString() === filters.cabin)
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(r => new Date(r.start_date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => new Date(r.end_date) <= new Date(filters.dateTo));
    }
    if (filters.guests) {
      filtered = filtered.filter(r => r.personas >= parseInt(filters.guests));
    }

    return filtered;
  }, [reservations, currentTab, searchTerm, filters]);

  /**
   * 📊 Contadores para las pestañas
   */
  const getReservationCounts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      upcoming: reservations.filter(r => new Date(r.start_date) >= today).length,
      past: reservations.filter(r => new Date(r.end_date) < today).length,
      pending: reservations.filter(r => PENDING_STATUSES.includes(r.status)).length,
      total: reservations.length
    };
  };

  const counts = getReservationCounts();

  const handleOpenDialog = (reservation = null) => {
    setEditingReservation(reservation);
    if (reservation) {
      setFormData({
        cabin_id: reservation.cabin_id || '',
        user_id: reservation.user_id || '',
        start_date: reservation.start_date || '',
        end_date: reservation.end_date || '',
        status: reservation.status || 'pendiente_autorizacion',
        total_price: reservation.total_price || '',
        personas: reservation.personas || ''
      });
    } else {
      setFormData({
        cabin_id: '',
        user_id: '',
        start_date: '',
        end_date: '',
        status: 'pendiente_autorizacion',
        total_price: '',
        personas: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReservation(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingReservation) {
        await apiService.updateReservation(editingReservation.reservation_id, formData);
        showSnackbar('Reserva actualizada exitosamente', 'success');
      } else {
        await apiService.createReservation(formData);
        showSnackbar('Reserva creada exitosamente', 'success');
      }
      
      handleCloseDialog();
      fetchReservations();
    } catch (error) {
      console.error('Error saving reservation:', error);
      showSnackbar('Error al guardar la reserva', 'error');
    }
  };

  const handleConfirm = async (id) => {
    if (!window.confirm('¿Confirmar definitivamente esta reserva después de revisar el comprobante?')) return;
    try {
      const result = await apiService.approveReservation(id);
      showSnackbar(
        result.notificationSent
          ? 'Reserva confirmada y huésped notificado por WhatsApp'
          : 'Reserva confirmada; la notificación de WhatsApp quedó pendiente',
        result.notificationSent ? 'success' : 'warning'
      );
      fetchReservations();
    } catch (error) {
      console.error('Error confirming reservation:', error);
      showSnackbar('No se pudo confirmar. Verifica el comprobante y la disponibilidad.', 'error');
    }
  };

  const handleAuthorizePayment = async (id) => {
    if (!window.confirm('¿Autorizar al huésped para realizar el pago y enviar el comprobante?')) return;
    try {
      const result = await apiService.authorizeReservationPayment(id);
      showSnackbar(result.notificationSent
        ? 'Pago autorizado y huésped notificado por WhatsApp'
        : 'Pago autorizado; el aviso de WhatsApp quedó pendiente', result.notificationSent ? 'success' : 'warning');
      fetchReservations();
    } catch (error) {
      console.error('Error authorizing payment:', error);
      showSnackbar(error.code === 'PAYMENT_SETTINGS_INCOMPLETE'
        ? 'Primero registra las cuentas bancarias en Configuración > Pagos y anticipo.'
        : 'No se pudo autorizar el pago. Verifica la disponibilidad.', 'error');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Motivo del rechazo que recibirá el huésped:');
    if (!reason) return;
    try {
      const result = await apiService.rejectReservation(id, reason.trim());
      showSnackbar(
        result.notificationSent
          ? 'Solicitud rechazada y huésped notificado'
          : 'Solicitud rechazada; la notificación quedó pendiente',
        result.notificationSent ? 'success' : 'warning'
      );
      fetchReservations();
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      showSnackbar('No se pudo rechazar la solicitud', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta reserva?')) {
      try {
        await apiService.deleteReservation(id);
        showSnackbar('Reserva eliminada exitosamente', 'success');
        fetchReservations();
      } catch (error) {
        console.error('Error deleting reservation:', error);
        showSnackbar('Error al eliminar la reserva', 'error');
      }
    }
  };

  /**
   * 📊 Exportar a CSV
   */
  const handleExportCSV = () => {
    if (filteredReservations.length === 0) {
      showSnackbar('No hay datos para exportar', 'warning');
      return;
    }

    const csvData = filteredReservations.map(reservation => ({
      'ID': reservation.reservation_id,
      'Usuario': reservation.user_name || `Usuario ${reservation.user_id}`,
      'Teléfono': reservation.phone_number || '',
      'Cabaña': reservation.cabin_name || `Cabaña ${reservation.cabin_id}`,
      'Personas': reservation.personas,
      'Fecha Inicio': formatDate(reservation.start_date),
      'Fecha Fin': formatDate(reservation.end_date),
      'Estado': reservation.status,
      'Precio': formatCurrency(reservation.total_price)
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSnackbar(`Archivo CSV exportado con ${csvData.length} reservas`, 'success');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada': return 'success';
      case 'pendiente_autorizacion': return 'warning';
      case 'esperando_pago': return 'info';
      case 'pendiente_verificacion': return 'secondary';
      case 'cancelada': return 'error';
      case 'rechazada': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => ({
    pendiente_autorizacion: 'ESPERA AUTORIZACIÓN',
    esperando_pago: 'PAGO AUTORIZADO',
    pendiente_verificacion: 'REVISAR COMPROBANTE',
    confirmada: 'CONFIRMADA', cancelada: 'CANCELADA', rechazada: 'RECHAZADA'
  }[status] || String(status || '').toUpperCase());

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    const number = new Intl.NumberFormat('es-HN', {
      minimumFractionDigits: 0,
    }).format(amount);
    return `L. ${number}`;
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Paginación
  const paginatedReservations = filteredReservations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && reservations.length === 0) {
    return (
      <DashboardLayout title="🏨 Reservas Profesional">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="🏨 Reservas Profesional">
      <Box sx={{ mb: 3 }}>
        {/* 🎯 Header Profesional */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              🏨 SISTEMA PROFESIONAL DE RESERVAS
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Interfaz avanzada con filtros, búsqueda y exportación
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              disabled={filteredReservations.length === 0}
              sx={{ minWidth: 140 }}
            >
              Exportar CSV ({filteredReservations.length})
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/reservation-create')}
              sx={{ fontWeight: 600, minWidth: 150 }}
            >
              Nueva Reserva
            </Button>
          </Box>
        </Box>

        {/* ⚠️ Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 🎛️ Panel de Control */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: '16px !important' }}>
            {/* 📊 Pestañas con Contadores */}
            <Tabs 
              value={currentTab} 
              onChange={(e, newValue) => {
                setCurrentTab(newValue);
                setPage(0);
              }}
              sx={{ mb: 3 }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 18 }} />
                    <span>Próximas</span>
                    <Badge badgeContent={counts.upcoming} color="primary" max={999} />
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 18 }} />
                    <span>Pasadas</span>
                    <Badge badgeContent={counts.past} color="secondary" max={999} />
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 18 }} />
                    <span>Pendientes</span>
                    <Badge badgeContent={counts.pending} color="warning" max={999} />
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Home sx={{ fontSize: 18 }} />
                    <span>Todas</span>
                    <Badge badgeContent={counts.total} color="info" max={999} />
                  </Box>
                }
              />
            </Tabs>

            {/* 🔍 Barra de Búsqueda y Filtros */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Buscar por usuario, teléfono, cabaña o ID..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, minWidth: 300, maxWidth: 500 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ minWidth: 120 }}
              >
                Filtros {showFilters ? 'Menos' : 'Más'}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {filteredReservations.length} de {reservations.length} reservas
              </Typography>
            </Box>

            {/* 🔧 Filtros Avanzados Colapsables */}
            <Collapse in={showFilters}>
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Estado</InputLabel>
                      <Select
                        value={filters.status}
                        label="Estado"
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="pendiente_autorizacion">Espera autorización</MenuItem>
                        <MenuItem value="esperando_pago">Pago autorizado</MenuItem>
                        <MenuItem value="pendiente_verificacion">Revisar comprobante</MenuItem>
                        <MenuItem value="confirmada">Confirmada</MenuItem>
                        <MenuItem value="cancelada">Cancelada</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Cabaña"
                      placeholder="Nombre o ID"
                      value={filters.cabin}
                      onChange={(e) => setFilters(prev => ({ ...prev, cabin: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Desde"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Hasta"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Min. Personas"
                      type="number"
                      inputProps={{ min: 1, max: 20 }}
                      value={filters.guests}
                      onChange={(e) => setFilters(prev => ({ ...prev, guests: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setFilters({
                          status: '',
                          cabin: '',
                          dateFrom: '',
                          dateTo: '',
                          guests: ''
                        });
                        setSearchTerm('');
                      }}
                    >
                      Limpiar Todo
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* 📋 Tabla Profesional de Reservas */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando reservas...</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Usuario</strong></TableCell>
                      <TableCell><strong>Teléfono</strong></TableCell>
                      <TableCell><strong>Cabaña</strong></TableCell>
                      <TableCell><strong>Personas</strong></TableCell>
                      <TableCell><strong>Fecha Inicio</strong></TableCell>
                      <TableCell><strong>Fecha Fin</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Precio</strong></TableCell>
                      <TableCell><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedReservations.length > 0 ? (
                      paginatedReservations.map((reservation) => (
                        <TableRow 
                          key={reservation.reservation_id}
                          sx={{ 
                            '&:hover': { backgroundColor: 'action.hover' },
                            '&:nth-of-type(odd)': { backgroundColor: 'rgba(0,0,0,0.02)' }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              #{reservation.reservation_id}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {reservation.confirmation_code || `VJ-${String(reservation.reservation_id).padStart(6, '0')}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                                {(reservation.user_name || `U${reservation.user_id}`).charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {reservation.user_name || `Usuario ${reservation.user_id}`}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {reservation.user_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {reservation.phone_number || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Home sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {reservation.cabin_name || `Cabaña ${reservation.cabin_id}`}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {reservation.cabin_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {reservation.personas}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(reservation.start_date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(reservation.end_date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(reservation.status)}
                              color={getStatusColor(reservation.status)}
                              size="small"
                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocalAtm sx={{ fontSize: 16, color: 'success.main' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                {formatCurrency(reservation.total_price)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {reservation.status === 'pendiente_autorizacion' && (
                                <Tooltip title="Autorizar pago y notificar al huésped">
                                  <IconButton size="small" onClick={() => handleAuthorizePayment(reservation.reservation_id)} sx={{ color: 'info.main' }}>
                                    <LocalAtm fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {reservation.status === 'pendiente_verificacion' && (
                                <Tooltip title="Confirmar después de revisar el comprobante">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleConfirm(reservation.reservation_id)}
                                    sx={{ 
                                      color: 'success.main',
                                      '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                                    }}
                                  >
                                    <CheckIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {REJECTABLE_STATUSES.has(reservation.status) && (
                                <Tooltip title="Rechazar y notificar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleReject(reservation.reservation_id)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <RejectIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {reservation.comprobante_nombre_archivo && (
                                <Tooltip title="Abrir comprobante">
                                  <IconButton
                                    size="small"
                                    component="a"
                                    href={`${process.env.REACT_APP_API_URL}${reservation.comprobante_nombre_archivo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: 'info.main' }}
                                  >
                                    <ReceiptIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Editar reserva">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(reservation)}
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar reserva">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(reservation.reservation_id)}
                                  sx={{ 
                                    color: 'error.main',
                                    '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No se encontraron reservas
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Prueba ajustando los filtros o crear una nueva reserva
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {/* 📄 Paginación Profesional */}
            {filteredReservations.length > 0 && (
              <TablePagination
                component="div"
                count={filteredReservations.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 15, 20, 50]}
                labelRowsPerPage="Registros por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`} registros`
                }
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  '& .MuiTablePagination-toolbar': {
                    paddingLeft: 2,
                    paddingRight: 2,
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      </Box>

      {/* 📝 Dialog para Crear/Editar Reserva */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingReservation ? '✏️ Editar Reserva' : '➕ Nueva Reserva'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID de Cabaña"
                value={formData.cabin_id}
                onChange={(e) => setFormData(prev => ({ ...prev, cabin_id: e.target.value }))}
                required
                helperText="Ingrese el ID numérico de la cabaña"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID de Usuario"
                value={formData.user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                required
                helperText="Ingrese el ID numérico del usuario"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Inicio"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Fin"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado"
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="pendiente_autorizacion">🟡 Espera autorización</MenuItem>
                  <MenuItem value="esperando_pago">🔵 Pago autorizado</MenuItem>
                  <MenuItem value="pendiente_verificacion">🟣 Revisar comprobante</MenuItem>
                  <MenuItem value="confirmada">🟢 Confirmada</MenuItem>
                  <MenuItem value="cancelada">🔴 Cancelada</MenuItem>
                  <MenuItem value="rechazada">🔴 Rechazada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Personas"
                type="number"
                inputProps={{ min: 1, max: 20 }}
                value={formData.personas}
                onChange={(e) => setFormData(prev => ({ ...prev, personas: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Precio Total"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.total_price}
                onChange={(e) => setFormData(prev => ({ ...prev, total_price: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">L.</InputAdornment>,
                }}
                required
                helperText="Precio total en Lempiras (HNL)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.cabin_id || !formData.user_id || !formData.start_date || !formData.end_date}
            sx={{ minWidth: 120 }}
          >
            {editingReservation ? 'Actualizar' : 'Crear Reserva'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔔 Snackbar para Notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default ReservationsPageSimplePro;
