import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { currentAdmin, normalizeAdminRole } from '../utils/adminRoles';
import { apiFetch, clearClientSession } from '../services/httpClient';

const PrivateRoute = ({ children, allowedRoles = ['admin', 'superadmin'], allowPasswordChange = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiFetch('/auth/verify', { method: 'POST' });
        setIsAuthenticated(response.ok);
        if (response.ok) {
          const payload = await response.json();
          const stored = currentAdmin();
          localStorage.setItem('adminUser', JSON.stringify({ ...stored, ...(payload.data?.user || {}) }));
        }
        if (!response.ok) {
          clearClientSession();
        }
      } catch (_error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const user = currentAdmin();
  if (user.mustChangePassword && !allowPasswordChange) return <Navigate to="/change-password" replace />;
  if (!allowedRoles.map(normalizeAdminRole).includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default PrivateRoute;
