import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import DashboardLayout from '../components/Layout/DashboardLayout';

const API_URL = process.env.REACT_APP_API_URL;

export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_URL}/admin/audit-logs?limit=100`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo cargar la auditoría.');
      setRows(data.data || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <DashboardLayout title="Auditoría administrativa">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box><Typography variant="h4">Historial de cambios</Typography><Typography color="text.secondary">Últimas 100 operaciones que modificaron el sistema.</Typography></Box>
        <Button variant="outlined" onClick={load}>Actualizar</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead><TableRow><TableCell>Fecha</TableCell><TableCell>Usuario</TableCell><TableCell>Acción</TableCell><TableCell>Ruta</TableCell><TableCell>Resultado</TableCell></TableRow></TableHead>
            <TableBody>{rows.map((row) => <TableRow key={row.id}>
              <TableCell>{new Date(row.created_at).toLocaleString('es-HN')}</TableCell>
              <TableCell>{row.username || `ID ${row.admin_id}`}<br/><small>{row.role}</small></TableCell>
              <TableCell>{row.method}</TableCell><TableCell sx={{ wordBreak: 'break-word' }}>{row.path}</TableCell>
              <TableCell><Chip size="small" label={row.status_code} color={row.status_code < 400 ? 'success' : 'error'} /></TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </TableContainer>
      )}
    </DashboardLayout>
  );
}
