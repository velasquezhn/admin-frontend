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
  Alert
} from '@mui/material';
import { 
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

function getMonthDays(year, month) {
  return new Date(year, month, 0).getDate();
}

function getMonthName(month) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1];
}

const CalendarPageSimple = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [cabanas, setCabanas] = useState([]);
  const [ocupacion, setOcupacion] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

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
      
      // Backend returns ocupacion as { cabin_id: { date: status } }
      // Convert to the format expected by frontend
      const ocupacionMap = {};
      if (data.ocupacion) {
        Object.keys(data.ocupacion).forEach(cabinId => {
          const dates = data.ocupacion[cabinId];
          Object.keys(dates).forEach(fecha => {
            const key = `${cabinId}-${fecha}`;
            ocupacionMap[key] = dates[fecha];
          });
        });
      }
      setOcupacion(ocupacionMap);
      console.log('[DEBUG] Processed ocupacion:', ocupacionMap);
      
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError('Error al cargar datos del calendario: ' + err.message);
    } finally {
      setLoading(false);
    }
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

  const days = Array.from({ length: getMonthDays(year, month) }, (_, i) => i + 1);

  return (
    <DashboardLayout title="Calendario de Ocupación">
      <Card>
        <CardContent>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">
              Calendario de Ocupación de Cabañas
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<NavigateBeforeIcon />}
                onClick={() => navigateMonth('prev')}
              >
                Anterior
              </Button>
              <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
                {getMonthName(month)} {year}
              </Typography>
              <Button
                variant="outlined"
                endIcon={<NavigateNextIcon />}
                onClick={() => navigateMonth('next')}
              >
                Siguiente
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ overflowX: 'auto', mb: 3 }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 800 }}>
                  <thead>
                    <tr>
                      <th style={{ 
                        background: '#1976d2', 
                        color: '#fff', 
                        padding: '12px 8px',
                        position: 'sticky',
                        left: 0,
                        zIndex: 1
                      }}>
                        Cabaña
                      </th>
                      {days.map(d => (
                        <th key={d} style={{ 
                          background: '#f5f5f5', 
                          padding: '8px 4px',
                          fontSize: '14px',
                          minWidth: '30px'
                        }}>
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cabanas.map(cabana => (
                      <tr key={cabana.id}>
                        <td style={{ 
                          fontWeight: 600, 
                          background: '#f5f5f5', 
                          padding: '12px 8px',
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          borderRight: '2px solid #ddd'
                        }}>
                          <div>
                            <div>{cabana.nombre}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {cabana.capacidad} personas
                            </div>
                          </div>
                        </td>
                        {days.map(d => {
                          const fecha = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const key = `${cabana.id}-${fecha}`;
                          const estado = ocupacion[key] || 'libre';
                          return (
                            <td 
                              key={fecha} 
                              style={{ 
                                background: getStatusColor(estado) + '20',
                                textAlign: 'center', 
                                padding: '4px',
                                fontSize: '11px',
                                border: '1px solid #eee',
                                minWidth: '30px'
                              }}
                              title={`${cabana.nombre} - ${d}/${month}/${year}: ${getStatusText(estado)}`}
                            >
                              {estado !== 'libre' && (
                                <div style={{ 
                                  background: getStatusColor(estado),
                                  color: 'white',
                                  borderRadius: '2px',
                                  padding: '1px 2px',
                                  fontSize: '9px'
                                }}>
                                  {estado.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Leyenda:</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label="Libre" 
                      sx={{ backgroundColor: '#2ecc71', color: 'white' }}
                      size="small"
                    />
                    <Chip 
                      label="Confirmado" 
                      sx={{ backgroundColor: '#e74c3c', color: 'white' }}
                      size="small"
                    />
                    <Chip 
                      label="Pendiente" 
                      sx={{ backgroundColor: '#f39c12', color: 'white' }}
                      size="small"
                    />
                    <Chip 
                      label="Cancelada" 
                      sx={{ backgroundColor: '#95a5a6', color: 'white' }}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  📊 Resumen: {cabanas.length} cabañas disponibles en el sistema.
                  Los colores indican el estado de ocupación para cada día del mes.
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default CalendarPageSimple;
