export const emptyCabinTypeForm = Object.freeze({
  type_key: '',
  nombre: '',
  tipo: 'cabana',
  capacidad: '',
  habitaciones: '',
  baños: '',
  precio_noche: '',
  descripcion: '',
  fotos: '',
  activo: true,
});

export function cabinTypeToForm(cabinType = {}) {
  return {
    ...emptyCabinTypeForm,
    ...cabinType,
    fotos: Array.isArray(cabinType.fotos) ? cabinType.fotos.join('\n') : (cabinType.fotos || ''),
  };
}

export function normalizeCabinTypeForm(form) {
  return {
    ...form,
    type_key: String(form.type_key || '').trim().toLowerCase(),
    nombre: String(form.nombre || '').trim(),
    tipo: String(form.tipo || '').trim(),
    capacidad: Number(form.capacidad),
    habitaciones: Number(form.habitaciones || 0),
    baños: Number(form.baños || 0),
    precio_noche: Number(form.precio_noche),
    descripcion: String(form.descripcion || '').trim(),
    fotos: String(form.fotos || '').split('\n').map((url) => url.trim()).filter(Boolean),
  };
}

export function validateCabinTypeForm(form, { creating = false } = {}) {
  const data = normalizeCabinTypeForm(form);
  if (creating && !/^[a-z0-9_]{2,40}$/.test(data.type_key)) {
    return 'La clave debe usar entre 2 y 40 letras minúsculas, números o guion bajo.';
  }
  if (!data.nombre) return 'El nombre es obligatorio.';
  if (!data.tipo) return 'El tipo es obligatorio.';
  if (!Number.isInteger(data.capacidad) || data.capacidad < 1) return 'La capacidad debe ser un número entero mayor que cero.';
  if (!Number.isInteger(data.habitaciones) || data.habitaciones < 0) return 'Las habitaciones deben ser un número entero igual o mayor que cero.';
  if (!Number.isInteger(data.baños) || data.baños < 0) return 'Los baños deben ser un número entero igual o mayor que cero.';
  if (!Number.isFinite(data.precio_noche) || data.precio_noche < 0) return 'El precio debe ser un número igual o mayor que cero.';
  if (data.fotos.some((url) => !/^https:\/\/.+\.(jpe?g|png|webp)(?:[?#].*)?$/i.test(url))) {
    return 'Cada fotografía debe ser una URL HTTPS en formato JPG, PNG o WEBP.';
  }
  return null;
}
