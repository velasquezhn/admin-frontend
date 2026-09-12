export const DEFAULT_RESERVATION_STATUS = 'pendiente_autorizacion';

export function normalizePhone(value = '') {
  const trimmed = String(value).trim();
  const digits = trimmed.replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

export function findUserByPhone(users, phone) {
  const expected = normalizePhone(phone);
  if (!expected) return null;
  return users.find((user) => normalizePhone(user.phone_number) === expected) || null;
}

export function reservationErrorMessage(error) {
  if (error instanceof Error && error.message) return error.message;
  return 'No se pudo guardar la reserva. Revise los datos e inténtelo nuevamente.';
}
