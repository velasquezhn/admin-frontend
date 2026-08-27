import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { currentAdmin, normalizeAdminRole } from '../utils/adminRoles';

const PrivateRoute = ({ children, allowedRoles = ['admin', 'superadmin'], allowPasswordChange = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsAuthenticated(response.ok);
        if (!response.ok) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
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
