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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Image as ImageIcon,
  RemoveRedEye as PreviewIcon
} from '@mui/icons-material';
import activitiesService from '../services/activitiesService';
import DashboardLayout from '../components/Layout/DashboardLayout';

const ActivitiesPage = () => {
  console.log('🎯 ActivitiesPage component loaded');
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para edición
  const [editDialog, setEditDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // Estados para crear nueva actividad
  const [createDialog, setCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    activity_key: '',
    nombre: '',
    categoria: '',
    subcategoria: '',
    descripcion: '',
    descripcion_corta: '',
    dificultad: '',
    duracion: '',
    capacidad_maxima: 0,
    edad_minima: 0,
    multimedia: '',
    precios: {
      adulto: 0,
      nino: 0
    }
  });
  
  // Estados para vista previa
  const [previewDialog, setPreviewDialog] = useState(false);
  const [menuPreview, setMenuPreview] = useState(null);
  
  // Estados para galería de fotos
  const [photosDialog, setPhotosDialog] = useState(false);
  const [selectedActivityPhotos, setSelectedActivityPhotos] = useState(null);

  useEffect(() => {
    console.log('🚀 useEffect triggered, calling loadActivities');
    loadActivities();
  }, []);

  const loadActivities = async () => {
    console.log('� [ACTIVITIES-DEBUG] ==================== START LOADING ====================');
    console.log('🔄 [ACTIVITIES-DEBUG] Starting to load activities...');
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [ACTIVITIES-DEBUG] Calling activitiesService.getAllActivities()');
      const data = await activitiesService.getAllActivities();
      console.log('✅ [ACTIVITIES-DEBUG] Raw data received from API:', data);
      console.log('✅ [ACTIVITIES-DEBUG] Data type:', typeof data, 'Is Array:', Array.isArray(data));
      console.log('✅ [ACTIVITIES-DEBUG] Data keys:', data ? Object.keys(data) : 'null');
      
      // Verificar token
      const token = localStorage.getItem('adminToken');
      console.log('🔑 [ACTIVITIES-DEBUG] Token exists:', !!token);
      
      if (Array.isArray(data)) {
        setActivities(data);
        console.log('✅ [ACTIVITIES-DEBUG] Activities set in state (direct array):', data.length, 'items');
      } else if (data && data.success && data.data && Array.isArray(data.data)) {
        setActivities(data.data);
        console.log('✅ [ACTIVITIES-DEBUG] Activities set from data.data:', data.data.length, 'items');
      } else if (data && data.activities && Array.isArray(data.activities)) {
        setActivities(data.activities);
        console.log('✅ [ACTIVITIES-DEBUG] Activities set from data.activities:', data.activities.length, 'items');
      } else {
        console.warn('⚠️ [ACTIVITIES-DEBUG] Data is not in expected format, setting empty array');
        console.warn('⚠️ [ACTIVITIES-DEBUG] Data structure:', JSON.stringify(data, null, 2));
        setActivities([]);
      }
    } catch (err) {
      console.error('❌ [ACTIVITIES-DEBUG] Error loading activities:', err);
      console.error('❌ [ACTIVITIES-DEBUG] Error details:', err.message);
      console.error('❌ [ACTIVITIES-DEBUG] Error stack:', err.stack);
      setError('Error al cargar las actividades: ' + err.message);
      setActivities([]);
    } finally {
      setLoading(false);
      console.log('📥 [ACTIVITIES-DEBUG] Loading process completed');
      console.log('📥 [ACTIVITIES-DEBUG] Final state - Loading:', false, 'Activities count:', activities.length);
      console.log('🔄 [ACTIVITIES-DEBUG] ==================== END LOADING ====================');
    }
  };

  const handleEdit = (activity) => {
    console.log('✏️ Editing activity:', activity);
    setEditingActivity(activity);
    setEditForm({
      nombre: activity.nombre || '',
      categoria: activity.categoria || '',
      subcategoria: activity.subcategoria || '',
      descripcion: activity.descripcion || '',
      descripcion_corta: activity.descripcion_corta || '',
      dificultad: activity.dificultad || '',
      duracion: activity.duracion || '',
      capacidad_maxima: activity.capacidad_maxima || 0,
      edad_minima: activity.edad_minima || 0,
      multimedia: JSON.stringify(activity.multimedia || [], null, 2)
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        nombre: editForm.nombre,
        categoria: editForm.categoria,
        subcategoria: editForm.subcategoria,
        descripcion: editForm.descripcion,
        descripcion_corta: editForm.descripcion_corta,
        dificultad: editForm.dificultad,
        duracion: editForm.duracion,
        capacidad_maxima: parseInt(editForm.capacidad_maxima) || 0,
        edad_minima: parseInt(editForm.edad_minima) || 0,
        multimedia: JSON.parse(editForm.multimedia || '[]')
      };

      await activitiesService.updateActivity(editingActivity.activity_key, updateData);
      setSuccess('Actividad actualizada exitosamente');
      setEditDialog(false);
      loadActivities();
    } catch (err) {
      setError('Error al actualizar: ' + err.message);
    }
  };

  const handleCreate = async () => {
    try {
      if (!createForm.activity_key || !createForm.nombre || !createForm.categoria) {
        setError('Los campos Clave, Nombre y Categoría son obligatorios');
        return;
      }

      const activityData = {
        activity_key: createForm.activity_key,
        nombre: createForm.nombre,
        categoria: createForm.categoria,
        subcategoria: createForm.subcategoria,
        descripcion: createForm.descripcion,
        descripcion_corta: createForm.descripcion_corta,
        dificultad: createForm.dificultad,
        duracion: createForm.duracion,
        capacidad_maxima: parseInt(createForm.capacidad_maxima) || 0,
        edad_minima: parseInt(createForm.edad_minima) || 0,
        multimedia: createForm.multimedia ? JSON.parse(createForm.multimedia) : [],
        precios: {
          adulto: parseFloat(createForm.precios.adulto) || 0,
          nino: parseFloat(createForm.precios.nino) || 0
        }
      };

      await activitiesService.createActivity(activityData);
      setSuccess('Actividad creada exitosamente');
      setCreateDialog(false);
      resetCreateForm();
      loadActivities();
    } catch (err) {
      setError('Error al crear actividad: ' + err.message);
    }
  };

  const handleDelete = async (activity_id) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta actividad?')) {
      try {
        await activitiesService.deleteActivity(activity_id);
        setSuccess('Actividad eliminada exitosamente');
        loadActivities();
      } catch (err) {
        setError('Error al eliminar: ' + err.message);
      }
    }
  };

  const handleViewPhotos = (activity) => {
    setSelectedActivityPhotos(activity);
    setPhotosDialog(true);
  };

  const handleMenuPreview = async (activity) => {
    const preview = {
      id: activity.activity_id,
      name: activity.nombre,
      description: activity.descripcion,
      photos: activity.multimedia || [],
      created: activity.created_at,
      status: activity.activo
    };
    setMenuPreview(preview);
    setPreviewDialog(true);
  };

  const handleBotMenuPreview = async () => {
    try {
      console.log('🔄 Generating bot menu preview...');
      const menuData = await activitiesService.getMenuPreview();
      console.log('✅ Bot menu data:', menuData);
      
      setMenuPreview({
        ...menuData.data,
        totalActivities: menuData.total,
        message: menuData.message
      });
      setPreviewDialog(true);
    } catch (error) {
      console.error('❌ Error generating bot menu preview:', error);
      setError('Error al generar vista previa del menú: ' + error.message);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      activity_key: '',
      nombre: '',
      categoria: '',
      subcategoria: '',
      descripcion: '',
      descripcion_corta: '',
      dificultad: '',
      duracion: '',
      capacidad_maxima: 0,
      edad_minima: 0,
      multimedia: '',
      precios: {
        adulto: 0,
        nino: 0
      }
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Gestión de Actividades">
        <Container>
          <Typography>Cargando actividades...</Typography>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestión de Actividades">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            🎯 Gestión de Actividades
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handleBotMenuPreview}
              color="info"
            >
              Vista Previa Bot
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
            >
              Nueva Actividad
            </Button>
          </Box>
        </Box>

        {/* Alertas */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>

        <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>

        {/* Debug info - solo en desarrollo */}
        {false && process.env.NODE_ENV === 'development' && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption">
              Debug: Loading={loading.toString()}, Activities={activities.length}, Error={error || 'none'}
            </Typography>
          </Box>
        )}

        {/* Tabla de actividades */}
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Foto</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Duración</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Precio</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Capacidad</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Debug information - deshabilitado */}
              {false && process.env.NODE_ENV === 'development' && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ backgroundColor: '#f5f5f5', fontSize: '12px', fontFamily: 'monospace' }}>
                    🐛 DEBUG: Loading={loading.toString()}, Activities={activities.length}, Error={error || 'none'}
                    <br/>
                    🐛 Activities data preview: {JSON.stringify(activities.slice(0, 1), null, 2)}
                  </TableCell>
                </TableRow>
              )}
              
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      {loading ? 'Cargando actividades...' : 'No hay actividades disponibles'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => {
                const firstPhoto = Array.isArray(activity.multimedia) && activity.multimedia.length > 0 
                  ? activity.multimedia[0] 
                  : null;
                const photoUrl = typeof firstPhoto === 'string' ? firstPhoto : firstPhoto?.url;
                
                return (
                  <TableRow key={activity.activity_id}>
                    <TableCell>
                      <Avatar
                        src={photoUrl}
                        sx={{ width: 50, height: 50 }}
                      >
                        <ImageIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', maxWidth: 200 }}>
                        {activity.nombre}
                      </Typography>
                      {activity.descripcion_corta && typeof activity.descripcion_corta === 'string' && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {activity.descripcion_corta.length > 100 
                            ? `${activity.descripcion_corta.substring(0, 100)}...` 
                            : activity.descripcion_corta}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={activity.categoria} 
                        variant="outlined" 
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      {activity.subcategoria && (
                        <Chip 
                          label={activity.subcategoria} 
                          variant="outlined" 
                          size="small"
                          sx={{ ml: 0.5, textTransform: 'capitalize' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {typeof activity.duracion === 'string' 
                        ? activity.duracion 
                        : (activity.duracion || 'No especificada')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {(() => {
                          if (typeof activity.precios === 'object' && activity.precios !== null) {
                            return `L.${activity.precios.adulto || 0}`;
                          } else if (typeof activity.precios === 'string') {
                            try {
                              const parsed = JSON.parse(activity.precios);
                              return `L.${parsed.adulto || 0}`;
                            } catch {
                              return `L.${activity.precios || '0'}`;
                            }
                          } else {
                            return `L.${activity.precios || '0'}`;
                          }
                        })()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {activity.capacidad_maxima || 'Ilimitada'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          onClick={() => handleEdit(activity)}
                          color="primary"
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleMenuPreview(activity)}
                          color="secondary"
                          title="Vista previa del menú"
                        >
                          <PreviewIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleViewPhotos(activity)}
                          color="info"
                          title="Ver fotos"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Diálogo de creación */}
        <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            ➕ Nueva Actividad
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Clave de Actividad *"
                    value={createForm.activity_key}
                    onChange={(e) => setCreateForm({ ...createForm, activity_key: e.target.value })}
                    placeholder="ej: act_senderismo_punta_sal"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Categoría *</InputLabel>
                    <Select
                      value={createForm.categoria}
                      onChange={(e) => setCreateForm({ ...createForm, categoria: e.target.value })}
                    >
                      <MenuItem value="Aventura">Aventura</MenuItem>
                      <MenuItem value="Gastronomía">Gastronomía</MenuItem>
                      <MenuItem value="Cultura">Cultura</MenuItem>
                      <MenuItem value="Naturaleza">Naturaleza</MenuItem>
                      <MenuItem value="Deportes">Deportes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre de la Actividad *"
                    value={createForm.nombre}
                    onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subcategoría"
                    value={createForm.subcategoria}
                    onChange={(e) => setCreateForm({ ...createForm, subcategoria: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Duración"
                    value={createForm.duracion}
                    onChange={(e) => setCreateForm({ ...createForm, duracion: e.target.value })}
                    placeholder="ej: 4 horas"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Capacidad Máxima"
                    type="number"
                    value={createForm.capacidad_maxima}
                    onChange={(e) => setCreateForm({ ...createForm, capacidad_maxima: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Edad Mínima"
                    type="number"
                    value={createForm.edad_minima}
                    onChange={(e) => setCreateForm({ ...createForm, edad_minima: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción Corta"
                    value={createForm.descripcion_corta}
                    onChange={(e) => setCreateForm({ ...createForm, descripcion_corta: e.target.value })}
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción Completa"
                    value={createForm.descripcion}
                    onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                    multiline
                    rows={4}
                  />
                </Grid>
                
                {/* Sección de Multimedia y Fotos */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>📸 Fotos y Multimedia</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="URLs de Fotos (formato JSON)"
                    value={createForm.multimedia}
                    onChange={(e) => setCreateForm({ ...createForm, multimedia: e.target.value })}
                    multiline
                    rows={4}
                    placeholder='["https://ejemplo.com/foto1.jpg", "https://ejemplo.com/foto2.jpg"]'
                    helperText="Ingresa un array JSON con las URLs de las fotos de la actividad"
                  />
                </Grid>
                
                {/* Sección de Precios */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>💰 Precios</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Precio Adulto (HNL)"
                    type="number"
                    value={createForm.precios.adulto}
                    onChange={(e) => setCreateForm({ 
                      ...createForm, 
                      precios: { ...createForm.precios, adulto: e.target.value }
                    })}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Precio Niño (HNL)"
                    type="number"
                    value={createForm.precios.nino}
                    onChange={(e) => setCreateForm({ 
                      ...createForm, 
                      precios: { ...createForm.precios, nino: e.target.value }
                    })}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} variant="contained">Crear Actividad</Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de edición */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            ✏️ Editar {editingActivity?.nombre}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={editForm.nombre || ''}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      value={editForm.categoria || ''}
                      onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                    >
                      <MenuItem value="Aventura">Aventura</MenuItem>
                      <MenuItem value="Gastronomía">Gastronomía</MenuItem>
                      <MenuItem value="Cultura">Cultura</MenuItem>
                      <MenuItem value="Naturaleza">Naturaleza</MenuItem>
                      <MenuItem value="Deportes">Deportes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    value={editForm.descripcion || ''}
                    onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                    multiline
                    rows={4}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Multimedia (JSON)"
                    value={editForm.multimedia || ''}
                    onChange={(e) => setEditForm({ ...editForm, multimedia: e.target.value })}
                    multiline
                    rows={4}
                    helperText="Edita las URLs de fotos en formato JSON"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} variant="contained">Actualizar</Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de vista previa del menú */}
        <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {menuPreview?.buttons ? '🤖 Vista Previa del Menú del Bot' : '🔍 Vista Previa Individual'}
          </DialogTitle>
          <DialogContent>
            {menuPreview && (
              <>
                {menuPreview.buttons ? (
                  // Vista previa del menú completo del bot
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {menuPreview.message || `Menú con ${menuPreview.totalActivities} actividades`}
                    </Typography>
                    
                    {/* Botones del bot */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>📱 Botones del Bot:</Typography>
                    <Grid container spacing={1}>
                      {menuPreview.buttons.map((button, index) => (
                        <Grid item xs={6} key={index}>
                          <Card variant="outlined" sx={{ p: 1 }}>
                            <Typography variant="subtitle2">{button.text}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {button.description}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Carrusel del bot */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>🎠 Carrusel del Bot:</Typography>
                    <Grid container spacing={2}>
                      {menuPreview.carousel.slice(0, 3).map((item, index) => (
                        <Grid item xs={4} key={index}>
                          <Card>
                            {item.image_url && (
                              <CardMedia
                                component="img"
                                height="120"
                                image={item.image_url}
                                alt={item.title}
                                sx={{ objectFit: 'cover' }}
                              />
                            )}
                            <CardContent sx={{ p: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontSize: '0.8rem' }}>
                                {item.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.subtitle?.substring(0, 50)}...
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Respuestas rápidas */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>⚡ Respuestas Rápidas:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {menuPreview.quick_replies.map((reply, index) => (
                        <Chip
                          key={index}
                          label={reply.title}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                ) : (
                  // Vista previa individual de actividad
                  <Card>
                    {menuPreview.photos && menuPreview.photos.length > 0 && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={menuPreview.photos[0]}
                        alt={menuPreview.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6">{menuPreview.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {menuPreview.description}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialog(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de galería de fotos */}
        <Dialog 
          open={photosDialog} 
          onClose={() => setPhotosDialog(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            📸 Galería de Fotos - {selectedActivityPhotos?.nombre}
          </DialogTitle>
          <DialogContent>
            {selectedActivityPhotos?.multimedia && selectedActivityPhotos.multimedia.length > 0 ? (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: 2,
                mt: 2
              }}>
                {selectedActivityPhotos.multimedia.map((photo, index) => (
                  <Card key={index} sx={{ height: '100%' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={photo.url || photo}
                      alt={photo.descripcion || `Foto ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    {photo.descripcion && (
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {photo.descripcion}
                        </Typography>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No hay fotos disponibles para esta actividad
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPhotosDialog(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </DashboardLayout>
  );
};

export default ActivitiesPage;
