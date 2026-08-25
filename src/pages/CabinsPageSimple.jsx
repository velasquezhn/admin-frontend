import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CardMedia,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import apiService from '../services/apiService';

const CabinsPageSimple = () => {
  const [cabins, setCabins] = useState([]);
  const [filteredCabins, setFilteredCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCabin, setEditingCabin] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: '',
    precio_por_noche: '',
    descripcion: '',
    disponible: true
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchCabins();
  }, []);

  useEffect(() => {
    filterCabins();
  }, [cabins, filterType]);

  const fetchCabins = async () => {
    try {
      setLoading(true);
      console.log('[DEBUG] Fetching cabins...');
      const data = await apiService.getCabins();
      console.log('[DEBUG] Cabins data received:', data);
      setCabins(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching cabins:', err);
      setError('Error al cargar las cabañas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterCabins = () => {
    console.log('[DEBUG] Filtros - Tipo seleccionado:', filterType);
    console.log('[DEBUG] Filtros - Cabañas disponibles:', cabins);
    
    if (filterType === 'all') {
      setFilteredCabins(cabins);
    } else {
      const filtered = cabins.filter(cabin => {
        const cabinName = cabin.name || cabin.nombre || '';
        const cabinType = getCabinType(cabinName);
        const matches = cabinType === filterType;
        
        console.log(`[DEBUG] Cabaña: "${cabinName}" -> Tipo: "${cabinType}" -> Coincide con "${filterType}": ${matches}`);
        
        return matches;
      });
      
      console.log('[DEBUG] Cabañas filtradas:', filtered);
      setFilteredCabins(filtered);
    }
  };

  const getCabinType = (cabinName) => {
    if (!cabinName) return 'otro';
    
    const name = cabinName.toLowerCase();
    
    // Verificar cada tipo de cabaña
    if (name.includes('tortuga')) return 'tortuga';
    if (name.includes('delfín') || name.includes('delfin')) return 'delfin';
    if (name.includes('tiburón') || name.includes('tiburon')) return 'tiburon';
    if (name.includes('caracol')) return 'caracol';
    
    // Intentar con patrones más específicos
    const patterns = [
      { pattern: /tortuga/i, type: 'tortuga' },
      { pattern: /delfín?/i, type: 'delfin' },
      { pattern: /tiburón?/i, type: 'tiburon' },
      { pattern: /caracol/i, type: 'caracol' }
    ];
    
    for (const { pattern, type } of patterns) {
      if (pattern.test(cabinName)) {
        return type;
      }
    }
    
    return 'otro';
  };

  const getCabinStats = () => {
    const stats = cabins.reduce((acc, cabin) => {
      const type = getCabinType(cabin.name || cabin.nombre || '');
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  const handleOpenDialog = (cabin = null) => {
    setEditingCabin(cabin);
    if (cabin) {
      setFormData({
        nombre: cabin.nombre || '',
        capacidad: cabin.capacidad || '',
        precio_por_noche: cabin.precio_por_noche || '',
        descripcion: cabin.descripcion || '',
        disponible: cabin.disponible !== 0
      });
    } else {
      setFormData({
        nombre: '',
        capacidad: '',
        precio_por_noche: '',
        descripcion: '',
        disponible: true
      });
    }
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCabin(null);
    setSelectedFile(null);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      const cabinData = {
        ...formData,
        disponible: formData.disponible ? 1 : 0
      };

      if (selectedFile) {
        cabinData.photo = selectedFile;
      }

      if (editingCabin) {
        await apiService.updateCabin(editingCabin.id, cabinData);
      } else {
        await apiService.createCabin(cabinData);
      }
      await fetchCabins();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving cabin:', err);
      setError('Error al guardar la cabaña');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cabaña?')) {
      try {
        await apiService.deleteCabin(id);
        await fetchCabins();
      } catch (err) {
        console.error('Error deleting cabin:', err);
        setError('Error al eliminar la cabaña');
      }
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout title="Gestión de Cabañas">
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Cabañas ({cabins.length} totales)
          </Typography>
          <Box>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchCabins}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Nueva Cabaña
            </Button>
          </Box>
        </Box>

        {/* Estadísticas por tipo */}
        {cabins.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resumen por Tipo de Cabaña
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(getCabinStats()).map(([type, count]) => (
                <Grid item xs={6} sm={3} key={type}>
                  <Card sx={{ textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {count}
                      </Typography>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {type === 'tortuga' ? 'Tortuga (3p)' : 
                         type === 'delfin' ? 'Delfín (6p)' : 
                         type === 'tiburon' ? 'Tiburón (9p)' : 
                         type === 'caracol' ? 'Caracol (6p)' : type}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Filtros */}
        {cabins.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Filtrar por Tipo
            </Typography>
            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={(event, newFilter) => newFilter && setFilterType(newFilter)}
              aria-label="filtro de cabañas"
            >
              <ToggleButton value="all" aria-label="todas">
                Todas ({cabins.length})
              </ToggleButton>
              <ToggleButton value="tortuga" aria-label="tortuga">
                Tortuga ({getCabinStats().tortuga || 0})
              </ToggleButton>
              <ToggleButton value="delfin" aria-label="delfin">
                Delfín ({getCabinStats().delfin || 0})
              </ToggleButton>
              <ToggleButton value="tiburon" aria-label="tiburon">
                Tiburón ({getCabinStats().tiburon || 0})
              </ToggleButton>
              <ToggleButton value="caracol" aria-label="caracol">
                Caracol ({getCabinStats().caracol || 0})
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredCabins.length === 0 ? (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <HomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  {filterType === 'all' ? 'No hay cabañas registradas' : `No hay cabañas del tipo ${filterType}`}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {filterType === 'all' ? 'Comienza agregando la primera cabaña al sistema' : 'Prueba con otro filtro o agrega cabañas de este tipo'}
                </Typography>
                {filterType === 'all' && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Crear Primera Cabaña
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredCabins.map((cabin) => (
              <Grid item xs={12} sm={6} md={4} key={cabin.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {cabin.foto_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={cabin.foto_url}
                      alt={cabin.nombre}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" component="h2">
                          {cabin.name || cabin.nombre}
                        </Typography>
                        <Chip
                          label={getCabinType(cabin.name || cabin.nombre)}
                          color="primary"
                          size="small"
                          sx={{ textTransform: 'capitalize', mt: 0.5 }}
                        />
                      </Box>
                      <Chip
                        label={cabin.disponible ? 'Disponible' : 'No disponible'}
                        color={cabin.disponible ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {cabin.description || cabin.descripcion || 'Sin descripción'}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Capacidad:</strong> {cabin.capacity || cabin.capacidad} personas
                      </Typography>
                      <Typography variant="body2">
                        <strong>Precio:</strong> {formatCurrency(cabin.price || cabin.precio_por_noche)} / noche
                      </Typography>
                      <Typography variant="body2">
                        <strong>ID:</strong> {cabin.cabin_id || cabin.id}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(cabin)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(cabin.id)}
                      color="error"
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCabin ? 'Editar Cabaña' : 'Nueva Cabaña'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la Cabaña"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacidad (personas)"
                type="number"
                value={formData.capacidad}
                onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio por noche"
                type="number"
                value={formData.precio_por_noche}
                onChange={(e) => setFormData({ ...formData, precio_por_noche: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoIcon />}
                fullWidth
              >
                {selectedFile ? selectedFile.name : 'Seleccionar Foto'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.disponible}
                    onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                  />
                }
                label="Disponible para reservas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCabin ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default CabinsPageSimple;
