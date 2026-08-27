import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Switch, TextField, Typography } from '@mui/material';
import { Add, Delete, Edit, WhatsApp } from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

const emptyForm = { display_name: '', phone_number: '', is_active: true };

const SettingsPageSimple = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await apiService.getWhatsAppAdmins();
      setAdmins(response.data || []);
    } catch { setMessage({ severity: 'error', text: 'No se pudo cargar la configuración.' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (admin) => {
    setEditing(admin);
    setForm({ display_name: admin.display_name || '', phone_number: admin.phone_number, is_active: Boolean(admin.is_active) });
    setDialogOpen(true);
  };
  const save = async () => {
    try {
      if (editing) await apiService.updateWhatsAppAdmin(editing.id, form);
      else await apiService.createWhatsAppAdmin(form);
      setDialogOpen(false);
      setMessage({ severity: 'success', text: 'Administrador de WhatsApp guardado.' });
      await load();
    } catch { setMessage({ severity: 'error', text: 'No se pudo guardar. Revisa el número y que no esté duplicado.' }); }
  };
  const remove = async (admin) => {
    if (!window.confirm(`¿Quitar a ${admin.display_name || admin.phone_number} de las aprobaciones por WhatsApp?`)) return;
    try {
      await apiService.deleteWhatsAppAdmin(admin.id);
      setMessage({ severity: 'success', text: 'Administrador eliminado.' });
      await load();
    } catch { setMessage({ severity: 'error', text: 'No se pudo eliminar el administrador.' }); }
  };

  return (
    <DashboardLayout title="Configuración">
      <Stack spacing={3}>
        {message && <Alert severity={message.severity} onClose={() => setMessage(null)}>{message.text}</Alert>}
        <Card><CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} mb={3}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center"><WhatsApp color="success" /><Typography variant="h5">Administradores de WhatsApp</Typography></Stack>
              <Typography color="text.secondary" mt={1}>Estos números reciben las reservas y pueden aprobarlas o rechazarlas desde WhatsApp.</Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />} onClick={openNew}>Agregar número</Button>
          </Stack>
          {loading ? <CircularProgress /> : admins.length === 0 ? <Alert severity="warning">Todavía no hay administradores. Agrega al menos uno.</Alert> : (
            <Stack spacing={1.5}>{admins.map((admin) => (
              <Stack key={admin.id} direction="row" alignItems="center" spacing={2} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ flex: 1 }}><Typography fontWeight={700}>{admin.display_name || 'Administrador'}</Typography><Typography color="text.secondary">+{admin.phone_number}</Typography></Box>
                <Chip label={admin.is_active ? 'Activo' : 'Inactivo'} color={admin.is_active ? 'success' : 'default'} size="small" />
                <IconButton aria-label="Editar" onClick={() => openEdit(admin)}><Edit /></IconButton>
                <IconButton aria-label="Eliminar" color="error" onClick={() => remove(admin)}><Delete /></IconButton>
              </Stack>
            ))}</Stack>
          )}
        </CardContent></Card>
        <Alert severity="info">Cada administrador debe enviar primero <strong>/admin</strong> al WhatsApp de Villas Julie para abrir la ventana de atención de Meta.</Alert>
      </Stack>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar administrador' : 'Agregar administrador'}</DialogTitle>
        <DialogContent><Stack spacing={2} mt={1}>
          <TextField label="Nombre" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Ejemplo: Carlos" />
          <TextField label="Número con código de país" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value.replace(/\D/g, '') })} placeholder="504XXXXXXXX" helperText="Sin +, espacios ni guiones." />
          {editing && <Stack direction="row" alignItems="center"><Switch checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /><Typography>Puede aprobar reservas</Typography></Stack>}
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setDialogOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save} disabled={!/^\d{8,15}$/.test(form.phone_number)}>Guardar</Button></DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default SettingsPageSimple;
