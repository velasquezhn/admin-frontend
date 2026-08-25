import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Grid,
  Tooltip,
  Card,
  CardContent,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Key as KeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import adminUsersService from '../services/adminUsersService';
import DashboardLayout from '../components/Layout/DashboardLayout';

const AdminUsersPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' | 'edit'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'admin'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminUsersService.getAllAdmins();
      setAdmins(response.data || []);
    } catch (error) {
      showSnackbar('Error cargando administradores: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: 'admin'
    });
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowCurrentPassword(false);
  };

  const handleOpenDialog = (mode, admin = null) => {
    setDialogMode(mode);
    setSelectedAdmin(admin);
    
    if (mode === 'edit' && admin) {
      setFormData({
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name || '',
        password: '',
        role: admin.role
      });
    } else {
      resetForm();
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
    setSelectedAdmin(null);
  };

  const handleOpenPasswordDialog = (admin) => {
    setSelectedAdmin(admin);
    resetForm();
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    resetForm();
    setSelectedAdmin(null);
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        // Validaciones
        if (!formData.username || !formData.email || !formData.password) {
          showSnackbar('Todos los campos son requeridos', 'error');
          return;
        }
        
        if (formData.password.length < 8) {
          showSnackbar('La contraseña debe tener al menos 8 caracteres', 'error');
          return;
        }

        await adminUsersService.createAdmin(formData);
        showSnackbar('Administrador creado exitosamente');
      } else {
        // Editar
        if (!formData.username || !formData.email) {
          showSnackbar('Username y email son requeridos', 'error');
          return;
        }

        await adminUsersService.updateAdmin(selectedAdmin.id, {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role
        });
        showSnackbar('Administrador actualizado exitosamente');
      }

      handleCloseDialog();
      loadAdmins();
    } catch (error) {
      showSnackbar('Error: ' + error.message, 'error');
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      // Validaciones
      if (!passwordData.newPassword) {
        showSnackbar('Nueva contraseña es requerida', 'error');
        return;
      }
      
      if (passwordData.newPassword.length < 8) {
        showSnackbar('La contraseña debe tener al menos 8 caracteres', 'error');
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showSnackbar('Las contraseñas no coinciden', 'error');
        return;
      }

      // Si es el mismo usuario, requiere contraseña actual
      const isOwnAccount = selectedAdmin.id === currentUser.id;
      if (isOwnAccount && !passwordData.currentPassword) {
        showSnackbar('Contraseña actual es requerida', 'error');
        return;
      }

      await adminUsersService.changePassword(selectedAdmin.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      showSnackbar('Contraseña actualizada exitosamente');
      handleClosePasswordDialog();
    } catch (error) {
      showSnackbar('Error: ' + error.message, 'error');
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      await adminUsersService.toggleAdminStatus(admin.id, !admin.is_active);
      showSnackbar(`Administrador ${!admin.is_active ? 'activado' : 'desactivado'} exitosamente`);
      loadAdmins();
    } catch (error) {
      showSnackbar('Error: ' + error.message, 'error');
    }
  };

  const handleDelete = async (admin) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al administrador "${admin.username}"?`)) {
      try {
        await adminUsersService.deleteAdmin(admin.id);
        showSnackbar('Administrador eliminado exitosamente');
        loadAdmins();
      } catch (error) {
        showSnackbar('Error: ' + error.message, 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwnAccount = (admin) => admin.id === currentUser.id;

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Gestión de Administradores
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
          >
            Nuevo Administrador
          </Button>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Administradores
                </Typography>
                <Typography variant="h4">
                  {admins.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Activos
                </Typography>
                <Typography variant="h4" color="success.main">
                  {admins.filter(admin => admin.is_active).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Inactivos
                </Typography>
                <Typography variant="h4" color="error.main">
                  {admins.filter(admin => !admin.is_active).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Super Admins
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {admins.filter(admin => admin.role === 'super_admin').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de administradores */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Nombre Completo</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Creado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Cargando...</TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No hay administradores</TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {admin.username}
                        {isOwnAccount(admin) && (
                          <Chip size="small" label="Tú" color="primary" variant="outlined" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.full_name || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={admin.role}
                        color={admin.role === 'super_admin' ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={admin.is_active ? 'Activo' : 'Inactivo'}
                        color={admin.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(admin.created_at)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('edit', admin)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Cambiar contraseña">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenPasswordDialog(admin)}
                          >
                            <KeyIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {!isOwnAccount(admin) && (
                          <>
                            <Tooltip title={admin.is_active ? 'Desactivar' : 'Activar'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(admin)}
                              >
                                <Switch
                                  checked={admin.is_active}
                                  size="small"
                                />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(admin)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog para crear/editar administrador */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' ? 'Nuevo Administrador' : 'Editar Administrador'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Rol</InputLabel>
                    <Select
                      value={formData.role}
                      label="Rol"
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="super_admin">Super Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {dialogMode === 'create' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                      helperText="Mínimo 8 caracteres"
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'create' ? 'Crear' : 'Actualizar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para cambiar contraseña */}
        <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Cambiar Contraseña - {selectedAdmin?.username}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                {selectedAdmin && isOwnAccount(selectedAdmin) && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Contraseña Actual"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nueva Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      ),
                    }}
                    helperText="Mínimo 8 caracteres"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirmar Nueva Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                    helperText={
                      passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' 
                        ? 'Las contraseñas no coinciden' 
                        : ''
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordDialog}>Cancelar</Button>
            <Button onClick={handlePasswordSubmit} variant="contained">
              Cambiar Contraseña
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
