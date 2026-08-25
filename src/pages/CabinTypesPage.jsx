import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import cabinTypesService from '../services/cabinTypesService';
import DashboardLayout from '../components/Layout/DashboardLayout';

const CabinTypesPage = () => {
  console.log('🎯 CabinTypesPage component loaded');
  
  const [cabinTypes, setCabinTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para el diálogo de edición
  const [editDialog, setEditDialog] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // Estados para vista previa
  const [previewDialog, setPreviewDialog] = useState(false);
  const [menuPreview, setMenuPreview] = useState(null);

  useEffect(() => {
    console.log('🚀 useEffect triggered, calling loadCabinTypes');
    loadCabinTypes();
  }, []);

  const loadCabinTypes = async () => {
    try {
      setLoading(true);
      const response = await cabinTypesService.getAllCabinTypes();
      console.log('API Response:', response); // Debug
      setCabinTypes(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading cabin types:', err); // Debug
      setError('Error al cargar tipos de cabañas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (typeKey, currentStatus) => {
    try {
      await cabinTypesService.toggleCabinType(typeKey, !currentStatus);
      setSuccess(`Tipo ${typeKey} ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      loadCabinTypes();
    } catch (err) {
      setError('Error al cambiar estado: ' + err.message);
    }
  };

  const handleEdit = (cabinType) => {
    setEditingType(cabinType);
    setEditForm({
      nombre: cabinType.nombre,
      capacidad: cabinType.capacidad,
      habitaciones: cabinType.habitaciones,
      baños: cabinType.baños,
      precio_noche: cabinType.precio_noche,
      descripcion: cabinType.descripcion,
      fotos: Array.isArray(cabinType.fotos) ? cabinType.fotos.join('\n') : cabinType.fotos
    });
    setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updateData = {
        ...editForm,
        capacidad: parseInt(editForm.capacidad),
        habitaciones: parseInt(editForm.habitaciones),
        baños: parseInt(editForm.baños),
        precio_noche: parseFloat(editForm.precio_noche),
        fotos: editForm.fotos.split('\n').filter(url => url.trim())
      };

      await cabinTypesService.updateCabinType(editingType.type_key, updateData);
      setSuccess('Tipo de cabaña actualizado exitosamente');
      setEditDialog(false);
      loadCabinTypes();
    } catch (err) {
      setError('Error al actualizar: ' + err.message);
    }
  };

  const handlePreview = async () => {
    try {
      const preview = await cabinTypesService.getMenuPreview();
      setMenuPreview(preview);
      setPreviewDialog(true);
    } catch (err) {
      setError('Error al cargar vista previa: ' + err.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL'
    }).format(price);
  };

  if (loading) {
    return (
      <Container>
        <Typography>Cargando tipos de cabañas...</Typography>
      </Container>
    );
  }

  return (
    <DashboardLayout title="Gestión de Tipos de Cabañas">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          🏠 Gestión de Tipos de Cabañas
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={handlePreview}
            sx={{ mr: 2 }}
          >
            Vista Previa del Menú
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {/* TODO: Implementar crear nuevo */}}
          >
            Nuevo Tipo
          </Button>
        </Box>
      </Box>

      {/* Información del sistema */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Información del Sistema
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Total de tipos:</strong> {cabinTypes.length}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Activos:</strong> {cabinTypes.filter(t => t.activo).length}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Fuente:</strong> 100% Base de Datos
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabla de tipos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell align="center">Capacidad</TableCell>
              <TableCell align="center">Habitaciones</TableCell>
              <TableCell align="center">Baños</TableCell>
              <TableCell align="right">Precio/Noche</TableCell>
              <TableCell align="center">Imágenes</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cabinTypes.map((cabinType) => (
              <TableRow key={cabinType.type_key}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">
                      {cabinType.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cabinType.type_key}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip label={`${cabinType.capacidad} personas`} size="small" />
                </TableCell>
                <TableCell align="center">{cabinType.habitaciones}</TableCell>
                <TableCell align="center">{cabinType.baños}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    {formatPrice(cabinType.precio_noche)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={`${Array.isArray(cabinType.fotos) ? cabinType.fotos.length : 0} fotos`} 
                    size="small" 
                    color="info"
                  />
                </TableCell>
                <TableCell align="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cabinType.activo}
                        onChange={() => handleToggleActive(cabinType.type_key, cabinType.activo)}
                        color="primary"
                      />
                    }
                    label={cabinType.activo ? 'Activo' : 'Inactivo'}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleEdit(cabinType)}
                    color="primary"
                    title="Editar"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de edición */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Editar {editingType?.nombre}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={editForm.nombre || ''}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Capacidad"
                  type="number"
                  value={editForm.capacidad || ''}
                  onChange={(e) => setEditForm({ ...editForm, capacidad: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Habitaciones"
                  type="number"
                  value={editForm.habitaciones || ''}
                  onChange={(e) => setEditForm({ ...editForm, habitaciones: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Baños"
                  type="number"
                  value={editForm.baños || ''}
                  onChange={(e) => setEditForm({ ...editForm, baños: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Precio por Noche"
                  type="number"
                  step="0.01"
                  value={editForm.precio_noche || ''}
                  onChange={(e) => setEditForm({ ...editForm, precio_noche: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URLs de Fotos (una por línea)"
                  multiline
                  rows={4}
                  value={editForm.fotos || ''}
                  onChange={(e) => setEditForm({ ...editForm, fotos: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={6}
                  value={editForm.descripcion || ''}
                  onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de vista previa */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          📱 Vista Previa del Menú de WhatsApp
        </DialogTitle>
        <DialogContent>
          {menuPreview && (
            <Box sx={{ pt: 2 }}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  🏖️ Villas Julie - Opciones de Alojamiento{'\n\n'}
                  {menuPreview.menu?.map((item, index) => (
                    `${item.option}. ${item.text.split('.')[1]}\n`
                  )).join('')}
                  {'\n'}0. Volver ↩️{'\n'}
                  Por favor selecciona el número de la opción que te interesa:
                </Typography>
              </Paper>
              
              <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center' }}>
                Total de opciones: {menuPreview.totalOptions}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars para notificaciones */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
    </DashboardLayout>
  );
};

export default CabinTypesPage;
