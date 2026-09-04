import { apiFetch } from './httpClient';

async function request(path, options = {}) {
  const response = await apiFetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `La solicitud falló (${response.status})`);
  return payload;
}

class CabinTypesService {
  getAllCabinTypes() {
    return request('/admin/cabin-types');
  }

  getCabinTypeByKey(typeKey) {
    return request(`/admin/cabin-types/${encodeURIComponent(typeKey)}`);
  }

  updateCabinType(typeKey, data) {
    return request(`/admin/cabin-types/${encodeURIComponent(typeKey)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  createCabinType(data) {
    return request('/admin/cabin-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  toggleCabinType(typeKey, activo) {
    return request(`/admin/cabin-types/${encodeURIComponent(typeKey)}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    });
  }

  getMenuPreview() {
    return request('/admin/cabin-types/preview/menu');
  }
}

export default new CabinTypesService();
