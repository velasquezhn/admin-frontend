import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { Event, Hotel, People, PriceCheck, Refresh, WarningAmber } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

const money = (value) => `L ${Number(value || 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
const statusLabels = {
  pendiente_autorizacion: 'Esperando autorización', esperando_pago: 'Esperando pago',
  pendiente_verificacion: 'Revisar comprobante', confirmada: 'Confirmada', confirmado: 'Confirmada',
  rechazada: 'Rechazada', cancelada: 'Cancelada', cancelado: 'Cancelada'
};

function MetricCard({ icon, label, value, color }) {
  return <Card sx={{ height: '100%', borderTop: `4px solid ${color}` }}><CardContent>
    <Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography color="text.secondary">{label}</Typography><Typography variant="h4" sx={{ mt: 1 }}>{value}</Typography></Box><Box sx={{ color }}>{icon}</Box></Stack>
  </CardContent></Card>;
}

export default function DashboardSimple() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [dashboard, reservationResponse] = await Promise.all([apiService.getDashboardStats(), apiService.getReservations()]);
      setMetrics(dashboard.data);
      const list = Array.isArray(reservationResponse.data) ? reservationResponse.data : [];
      setReservations(list.filter((item) => !['rechazada', 'cancelada', 'cancelado'].includes(item.status)).slice(0, 8));
    } catch (requestError) { setError(requestError.message || 'No se pudo cargar el dashboard.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const timer = setInterval(load, 60000); return () => clearInterval(timer); }, [load]);
  const alerts = metrics?.operationalAlerts || {};

  return <DashboardLayout title="Dashboard">
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
      <Box><Typography variant="h4">Resumen operativo</Typography><Typography color="text.secondary">Información real de reservas, huéspedes y ocupación.</Typography></Box>
      <Button startIcon={<Refresh />} variant="outlined" onClick={load} disabled={loading}>Actualizar</Button>
    </Box>
    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
    {loading && !metrics ? <CircularProgress /> : <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}><MetricCard icon={<Event fontSize="large" />} label="Reservas registradas" value={metrics?.totalReservations || 0} color="#2563eb" /></Grid>
        <Grid item xs={12} sm={6} lg={3}><MetricCard icon={<PriceCheck fontSize="large" />} label="Valor de reservas confirmadas" value={money(metrics?.totalRevenue)} color="#059669" /></Grid>
        <Grid item xs={12} sm={6} lg={3}><MetricCard icon={<People fontSize="large" />} label="Huéspedes registrados" value={metrics?.totalUsers || 0} color="#7c3aed" /></Grid>
        <Grid item xs={12} sm={6} lg={3}><MetricCard icon={<Hotel fontSize="large" />} label="Ocupación últimos 30 días" value={`${Number(metrics?.occupancyRate || 0).toFixed(1)} %`} color="#ea580c" /></Grid>
      </Grid>

      <Card sx={{ mb: 3 }}><CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Acciones pendientes</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} flexWrap="wrap" useFlexGap>
          <Chip icon={<WarningAmber />} label={`${alerts.pendingAuthorization || 0} por autorizar`} color={alerts.pendingAuthorization ? 'warning' : 'default'} onClick={() => navigate('/reservations')} />
          <Chip label={`${alerts.awaitingPayment || 0} esperando pago`} onClick={() => navigate('/reservations')} />
          <Chip label={`${alerts.pendingReceiptReview || 0} comprobantes por revisar`} color={alerts.pendingReceiptReview ? 'error' : 'default'} onClick={() => navigate('/reservations')} />
          <Chip label={`${alerts.checkInsToday || 0} entradas hoy`} color="success" variant="outlined" />
          <Chip label={`${alerts.checkOutsToday || 0} salidas hoy`} color="info" variant="outlined" />
          <Chip label={`${alerts.expiredPayments || 0} pagos vencidos`} color={alerts.expiredPayments ? 'error' : 'default'} />
        </Stack>
      </CardContent></Card>

      <Card><CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h6">Reservas recientes y próximas</Typography><Button onClick={() => navigate('/reservations')}>Ver todas</Button></Stack>
        <List>{reservations.map((item) => <ListItem key={item.reservation_id} divider>
          <ListItemText primary={`${item.confirmation_code || `VJ-${String(item.reservation_id).padStart(6, '0')}`} · ${item.user_name || 'Huésped'}`} secondary={`${item.cabin_name || 'Cabaña'} · ${item.start_date} al ${item.end_date} · ${money(item.total_price)}`} />
          <Chip size="small" label={statusLabels[item.status] || item.status} color={item.status === 'pendiente_verificacion' ? 'error' : item.status === 'confirmada' ? 'success' : 'warning'} />
        </ListItem>)}</List>
        {!reservations.length && <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No hay reservas para mostrar.</Typography>}
      </CardContent></Card>
    </>}
  </DashboardLayout>;
}
