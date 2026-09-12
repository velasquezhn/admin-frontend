import { describe, expect, it } from 'vitest';

import {
  DEFAULT_RESERVATION_STATUS,
  findUserByPhone,
  normalizePhone,
  reservationErrorMessage
} from './reservationFormUtils';

describe('utilidades del formulario de reservas', () => {
  it('normaliza teléfonos con espacios, guiones y prefijo internacional', () => {
    expect(normalizePhone('+504 9970-0416')).toBe('+50499700416');
    expect(normalizePhone('50499700416')).toBe('+50499700416');
  });

  it('encuentra al usuario aunque el formato del teléfono sea diferente', () => {
    const users = [{ user_id: 7, phone_number: '+504 9970-0416' }];
    expect(findUserByPhone(users, '50499700416')).toEqual(users[0]);
  });

  it('usa el estado inicial aceptado por la API', () => {
    expect(DEFAULT_RESERVATION_STATUS).toBe('pendiente_autorizacion');
  });

  it('muestra el mensaje específico recibido de la API', () => {
    expect(reservationErrorMessage(new Error('Las fechas ya están ocupadas.')))
      .toBe('Las fechas ya están ocupadas.');
  });
});
