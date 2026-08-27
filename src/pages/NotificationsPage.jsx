import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, FormControl,
  InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography
} from '@mui/material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

const statusLabels = { pending: 'Pendiente', sent: 'Enviado', dead: 'Requiere atención' };
const statusColors = { pending: 'warning', sent: 'success', dead: 'error' };
const kindLabels = {
  guest_decision: 'Aviso al huésped',
  admin_review: 'Revisión administrativa',
  generic: 'Mensaje de WhatsApp'
};

export default function NotificationsPage() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await apiService.getNotifications(status);
      setRows(response.data || []);
      setStats(response.stats || {});
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron cargar los mensajes.');
    } finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const retry = async (id) => {
    setRetrying(id); setError(''); setNotice('');
    try {
      await apiService.retryNotification(id);
      setNotice('El mensaje quedó programado para un nuevo intento inmediato.');
      await load();
    } catch (requestError) {
      setError(requestError.message || 'No se pudo reintentar el mensaje.');
    } finally { setRetrying(null); }
  };

  return (
    <DashboardLayout title="Mensajes de WhatsApp">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Box>
          <Typography variant="h4">Entrega de mensajes</Typography>
          <Typography color="text.secondary">Los fallos temporales se reintentan automáticamente. Aquí puedes revisar los casos que requieren atención.</Typography>
        </Box>
        <Button variant="outlined" onClick={load} disabled={loading}>Actualizar</Button>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ minWidth: 160 }}><CardContent><Typography color="text.secondary">Pendientes</Typography><Typography variant="h4">{stats.pending || 0}</Typography></CardContent></Card>
        <Card sx={{ minWidth: 160 }}><CardContent><Typography color="text.secondary">Enviados</Typography><Typography variant="h4" color="success.main">{stats.sent || 0}</Typography></CardContent></Card>
        <Card sx={{ minWidth: 160 }}><CardContent><Typography color="text.secondary">Requieren atención</Typography><Typography variant="h4" color="error.main">{stats.dead || 0}</Typography></CardContent></Card>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
      <FormControl size="small" sx={{ minWidth: 220, mb: 2 }}>
        <InputLabel>Estado</InputLabel>
        <Select value={status} label="Estado" onChange={(event) => setStatus(event.target.value)}>
          <MenuItem value="">Todos</MenuItem><MenuItem value="pending">Pendientes</MenuItem>
          <MenuItem value="dead">Requieren atención</MenuItem><MenuItem value="sent">Enviados</MenuItem>
        </Select>
      </FormControl>

      {loading ? <CircularProgress /> : (
        <TableContainer component={Card}>
          <Table size="small">
            <TableHead><TableRow><TableCell>Fecha</TableCell><TableCell>Tipo</TableCell><TableCell>Destino</TableCell><TableCell>Reserva</TableCell><TableCell>Estado</TableCell><TableCell>Intentos</TableCell><TableCell>Error</TableCell><TableCell align="right">Acción</TableCell></TableRow></TableHead>
            <TableBody>
              {rows.map((row) => <TableRow key={row.id}>
                <TableCell>{new Date(row.created_at).toLocaleString('es-HN')}</TableCell>
                <TableCell>{kindLabels[row.message_kind] || row.message_kind}</TableCell>
                <TableCell>+{row.recipient}</TableCell>
                <TableCell>{row.reservation_id ? `VJ-${String(row.reservation_id).padStart(6, '0')}` : '—'}</TableCell>
                <TableCell><Chip size="small" label={statusLabels[row.status] || row.status} color={statusColors[row.status] || 'default'} /></TableCell>
                <TableCell>{row.attempts}/{row.max_attempts}</TableCell>
                <TableCell>{row.last_error_code || '—'}</TableCell>
                <TableCell align="right">{row.status !== 'sent' && <Button size="small" onClick={() => retry(row.id)} disabled={retrying === row.id}>{retrying === row.id ? 'Reintentando…' : 'Reintentar'}</Button>}</TableCell>
              </TableRow>)}
              {!rows.length && <TableRow><TableCell colSpan={8} align="center">No hay mensajes en este estado.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DashboardLayout>
  );
}
