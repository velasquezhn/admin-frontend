import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Backup, Download, Refresh } from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

export default function BackupsPage() {
  const [status, setStatus] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [statusResponse, listResponse] = await Promise.all([apiService.getBackupStatus(), apiService.getBackups()]);
      setStatus(statusResponse.data); setItems(listResponse.data || []);
    } catch (requestError) { setError(requestError.message || 'No se pudieron consultar las copias.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setCreating(true); setError(''); setNotice('');
    try { await apiService.createBackup(); setNotice('Copia creada y verificada correctamente.'); await load(); }
    catch (requestError) { setError(requestError.message || 'No se pudo crear la copia.'); }
    finally { setCreating(false); }
  };

  const download = async (item) => {
    setError('');
    try {
      const blob = await apiService.downloadBackup(item.name); const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = item.name; link.click(); URL.revokeObjectURL(url);
    } catch (requestError) { setError(requestError.message); }
  };

  return <DashboardLayout title="Copias de seguridad">
    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
      <Box><Typography variant="h4">Copias de seguridad</Typography><Typography color="text.secondary">Protege la base de datos y descarga una copia fuera de Railway periódicamente.</Typography></Box>
      <Stack direction="row" spacing={1}><Button startIcon={<Refresh />} variant="outlined" onClick={load}>Actualizar</Button><Button startIcon={<Backup />} variant="contained" onClick={create} disabled={creating}>{creating ? 'Creando…' : 'Crear ahora'}</Button></Stack>
    </Box>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
    {!status?.offsite?.enabled && <Alert severity="warning" sx={{ mb: 2 }}>La copia externa automática todavía no está configurada. Descarga la copia más reciente y guárdala fuera de Railway.</Alert>}
    {loading ? <CircularProgress /> : <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card><CardContent><Typography color="text.secondary">Servicio automático</Typography><Chip sx={{ mt: 1 }} label={status?.enabled ? 'Activo' : 'Desactivado'} color={status?.enabled ? 'success' : 'warning'} /></CardContent></Card>
        <Card><CardContent><Typography color="text.secondary">Copias disponibles</Typography><Typography variant="h4">{status?.backups?.count || 0}</Typography></CardContent></Card>
        <Card><CardContent><Typography color="text.secondary">Última copia</Typography><Typography>{status?.backups?.latest && status.backups.latest !== 'N/A' ? new Date(status.backups.latest).toLocaleString('es-HN') : 'Sin copias'}</Typography></CardContent></Card>
        <Card><CardContent><Typography color="text.secondary">Copia externa</Typography><Chip sx={{ mt: 1 }} label={status?.offsite?.enabled ? 'Dropbox activo' : 'Pendiente'} color={status?.offsite?.enabled ? 'success' : 'warning'} /></CardContent></Card>
      </Stack>
      <TableContainer component={Card}><Table size="small"><TableHead><TableRow><TableCell>Fecha</TableCell><TableCell>Archivo</TableCell><TableCell>Tamaño</TableCell><TableCell>Formato</TableCell><TableCell align="right">Acción</TableCell></TableRow></TableHead>
        <TableBody>{items.map((item) => <TableRow key={item.name}><TableCell>{new Date(item.created).toLocaleString('es-HN')}</TableCell><TableCell>{item.name}</TableCell><TableCell>{item.size}</TableCell><TableCell>{item.compressed ? 'Comprimido' : 'SQLite'}</TableCell><TableCell align="right"><Button startIcon={<Download />} onClick={() => download(item)}>Descargar</Button></TableCell></TableRow>)}</TableBody>
      </Table></TableContainer>
    </>}
  </DashboardLayout>;
}
