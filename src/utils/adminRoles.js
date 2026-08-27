export const normalizeAdminRole = (value) => {
  const role = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return role === 'super_admin' || role === 'superadmin' ? 'superadmin' : 'admin';
};

export const currentAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    return { ...user, role: normalizeAdminRole(user.role) };
  } catch {
    return { role: 'admin' };
  }
};

export const isSuperadmin = () => currentAdmin().role === 'superadmin';
