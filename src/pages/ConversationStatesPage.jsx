import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const API_URL = '/admin/conversation-states';

const initialFormState = {
  user_number: '',
  state: '',
  data: '',
};

const ConversationStatesPage = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchStates = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setStates(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error cargando estados de conversación', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const handleOpenDialog = (state = null) => {
    if (state) {
      setForm({
        user_number: state.user_number || '',
        state: state.state || '',
        data: state.data || '',
      });
      setEditId(state.id);
    } else {
      setForm(initialFormState);
      setEditId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm(initialFormState);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.user_number || !form.state) {
      setSnackbar({ open: true, message: 'Por favor completa los campos obligatorios', severity: 'warning' });
      return;
    }

    try {
      let res;
      if (editId) {
        res = await fetch(`${API_URL}/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'Guardado exitoso', severity: 'success' });
        fetchStates();
        handleCloseDialog();
      } else {
        setSnackbar({ open: true, message: data.message || 'Error al guardar', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error en la solicitud', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este estado de conversación?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'Estado eliminado', severity: 'success' });
        fetchStates();
      } else {
        setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error en la solicitud', severity: 'error' });
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Gestión de Estados de Conversación
      </Typography>
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
        Nuevo Estado
      </Button>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número de Usuario</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Datos (JSON)</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {states.map((state) => (
                <TableRow key={state.id}>
                  <TableCell>{state.user_number}</TableCell>
                  <TableCell>{state.state}</TableCell>
                  <TableCell>{state.data}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(state)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(state.id)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {states.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay estados registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Editar Estado' : 'Nuevo Estado'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Número de Usuario"
            name="user_number"
            value={form.user_number}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Estado"
            name="state"
            value={form.state}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Datos (JSON)"
            name="data"
            value={form.data}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editId ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConversationStatesPage;
