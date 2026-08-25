import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  InputAdornment,
  Badge,
  Tooltip,
  Fab,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Timeline as TimelineIcon,
  Check as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

const ReservationsAdvanced = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [currentTab, setCurrentTab] = useState(0); // 0: Próximas, 1: Pasadas, 2: Todas
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    cabin: '',
    dateFrom: '',
    dateTo: '',
    guests: ''
  });

  const [formData, setFormData] = useState({
    cabin_id: '',
    user_id: '',
    start_date: '',
    end_date: '',
    status: 'pendiente',
    total_price: '',
    personas: ''
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [reservations, currentTab, searchTerm, filters]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getReservations();
      const reservationsData = data.data || [];
      
      // Ordenar por fecha de inicio (más próximas primero)
      const sortedReservations = reservationsData.sort((a, b) => {
        const dateA = new Date(a.start_date);
        const dateB = new Date(b.start_date);
        return dateA - dateB;
      });
      
      setReservations(sortedReservations);
      setError(null);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...reservations];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filtrar por tab (próximas/pasadas/todas)
    if (currentTab === 0) {
      // Próximas reservas (fecha de inicio >= hoy)
      filtered = filtered.filter(r => new Date(r.start_date) >= today);
    } else if (currentTab === 1) {
      // Reservas pasadas (fecha de fin < hoy)
      filtered = filtered.filter(r => new Date(r.end_date) < today);
    }
    // currentTab === 2 significa "todas", no filtrar

    // Aplicar búsqueda por texto
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.user_name && r.user_name.toLowerCase().includes(search)) ||
        (r.cabin_name && r.cabin_name.toLowerCase().includes(search)) ||
        (r.phone_number && r.phone_number.includes(search)) ||
        (r.reservation_id && r.reservation_id.toString().includes(search)) ||
        (r.status && r.status.toLowerCase().includes(search))
      );
    }

    // Aplicar filtros adicionales
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

    setFilteredReservations(filtered);
  };

  const getReservationCounts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = reservations.filter(r => new Date(r.start_date) >= today).length;
    const past = reservations.filter(r => new Date(r.end_date) < today).length;
    const total = reservations.length;

    return { upcoming, past, total };
  };

  const getUpcomingReservations = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return reservations.filter(r => {
      const startDate = new Date(r.start_date);
      return startDate >= today && startDate <= nextWeek;
    }).slice(0, 5);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      cabin: '',
      dateFrom: '',
      dateTo: '',
      guests: ''
    });
    setSearchTerm('');
  };

  const handleOpenDialog = (reservation = null) => {
    setEditingReservation(reservation);
    if (reservation) {
      setFormData({
        cabin_id: reservation.cabin_id || '',
        user_id: reservation.user_id || '',
        start_date: reservation.start_date || '',
        end_date: reservation.end_date || '',
        status: reservation.status || 'pendiente',
        total_price: reservation.total_price || '',
        personas: reservation.personas || ''
      });
    } else {
      setFormData({
        cabin_id: '',
        user_id: '',
        start_date: '',
        end_date: '',
        status: 'pendiente',
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
      const requestData = {
        cabin_id: formData.cabin_id,
        user_id: formData.user_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        total_price: formData.total_price,
        number_of_people: formData.personas
      };
      
      if (editingReservation) {
        await apiService.updateReservation(editingReservation.reservation_id, requestData);
      } else {
        await apiService.createReservation(requestData);
      }
      await fetchReservations();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving reservation:', err);
      setError('Error al guardar la reserva');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      try {
        await apiService.deleteReservation(id);
        await fetchReservations();
      } catch (err) {
        console.error('Error deleting reservation:', err);
        setError('Error al eliminar la reserva');
      }
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'confirmado': return 'success';
      case 'cancelada': return 'error';
      case 'pendiente': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'confirmado': return <CheckIcon fontSize="small" />;
      case 'cancelada': return <CancelIcon fontSize="small" />;
      case 'pendiente': return <PendingIcon fontSize="small" />;
      default: return <PendingIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-HN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `L ${parseFloat(amount).toLocaleString('es-HN')}`;
  };

  const getDaysUntil = (dateString) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays > 0) return `En ${diffDays} días`;
    return `Hace ${Math.abs(diffDays)} días`;
  };

  const counts = getReservationCounts();
  const upcomingWeek = getUpcomingReservations();

  return (
    <DashboardLayout title="Gestión Avanzada de Reservas">
      <Box sx={{ mb: 3 }}>
        {/* Header con estadísticas rápidas */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
            🇭🇳 Gestión de Reservas
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchReservations}
              disabled={loading}
              variant="outlined"
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#2e7d32' }}
            >
              Nueva Reserva
            </Button>
          </Box>
        </Box>

        {/* Tarjetas de resumen */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#1976d2', color: 'white' }}>
              <CalendarIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {counts.upcoming}
              </Typography>
              <Typography>Próximas Reservas</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#ed6c02', color: 'white' }}>
              <TimelineIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {counts.past}
              </Typography>
              <Typography>Reservas Pasadas</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#2e7d32', color: 'white' }}>
              <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {counts.total}
              </Typography>
              <Typography>Total Reservas</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#9c27b0', color: 'white' }}>
              <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {upcomingWeek.length}
              </Typography>
              <Typography>Esta Semana</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Próximas reservas importantes */}
        {upcomingWeek.length > 0 && (
          <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
                📅 Próximas Reservas (Esta Semana)
              </Typography>
              <List dense>
                {upcomingWeek.map(reservation => (
                  <ListItem key={reservation.reservation_id} sx={{ bgcolor: 'white', mb: 1, borderRadius: 1 }}>
                    <ListItemIcon>
                      {getStatusIcon(reservation.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${reservation.user_name || `Usuario ${reservation.user_id}`} - ${reservation.cabin_name || `Cabaña ${reservation.cabin_id}`}`}
                      secondary={`${formatDate(reservation.start_date)} • ${getDaysUntil(reservation.start_date)} • ${formatCurrency(reservation.total_price)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Controles de búsqueda y filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Buscar por nombre, cabaña, teléfono, ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300, flexGrow: 1 }}
              />
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                Filtros Avanzados
              </Button>
              {(searchTerm || Object.values(filters).some(f => f)) && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={clearFilters}
                >
                  Limpiar
                </Button>
              )}
            </Box>

            <Collapse in={showFilters}>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filters.status}
                      label="Estado"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="pendiente">Pendiente</MenuItem>
                      <MenuItem value="confirmado">Confirmado</MenuItem>
                      <MenuItem value="cancelada">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cabaña"
                    value={filters.cabin}
                    onChange={(e) => handleFilterChange('cabin', e.target.value)}
                    placeholder="Nombre o ID"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Desde"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
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
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Min. Huéspedes"
                    type="number"
                    value={filters.guests}
                    onChange={(e) => handleFilterChange('guests', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>
        </Card>

        {/* Tabs para categorizar reservas */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
              <Tab 
                label={
                  <Badge badgeContent={counts.upcoming} color="primary">
                    Próximas Reservas
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={counts.past} color="secondary">
                    Reservas Pasadas
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={counts.total} color="default">
                    Todas las Reservas
                  </Badge>
                } 
              />
            </Tabs>
          </Box>

          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredReservations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  {searchTerm || Object.values(filters).some(f => f) 
                    ? 'No se encontraron reservas con los filtros aplicados'
                    : 'No hay reservas en esta categoría'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {!searchTerm && !Object.values(filters).some(f => f) && 'Comienza agregando tu primera reserva'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Crear Nueva Reserva
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Usuario</strong></TableCell>
                      <TableCell><strong>Teléfono</strong></TableCell>
                      <TableCell><strong>Cabaña</strong></TableCell>
                      <TableCell><strong>Huéspedes</strong></TableCell>
                      <TableCell><strong>Check-in</strong></TableCell>
                      <TableCell><strong>Check-out</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Precio (L)</strong></TableCell>
                      <TableCell><strong>Tiempo</strong></TableCell>
                      <TableCell><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow 
                        key={reservation.reservation_id}
                        sx={{
                          '&:hover': { bgcolor: '#f5f5f5' },
                          bgcolor: new Date(reservation.start_date) <= new Date() && new Date(reservation.end_date) >= new Date() 
                            ? '#e8f5e8' : 'inherit' // Resaltar reservas activas
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            #{reservation.reservation_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {reservation.user_name || `Usuario ${reservation.user_id}`}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{reservation.phone_number || '-'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HomeIcon fontSize="small" color="action" />
                            {reservation.cabin_name || `Cabaña ${reservation.cabin_id}`}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" color="action" />
                            {reservation.personas}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(reservation.start_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(reservation.end_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(reservation.status)}
                            label={reservation.status}
                            color={getStatusColor(reservation.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                            {formatCurrency(reservation.total_price)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {getDaysUntil(reservation.start_date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(reservation)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(reservation.reservation_id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* FAB para nueva reserva */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
          {editingReservation ? '✏️ Editar Reserva' : '➕ Nueva Reserva'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID Cabaña"
                type="number"
                value={formData.cabin_id}
                onChange={(e) => setFormData({ ...formData, cabin_id: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID Usuario"
                type="number"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cantidad de Personas"
                type="number"
                value={formData.personas}
                onChange={(e) => setFormData({ ...formData, personas: e.target.value })}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio Total (Lempiras)"
                type="number"
                value={formData.total_price}
                onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">L</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha Check-in"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha Check-out"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado de la Reserva</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado de la Reserva"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="pendiente">🟡 Pendiente</MenuItem>
                  <MenuItem value="confirmado">🟢 Confirmado</MenuItem>
                  <MenuItem value="cancelada">🔴 Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#2e7d32' }}>
            {editingReservation ? 'Actualizar Reserva' : 'Crear Reserva'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default ReservationsAdvanced;
