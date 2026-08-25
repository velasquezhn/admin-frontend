import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import DashboardLayout from '../components/Layout/DashboardLayout';

const SettingsPageSimple = () => {
  return (
    <DashboardLayout title="Configuración">
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Configuración del Sistema
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Esta página permitirá configurar el sistema. Funcionalidad completa en desarrollo.
          </Typography>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SettingsPageSimple;
