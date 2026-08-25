import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import DashboardLayout from '../components/Layout/DashboardLayout';

const ReportsPageSimple = () => {
  return (
    <DashboardLayout title="Reportes">
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Reportes y Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Esta página mostrará reportes y gráficos del sistema. Funcionalidad completa en desarrollo.
          </Typography>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ReportsPageSimple;
