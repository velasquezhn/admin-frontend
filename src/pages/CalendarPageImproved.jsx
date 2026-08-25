import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Autocomplete,
  TextField
} from '@mui/material';
import { 
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Today,
  FilterList,
  Info,
  Home,
  People,
  Phone,
  CalendarToday,
  CheckCircle,
  Schedule,
  Cancel,
  Settings,
  ViewWeek,
  ViewModule
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

// Utilidades para fechas
const getMonthDays = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month - 1, 1).getDay();
};

const getMonthName = (month) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1];
};

const getDayName = (dayIndex) => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[dayIndex];
};

const CalendarPageImproved = () => {
  // Estados principales
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [cabanas, setCabanas] = useState([]);
  const [ocupacion, setOcupacion] = useState({});
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [filters, setFilters] = useState({
    tipoCabana: '',
    estado: '',
    capacidad: ''
  });
  const [filteredCabanas, setFilteredCabanas] = useState([]);

  // Estados para UI
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'table'
  const [showWeekends, setShowWeekends] = useState(true);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  
  // Estados para detalle de reserva
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Cargar datos cuando cambia el mes/año
  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters();
  }, [cabanas, filters]);

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DEBUG] Fetching calendar data for year:', year, 'month:', month);
      const response = await apiService.getCalendarOccupancy(year, month);
      console.log('[DEBUG] Calendar response received:', response);
      
      // Access data from the response structure
      const data = response.data || response;
      console.log('[DEBUG] Extracted data:', data);
      
      setCabanas(data.cabanas || []);
      
      // Convertir ocupación a formato esperado
      const ocupacionMap = {};
      const reservasData = [];
      
      if (data.ocupacion) {
        Object.keys(data.ocupacion).forEach(cabinId => {
          const dates = data.ocupacion[cabinId];
          Object.keys(dates).forEach(fecha => {
            const key = `${cabinId}-${fecha}`;
            ocupacionMap[key] = dates[fecha];
            
            // Si hay una reserva, crear objeto de reserva
            if (dates[fecha] !== 'libre') {
              reservasData.push({
                id: `${cabinId}-${fecha}`,
                cabanaId: cabinId,
                fecha: fecha,
                estado: dates[fecha],
                cabana: data.cabanas.find(c => c.id === parseInt(cabinId))?.nombre || 'Cabaña desconocida'
              });
            }
          });
        });
      }
      
      setOcupacion(ocupacionMap);
      setReservas(reservasData);
      
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError('Error al cargar datos del calendario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('[DEBUG] Aplicando filtros:', filters);
    console.log('[DEBUG] Cabañas disponibles:', cabanas);
    console.log('[DEBUG] Reservas disponibles:', reservas);
    
    let filtered = [...cabanas];
    
    // Filtro por tipo de cabaña
    if (filters.tipoCabana) {
      filtered = filtered.filter(cabana => {
        const tipoCabana = getCabinType(cabana.nombre);
        // Comparación exacta como en /cabins, pero manteniendo case-insensitive
        const tipoFiltro = filters.tipoCabana.toLowerCase();
        const tipoCabanaLower = tipoCabana.toLowerCase();
        
        const coincide = tipoCabanaLower === tipoFiltro;
        console.log(`[DEBUG] Cabaña "${cabana.nombre}": tipo detectado "${tipoCabana}", filtro "${filters.tipoCabana}", coincide: ${coincide}`);
        return coincide;
      });
    }
    
    // Filtro por estado de reservas
    if (filters.estado) {
      filtered = filtered.filter(cabana => {
        // Verificar si la cabaña tiene reservas en el estado seleccionado
        const tieneReservaConEstado = reservas.some(reserva => {
          const coincideId = reserva.cabanaId === cabana.id || reserva.cabanaId === cabana.id.toString();
          const coincideEstado = reserva.estado && reserva.estado.toLowerCase() === filters.estado.toLowerCase();
          return coincideId && coincideEstado;
        });
        
        // También verificar si hay ocupación directa en el estado seleccionado
        const tieneOcupacionConEstado = ocupacion && Object.keys(ocupacion).some(key => {
          const [cabinId] = key.split('-');
          const estadoOcupacion = ocupacion[key];
          const coincideId = cabinId === cabana.id.toString();
          const coincideEstado = estadoOcupacion && estadoOcupacion.toLowerCase() === filters.estado.toLowerCase();
          return coincideId && coincideEstado;
        });
        
        console.log(`[DEBUG] Cabaña ${cabana.nombre}: tiene reserva con estado ${filters.estado}: ${tieneReservaConEstado || tieneOcupacionConEstado}`);
        return tieneReservaConEstado || tieneOcupacionConEstado;
      });
    }
    
    // Filtro por capacidad
    if (filters.capacidad) {
      filtered = filtered.filter(cabana => {
        const capacidadCabana = parseInt(cabana.capacidad) || 0;
        const capacidadMinima = parseInt(filters.capacidad);
        const cumpleCapacidad = capacidadCabana >= capacidadMinima;
        console.log(`[DEBUG] Cabaña ${cabana.nombre}: capacidad ${capacidadCabana}, mínima ${capacidadMinima}, cumple: ${cumpleCapacidad}`);
        return cumpleCapacidad;
      });
    }
    
    console.log('[DEBUG] Cabañas filtradas:', filtered);
    setFilteredCabanas(filtered);
  };

  const getCabinType = (nombre) => {
    if (!nombre) return 'otro';
    
    const nombreLower = nombre.toLowerCase();
    
    // Verificar cada tipo de cabaña - usando formato minúsculas sin acentos como en /cabins
    if (nombreLower.includes('tortuga')) return 'tortuga';
    if (nombreLower.includes('delfin') || nombreLower.includes('delfín')) return 'delfin';
    if (nombreLower.includes('tiburon') || nombreLower.includes('tiburón')) return 'tiburon';
    if (nombreLower.includes('caracol')) return 'caracol';
    
    // Intentar con patrones más específicos usando regex
    const patterns = [
      { pattern: /tortuga/i, type: 'tortuga' },
      { pattern: /delfín?/i, type: 'delfin' },
      { pattern: /tiburón?/i, type: 'tiburon' },
      { pattern: /caracol/i, type: 'caracol' }
    ];
    
    for (const { pattern, type } of patterns) {
      if (pattern.test(nombre)) {
        return type;
      }
    }
    
    return 'otro';
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (month === 1) {
        setMonth(12);
        setYear(y => y - 1);
      } else {
        setMonth(m => m - 1);
      }
    } else {
      if (month === 12) {
        setMonth(1);
        setYear(y => y + 1);
      } else {
        setMonth(m => m + 1);
      }
    }
  };

  const goToToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado': return '#e74c3c';
      case 'pendiente': return '#f39c12';
      case 'cancelada': return '#95a5a6';
      default: return '#2ecc71';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'pendiente': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      default: return 'Libre';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado': return <CheckCircle />;
      case 'pendiente': return <Schedule />;
      case 'cancelada': return <Cancel />;
      default: return null;
    }
  };

  const handleCellClick = (cabana, fecha) => {
    const key = `${cabana.id}-${fecha}`;
    const estado = ocupacion[key] || 'libre';
    
    if (estado !== 'libre') {
      const reserva = reservas.find(r => r.id === key);
      if (reserva) {
        setSelectedReservation({
          ...reserva,
          cabana: cabana.nombre,
          capacidad: cabana.capacidad,
          descripcion: cabana.descripcion,
          fecha: fecha
        });
        setDetailDialogOpen(true);
      }
    }
  };

  const renderGridView = () => {
    const daysInMonth = getMonthDays(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;
    
    return (
      <Grid container spacing={2}>
        {filteredCabanas.map(cabana => (
          <Grid item xs={12} md={6} lg={4} key={cabana.id}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              '&:hover': { 
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {cabana.nombre}
                    </Typography>
                    <Chip 
                      label={getCabinType(cabana.nombre)} 
                      color="primary" 
                      size="small" 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      <People sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {cabana.capacidad} personas
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <Home />
                  </Avatar>
                </Box>
                
                {/* Mini calendario para esta cabaña */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Ocupación del mes
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)', 
                    gap: 0.5,
                    mb: 1
                  }}>
                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
                      <Typography 
                        key={day} 
                        variant="caption" 
                        sx={{ 
                          textAlign: 'center', 
                          fontWeight: 600,
                          color: 'text.secondary',
                          fontSize: '0.7rem'
                        }}
                      >
                        {day}
                      </Typography>
                    ))}
                  </Box>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)', 
                    gap: 0.5
                  }}>
                    {Array.from({ length: firstDay }, (_, i) => (
                      <Box key={`empty-${i}`} sx={{ height: 24 }} />
                    ))}
                    
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const fecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const key = `${cabana.id}-${fecha}`;
                      const estado = ocupacion[key] || 'libre';
                      
                      return (
                        <Tooltip 
                          key={day}
                          title={`${day}/${month}: ${getStatusText(estado)}`}
                          arrow
                        >
                          <Box
                            onClick={() => handleCellClick(cabana, fecha)}
                            sx={{
                              height: 24,
                              borderRadius: 1,
                              backgroundColor: estado === 'libre' ? 'grey.100' : getStatusColor(estado),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: estado !== 'libre' ? 'pointer' : 'default',
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              color: estado === 'libre' ? 'text.secondary' : 'white',
                              '&:hover': {
                                opacity: estado !== 'libre' ? 0.8 : 1,
                                transform: estado !== 'libre' ? 'scale(1.1)' : 'none'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {day}
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTableView = () => {
    const daysInMonth = getMonthDays(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header con días de la semana */}
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Cabañas
                </Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: 1
                }}>
                  {Array.from({ length: 7 }, (_, i) => (
                    <Typography 
                      key={i}
                      variant="subtitle2" 
                      sx={{ 
                        textAlign: 'center', 
                        fontWeight: 600,
                        color: i === 0 || i === 6 ? 'error.main' : 'text.primary'
                      }}
                    >
                      {getDayName(i)}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Calendario con días numerados */}
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: 1,
              mb: 2
            }}>
              {/* Días vacíos al inicio del mes */}
              {Array.from({ length: firstDay }, (_, i) => (
                <Box key={`empty-${i}`} sx={{ height: 40 }} />
              ))}
              
              {/* Días del mes */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                return (
                  <Box
                    key={day}
                    sx={{
                      height: 40,
                      borderRadius: 2,
                      backgroundColor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    {day}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Tabla de ocupación por cabañas */}
          <Box>
            {filteredCabanas.map((cabana, index) => (
              <Box key={cabana.id} sx={{ 
                borderBottom: index < filteredCabanas.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider'
              }}>
                <Grid container spacing={2} alignItems="center" sx={{ p: 3 }}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <Home />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {cabana.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cabana.capacidad} personas • {getCabinType(cabana.nombre)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={9}>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(7, 1fr)', 
                      gap: 1
                    }}>
                      {/* Días vacíos al inicio del mes */}
                      {Array.from({ length: firstDay }, (_, i) => (
                        <Box key={`empty-${i}`} sx={{ height: 40 }} />
                      ))}
                      
                      {/* Días del mes con estados de ocupación */}
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const fecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const key = `${cabana.id}-${fecha}`;
                        const estado = ocupacion[key] || 'libre';
                        
                        return (
                          <Tooltip 
                            key={day}
                            title={`${cabana.nombre} - ${day}/${month}/${year}: ${getStatusText(estado)}`}
                            arrow
                          >
                            <Box
                              onClick={() => handleCellClick(cabana, fecha)}
                              sx={{
                                height: 40,
                                borderRadius: 2,
                                backgroundColor: estado === 'libre' ? 'grey.100' : getStatusColor(estado),
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: estado !== 'libre' ? 'pointer' : 'default',
                                color: estado === 'libre' ? 'text.secondary' : 'white',
                                border: '1px solid',
                                borderColor: estado === 'libre' ? 'grey.300' : 'transparent',
                                '&:hover': {
                                  opacity: estado !== 'libre' ? 0.8 : 1,
                                  transform: estado !== 'libre' ? 'scale(1.05)' : 'none',
                                  boxShadow: estado !== 'libre' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {day}
                              </Typography>
                              {estado !== 'libre' && (
                                <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                                  {estado.charAt(0).toUpperCase()}
                                </Typography>
                              )}
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const ReservationDetailDialog = () => (
    <Dialog 
      open={detailDialogOpen} 
      onClose={() => setDetailDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        {getStatusIcon(selectedReservation?.estado)}
        Detalles de la Reserva
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {selectedReservation && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedReservation.cabana}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<People />}
                      label={`${selectedReservation.capacidad} personas`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip 
                      label={getCabinType(selectedReservation.cabana)}
                      color="primary"
                      size="small"
                    />
                    <Chip 
                      icon={getStatusIcon(selectedReservation.estado)}
                      label={getStatusText(selectedReservation.estado)}
                      color={
                        selectedReservation.estado === 'confirmado' ? 'success' :
                        selectedReservation.estado === 'pendiente' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Fecha de la reserva"
                      secondary={new Date(selectedReservation.fecha).toLocaleDateString('es-HN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Home />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Descripción de la cabaña"
                      secondary={selectedReservation.descripcion || 'Sin descripción disponible'}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => setDetailDialogOpen(false)}>
          Cerrar
        </Button>
        <Button variant="contained" startIcon={<Settings />}>
          Gestionar Reserva
        </Button>
      </DialogActions>
    </Dialog>
  );

  const FilterPanel = () => (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtros y Vista
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Vista de cuadrícula">
              <IconButton 
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista de tabla">
              <IconButton 
                onClick={() => setViewMode('table')}
                color={viewMode === 'table' ? 'primary' : 'default'}
              >
                <ViewWeek />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Cabaña</InputLabel>
              <Select
                value={filters.tipoCabana}
                label="Tipo de Cabaña"
                onChange={(e) => setFilters(prev => ({ ...prev, tipoCabana: e.target.value }))}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="tortuga">Tortuga</MenuItem>
                <MenuItem value="delfin">Delfín</MenuItem>
                <MenuItem value="tiburon">Tiburón</MenuItem>
                <MenuItem value="caracol">Caracol</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.estado}
                label="Estado"
                onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="confirmada">Confirmada</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="libre">Libre</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Capacidad mínima"
              value={filters.capacidad}
              onChange={(e) => setFilters(prev => ({ ...prev, capacidad: e.target.value }))}
              inputProps={{ min: 1, max: 20 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setFilters({
                  tipoCabana: '',
                  estado: '',
                  capacidad: ''
                });
              }}
              sx={{ height: 40 }}
            >
              Limpiar Filtros
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={showWeekends}
                  onChange={(e) => setShowWeekends(e.target.checked)}
                />
              }
              label="Mostrar fines de semana"
            />
          </Grid>
        </Grid>
        
        {/* Indicador de filtros aplicados */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {filteredCabanas.length} de {cabanas.length} cabañas
            {(filters.tipoCabana || filters.estado || filters.capacidad) && (
              <span> (filtros aplicados)</span>
            )}
          </Typography>
        </Box>
        
        {/* Estadísticas rápidas */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {filteredCabanas.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cabañas mostradas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {reservas.filter(r => r.estado === 'confirmado').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reservas confirmadas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {reservas.filter(r => r.estado === 'pendiente').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reservas pendientes
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {reservas.filter(r => r.estado === 'cancelada').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reservas canceladas
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );

  const Legend = () => (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Leyenda
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<CheckCircle />}
            label="Confirmado" 
            sx={{ backgroundColor: '#e74c3c', color: 'white' }}
            size="small"
          />
          <Chip 
            icon={<Schedule />}
            label="Pendiente" 
            sx={{ backgroundColor: '#f39c12', color: 'white' }}
            size="small"
          />
          <Chip 
            icon={<Cancel />}
            label="Cancelada" 
            sx={{ backgroundColor: '#95a5a6', color: 'white' }}
            size="small"
          />
          <Chip 
            label="Libre" 
            sx={{ backgroundColor: '#2ecc71', color: 'white' }}
            size="small"
          />
        </Box>
        
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 2 }}>
          <Typography variant="body2" color="info.contrastText">
            💡 <strong>Tip:</strong> Haz clic en las celdas con reservas para ver más detalles.
            Usa los filtros para encontrar cabañas específicas o estados de reserva.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Calendario de Ocupación Mejorado">
      <Box>
        {/* Header con navegación */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Calendario de Ocupación
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestiona y visualiza las reservas de todas las cabañas
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBeforeIcon />}
                  onClick={() => navigateMonth('prev')}
                  sx={{ borderRadius: 2 }}
                >
                  Anterior
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Today />}
                  onClick={goToToday}
                  sx={{ borderRadius: 2 }}
                >
                  Hoy
                </Button>
                
                <Typography variant="h5" sx={{ 
                  minWidth: 200, 
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'primary.main'
                }}>
                  {getMonthName(month)} {year}
                </Typography>
                
                <Button
                  variant="outlined"
                  endIcon={<NavigateNextIcon />}
                  onClick={() => navigateMonth('next')}
                  sx={{ borderRadius: 2 }}
                >
                  Siguiente
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Filtros */}
        <FilterPanel />

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Contenido principal */}
            <Box sx={{ mb: 3 }}>
              {viewMode === 'grid' ? renderGridView() : renderTableView()}
            </Box>

            {/* Leyenda */}
            <Legend />
          </>
        )}

        {/* Dialog de detalles */}
        <ReservationDetailDialog />
      </Box>
    </DashboardLayout>
  );
};

export default CalendarPageImproved;
