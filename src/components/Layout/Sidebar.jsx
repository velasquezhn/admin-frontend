import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EventNote as ReservationsIcon,
  People as UsersIcon,
  Home as CabinsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  SupervisorAccount as AdminIcon,
  LocalActivity as ActivitiesIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
    color: '#2563eb'
  },
  {
    text: 'Reservas',
    icon: <ReservationsIcon />,
    path: '/reservations',
    color: '#10b981',
    badge: 'Nuevo'
  },
  {
    text: 'Crear Reservación',
    icon: <ReservationsIcon />,
    path: '/reservation-create',
    color: '#10b981',
    badge: 'Formulario'
  },
  {
    text: 'Calendario',
    icon: <CalendarIcon />,
    path: '/calendar',
    color: '#f59e0b'
  },
  {
    text: 'Calendario Mejorado',
    icon: <CalendarIcon />,
    path: '/calendar-improved',
    color: '#f59e0b',
    badge: 'Nuevo'
  },
  {
    text: 'Usuarios',
    icon: <UsersIcon />,
    path: '/users',
    color: '#8b5cf6'
  },
  {
    text: 'Cabañas',
    icon: <CabinsIcon />,
    path: '/cabins',
    color: '#06b6d4'
  },
  {
    text: 'Tipos de Menú',
    icon: <CategoryIcon />,
    path: '/cabin-types',
    color: '#10b981',
    badge: 'WhatsApp'
  },
  {
    text: 'Actividades',
    icon: <ActivitiesIcon />,
    path: '/activities',
    color: '#f59e0b',
    badge: 'Nuevo'
  },
  {
    text: 'Administradores',
    icon: <AdminIcon />,
    path: '/admin-users',
    color: '#8b5cf6',
    badge: 'Admin'
  },
  {
    text: 'Reportes',
    icon: <TrendingUpIcon />,
    path: '/reports',
    color: '#ef4444'
  },
  {
    text: 'Configuración',
    icon: <SettingsIcon />,
    path: '/settings',
    color: '#6b7280'
  },
];

const Sidebar = ({ onClose, autoClose = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleNavigation = (path) => {
    navigate(path);
    // Solo cerrar si autoClose está habilitado (móvil)
    if (onClose && autoClose) {
      onClose();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Toolbar sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}
          >
            VJ
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Villas Julie
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Admin Panel
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, pt: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    bgcolor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    color: isActive ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(37, 99, 235, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'primary.main' : item.color,
                      minWidth: 40,
                      transition: 'color 0.2s ease-in-out',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.9rem'
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      color="primary"
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            p: 2,
            bgcolor: 'rgba(37, 99, 235, 0.05)',
            borderRadius: 2,
            border: '1px solid rgba(37, 99, 235, 0.1)'
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Sistema actualizado
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Versión 2.1.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
