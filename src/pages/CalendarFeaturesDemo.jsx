import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  CheckCircle,
  CalendarToday,
  ViewModule,
  FilterList,
  Phone,
  Info,
  TrendingUp,
  Star,
  TouchApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CalendarFeaturesDemo = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <CalendarToday color="primary" />,
      title: 'Días de la Semana Visibles',
      description: 'Lun, Mar, Mié, Jue, Vie, Sáb, Dom claramente mostrados'
    },
    {
      icon: <ViewModule color="success" />,
      title: 'Dos Modos de Vista',
      description: 'Vista de cuadrícula y vista de tabla intercambiables'
    },
    {
      icon: <FilterList color="warning" />,
      title: 'Filtros Avanzados',
      description: 'Por tipo de cabaña, estado, capacidad y fines de semana'
    },
    {
      icon: <TouchApp color="info" />,
      title: 'Interactividad Mejorada',
      description: 'Tooltips informativos y modales de detalle'
    },
    {
      icon: <TrendingUp color="error" />,
      title: 'Estadísticas en Tiempo Real',
      description: 'Contador de reservas confirmadas, pendientes y canceladas'
    },
    {
      icon: <Phone color="secondary" />,
      title: 'Diseño Responsive',
      description: 'Adaptado para desktop, tablet y móviles'
    }
  ];

  const statusColors = [
    { label: 'Confirmado', color: '#e74c3c', icon: <CheckCircle /> },
    { label: 'Pendiente', color: '#f39c12', icon: <Info /> },
    { label: 'Cancelada', color: '#95a5a6', icon: <Info /> },
    { label: 'Libre', color: '#2ecc71', icon: <CheckCircle /> }
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Card sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' }}>
        <CardContent sx={{ p: 4, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Star sx={{ fontSize: 40 }} />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Calendario Mejorado
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Nueva experiencia de gestión de ocupación para Villas Julie
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/calendar-improved')}
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            Ver Calendario Mejorado
          </Button>
        </CardContent>
      </Card>

      {/* Características principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', borderRadius: 2, '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {feature.icon}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Paleta de colores */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Paleta de Estados
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {statusColors.map((status, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        backgroundColor: status.color
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {status.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Instrucciones rápidas */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Cómo Usar
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hover sobre celdas"
                    secondary="Para ver información rápida"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Click en reservas"
                    secondary="Para abrir detalles completos"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Usar filtros"
                    secondary="Para encontrar cabañas específicas"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Cambiar vista"
                    secondary="Entre cuadrícula y tabla"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Llamada a la acción */}
      <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
        <AlertTitle>¡Prueba el Calendario Mejorado!</AlertTitle>
        El nuevo calendario incluye todas las mejoras solicitadas: días de la semana visibles, 
        diseño moderno, información detallada, navegación intuitiva y filtros avanzados.
      </Alert>
    </Box>
  );
};

export default CalendarFeaturesDemo;
