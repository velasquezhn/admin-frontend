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
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  CalendarToday as ReservationIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

const UsersPageSimple = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    role: 'guest',
    is_active: true
  });

  // Estados para filtros
  const [filters, setFilters] = useState({
    estado: '',
    rol: '',
    busqueda: '',
    tieneReservas: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, reservationsData] = await Promise.all([
        apiService.getUsers(),
        apiService.getReservations()
      ]);
      
      const processedUsers = (usersData && Array.isArray(usersData)) ? usersData : (usersData && usersData.data ? usersData.data : []);
      const processedReservations = (reservationsData && Array.isArray(reservationsData)) ? reservationsData : (reservationsData && reservationsData.data ? reservationsData.data : []);
      
      // Actualizar estados de usuarios basado en reservas
      const updatedUsers = await updateUserStates(processedUsers, processedReservations);
      
      setUsers(updatedUsers);
      setReservations(processedReservations);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStates = async (usersList, reservationsList) => {
    const currentDate = new Date();
    
    return usersList.map(user => {
      // Buscar reservas del usuario
      const userReservations = reservationsList.filter(res => 
        res.user_id === user.user_id || res.user_id === user.user_id.toString()
      );
      
      if (userReservations.length === 0) {
        // Sin reservas = inactivo
        return { ...user, is_active: false, reservation_status: 'sin_reservas' };
      }
      
      // Verificar si tiene reservas activas o futuras
      const hasActiveReservations = userReservations.some(res => {
        const endDate = new Date(res.end_date);
        // Estados válidos en español e inglés
        const validStates = ['confirmado', 'confirmada', 'pendiente', 'pending', 'confirmed'];
        const isActiveStatus = validStates.includes((res.status || '').toLowerCase());
        const isFutureOrCurrent = endDate >= currentDate;
        
        return isActiveStatus && isFutureOrCurrent;
      });
      
      return {
        ...user,
        is_active: hasActiveReservations,
        reservation_status: hasActiveReservations ? 'con_reservas_activas' : 'reservas_vencidas',
        total_reservations: userReservations.length
      };
    });
  };

  const applyFilters = () => {
    let filtered = [...users];

    console.log('[DEBUG] Aplicando filtros de usuarios:', filters);
    console.log('[DEBUG] Total usuarios:', filtered.length);

    // Filtro por estado
    if (filters.estado) {
      filtered = filtered.filter(user => {
        const isActive = user.is_active;
        const matchesFilter = (filters.estado === 'activo') ? isActive : !isActive;
        console.log(`[DEBUG] Usuario ${user.name}: activo=${isActive}, filtro=${filters.estado}, coincide=${matchesFilter}`);
        return matchesFilter;
      });
    }

    // Filtro por rol
    if (filters.rol) {
      filtered = filtered.filter(user => {
        const userRole = (user.role || 'guest').toLowerCase();
        const filterRole = filters.rol.toLowerCase();
        return userRole === filterRole;
      });
    }

    // Filtro por búsqueda (nombre o teléfono)
    if (filters.busqueda) {
      const searchTerm = filters.busqueda.toLowerCase();
      filtered = filtered.filter(user => {
        const name = (user.name || '').toLowerCase();
        const phone = (user.phone_number || '').toLowerCase();
        return name.includes(searchTerm) || phone.includes(searchTerm);
      });
    }

    // Filtro por reservas
    if (filters.tieneReservas) {
      filtered = filtered.filter(user => {
        const hasReservations = user.total_reservations > 0;
        return (filters.tieneReservas === 'con_reservas') ? hasReservations : !hasReservations;
      });
    }

    console.log('[DEBUG] Usuarios filtrados:', filtered.length);
    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setFilters({
      estado: '',
      rol: '',
      busqueda: '',
      tieneReservas: ''
    });
  };

  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        name: user.name || '',
        phone_number: user.phone_number || '',
        role: user.role || 'guest',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    } else {
      setFormData({
        name: '',
        phone_number: '',
        role: 'guest',
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await apiService.updateUser(editingUser.user_id, formData);
      } else {
        await apiService.createUser(formData);
      }
      await fetchData(); // Cambié fetchUsers por fetchData
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Error al guardar el usuario');
    }
  };

  const handleUpdateUserStates = async () => {
    try {
      setLoading(true);
      // Llamar endpoint para actualizar estados automáticamente
      await apiService.updateUserStatesBasedOnReservations();
      await fetchData();
      setError(null);
    } catch (err) {
      console.error('Error updating user states:', err);
      setError('Error al actualizar estados de usuarios');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getInitials = (nombre) => {
    if (!nombre) return '?';
    return nombre.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout title="Gestión de Usuarios">
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Usuarios ({filteredUsers.length})
          </Typography>
          <Box>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Actualizar
            </Button>
            <Button
              startIcon={<ReservationIcon />}
              onClick={handleUpdateUserStates}
              sx={{ mr: 2 }}
              disabled={loading}
              variant="outlined"
            >
              Actualizar Estados
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Nuevo Usuario
            </Button>
          </Box>
        </Box>

        {/* Panel de Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Filtros</Typography>
              <Button
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{ ml: 'auto' }}
                size="small"
              >
                Limpiar Filtros
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filters.estado}
                    label="Estado"
                    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="activo">Activo</MenuItem>
                    <MenuItem value="inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={filters.rol}
                    label="Rol"
                    onChange={(e) => setFilters({ ...filters, rol: e.target.value })}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="guest">Guest</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Reservas</InputLabel>
                  <Select
                    value={filters.tieneReservas}
                    label="Reservas"
                    onChange={(e) => setFilters({ ...filters, tieneReservas: e.target.value })}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="con_reservas">Con Reservas</MenuItem>
                    <MenuItem value="sin_reservas">Sin Reservas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar"
                  placeholder="Nombre o teléfono..."
                  value={filters.busqueda}
                  onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {users.length === 0 ? 'No hay usuarios registrados' : 'No hay usuarios que coincidan con los filtros'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {users.length === 0 
                    ? 'Comienza agregando el primer usuario al sistema'
                    : 'Intenta ajustar los filtros para ver más resultados'
                  }
                </Typography>
                {users.length === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Crear Primer Usuario
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Usuario</strong></TableCell>
                      <TableCell><strong>Teléfono</strong></TableCell>
                      <TableCell><strong>Rol</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Reservas</strong></TableCell>
                      <TableCell><strong>Fecha Registro</strong></TableCell>
                      <TableCell><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>{user.user_id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {getInitials(user.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {user.name || 'Sin nombre'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{user.phone_number || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role || 'guest'}
                            size="small"
                            color={user.role === 'admin' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={user.is_active ? 'Activo' : 'Inactivo'}
                              size="small"
                              color={user.is_active ? 'success' : 'default'}
                            />
                            {user.reservation_status && (
                              <Tooltip title={
                                user.reservation_status === 'con_reservas_activas' ? 'Tiene reservas activas/futuras' :
                                user.reservation_status === 'reservas_vencidas' ? 'Solo tiene reservas vencidas' :
                                'Sin reservas'
                              }>
                                <Chip
                                  label={
                                    user.reservation_status === 'con_reservas_activas' ? 'Activas' :
                                    user.reservation_status === 'reservas_vencidas' ? 'Vencidas' :
                                    'Sin reservas'
                                  }
                                  size="small"
                                  variant="outlined"
                                  color={
                                    user.reservation_status === 'con_reservas_activas' ? 'info' :
                                    user.reservation_status === 'reservas_vencidas' ? 'warning' :
                                    'default'
                                  }
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.total_reservations || 0} reservas
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(user)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
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

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre Completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rol"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                helperText="Rol del usuario en el sistema (guest, admin, etc.)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Estado"
                select
                value={formData.is_active ? 'activo' : 'inactivo'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'activo' })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default UsersPageSimple;
