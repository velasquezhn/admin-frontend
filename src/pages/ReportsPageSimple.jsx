import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

const today = new Date().toISOString().slice(0, 10);
const yearStart = `${today.slice(0, 4)}-01-01`;
const money = (value) => `L ${Number(value || 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;

export default function ReportsPageSimple() {
  const [start, setStart] = useState(yearStart);
  const [end, setEnd] = useState(today);
  const [occupancy, setOccupancy] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!start || !end || start > end) { setError('La fecha inicial debe ser anterior o igual a la fecha final.'); return; }
    setLoading(true); setError('');
    try {
      const [occupancyResponse, revenueResponse] = await Promise.all([
        apiService.getOccupancyReport(start, end), apiService.getRevenueReport('monthly', 12)
      ]);
      setOccupancy(occupancyResponse.data); setRevenue(revenueResponse.data);
    } catch (requestError) { setError(requestError.message || 'No se pudieron cargar los reportes.'); }
    finally { setLoading(false); }
  }, [start, end]);

  useEffect(() => { load(); }, []);

  const download = async () => {
    setExporting(true); setError('');
    try {
      const blob = await apiService.downloadReservationsReport(start, end);
      const url = URL.createObjectURL(blob); const link = document.createElement('a');
      link.href = url; link.download = `reservas-${start}-${end}.xlsx`; link.click(); URL.revokeObjectURL(url);
    } catch (requestError) { setError(requestError.message || 'No se pudo descargar el reporte.'); }
    finally { setExporting(false); }
  };

  return <DashboardLayout title="Reportes">
    <Box sx={{ mb: 3 }}><Typography variant="h4">Reportes de operación</Typography><Typography color="text.secondary">Ocupación y valor de reservas confirmadas. Los valores no sustituyen una contabilidad de pagos.</Typography></Box>
    <Card sx={{ mb: 3 }}><CardContent><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
      <TextField type="date" label="Desde" value={start} onChange={(event) => setStart(event.target.value)} InputLabelProps={{ shrink: true }} />
      <TextField type="date" label="Hasta" value={end} onChange={(event) => setEnd(event.target.value)} InputLabelProps={{ shrink: true }} />
      <Button variant="contained" startIcon={<Refresh />} onClick={load} disabled={loading}>Aplicar</Button>
      <Button variant="outlined" startIcon={<Download />} onClick={download} disabled={exporting || start > end}>{exporting ? 'Generando…' : 'Descargar Excel'}</Button>
    </Stack></CardContent></Card>
    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
    {loading ? <CircularProgress /> : <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}><Card><CardContent><Typography color="text.secondary">Ocupación promedio</Typography><Typography variant="h4">{Number(occupancy?.summary?.averageOccupancyRate || 0).toFixed(1)} %</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent><Typography color="text.secondary">Valor confirmado (12 meses)</Typography><Typography variant="h4">{money(revenue?.summary?.totalRevenue)}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent><Typography color="text.secondary">Reservas confirmadas (12 meses)</Typography><Typography variant="h4">{revenue?.summary?.totalReservations || 0}</Typography></CardContent></Card></Grid>
      </Grid>
      <TableContainer component={Card}><Table size="small"><TableHead><TableRow><TableCell>Cabaña</TableCell><TableCell align="right">Reservas</TableCell><TableCell align="right">Noches</TableCell><TableCell align="right">Ocupación</TableCell><TableCell align="right">Valor confirmado</TableCell></TableRow></TableHead>
        <TableBody>{(occupancy?.cabins || []).map((cabin) => <TableRow key={cabin.cabinId}><TableCell>{cabin.name}</TableCell><TableCell align="right">{cabin.totalReservations}</TableCell><TableCell align="right">{cabin.totalNightsBooked}</TableCell><TableCell align="right">{Number(cabin.occupancyRate || 0).toFixed(1)} %</TableCell><TableCell align="right">{money(cabin.totalRevenue)}</TableCell></TableRow>)}</TableBody>
      </Table></TableContainer>
    </>}
  </DashboardLayout>;
}
