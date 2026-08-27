import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';

const DashboardSimple = lazy(() => import('./pages/DashboardSimple_FIXED'));
const ReservationsPageSimplePro = lazy(() => import('./pages/ReservationsPageSimplePro'));
const ReservationsAdvanced = lazy(() => import('./pages/ReservationsAdvanced'));
const ReservationFormAdvanced = lazy(() => import('./pages/ReservationFormAdvanced'));
const UsersPageSimple = lazy(() => import('./pages/UsersPageSimple'));
const CabinsPageSimple = lazy(() => import('./pages/CabinsPageSimple'));
const CalendarPageSimple = lazy(() => import('./pages/CalendarPageSimple'));
const CalendarPageImproved = lazy(() => import('./pages/CalendarPageImproved'));
const CalendarFeaturesDemo = lazy(() => import('./pages/CalendarFeaturesDemo'));
const ReportsPageSimple = lazy(() => import('./pages/ReportsPageSimple'));
const SettingsPageSimple = lazy(() => import('./pages/SettingsPageSimple'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const ConversationStatesPage = lazy(() => import('./pages/ConversationStatesPage'));
const CabinTypesPage = lazy(() => import('./pages/CabinTypesPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    success: {
      main: '#10b981',
      light: '#d1fae5',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
      dark: '#dc2626',
    },
    info: {
      main: '#06b6d4',
      light: '#cffafe',
      dark: '#0891b2',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<div role="status" style={{ padding: 32 }}>Cargando panel…</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<PrivateRoute allowPasswordChange><ChangePasswordPage /></PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><DashboardSimple /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardSimple /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UsersPageSimple /></PrivateRoute>} />
        <Route path="/cabins" element={<PrivateRoute><CabinsPageSimple /></PrivateRoute>} />
        <Route path="/reservations" element={<PrivateRoute><ReservationsPageSimplePro /></PrivateRoute>} />
        <Route path="/reservation-create" element={<PrivateRoute><ReservationFormAdvanced /></PrivateRoute>} />
        <Route path="/reservations-advanced" element={<PrivateRoute><ReservationsAdvanced /></PrivateRoute>} />
        <Route path="/reservations-simple" element={<PrivateRoute><ReservationsPageSimplePro /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><CalendarPageSimple /></PrivateRoute>} />
        <Route path="/calendar-improved" element={<PrivateRoute><CalendarPageImproved /></PrivateRoute>} />
        <Route path="/calendar-demo" element={<PrivateRoute><CalendarFeaturesDemo /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><ReportsPageSimple /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute allowedRoles={['superadmin']}><SettingsPageSimple /></PrivateRoute>} />
        <Route path="/activities" element={<PrivateRoute><ActivitiesPage /></PrivateRoute>} />
        <Route path="/cabin-types" element={<PrivateRoute><CabinTypesPage /></PrivateRoute>} />
        <Route path="/admin-users" element={<PrivateRoute allowedRoles={['superadmin']}><AdminUsersPage /></PrivateRoute>} />
        <Route path="/conversation-states" element={<PrivateRoute allowedRoles={['superadmin']}><ConversationStatesPage /></PrivateRoute>} />
        <Route path="/audit-logs" element={<PrivateRoute allowedRoles={['superadmin']}><AuditLogsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
