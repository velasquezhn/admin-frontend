import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Container, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiFetch, clearClientSession } from '../services/httpClient';

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) return setError('Las contraseñas nuevas no coinciden.');
    if (form.newPassword.length < 10 || !/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
      return setError('Usa al menos 10 caracteres, con letras y números.');
    }
    setSaving(true);
    try {
      const response = await apiFetch('/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo cambiar la contraseña.');
      clearClientSession();
      navigate('/login', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>Cambiar contraseña</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Debes reemplazar la contraseña temporal antes de utilizar el panel.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={submit}>
              <TextField fullWidth required type="password" label="Contraseña actual" margin="normal" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
              <TextField fullWidth required type="password" label="Contraseña nueva" margin="normal" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} helperText="Mínimo 10 caracteres, con letras y números." />
              <TextField fullWidth required type="password" label="Confirmar contraseña nueva" margin="normal" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
              <Button fullWidth type="submit" variant="contained" disabled={saving} sx={{ mt: 3 }}>{saving ? 'Guardando…' : 'Cambiar contraseña'}</Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
