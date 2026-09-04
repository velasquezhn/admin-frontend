import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = { getItem: vi.fn(() => 'qa-token') };
globalThis.localStorage = storage;
globalThis.sessionStorage = storage;
globalThis.fetch = vi.fn();

describe('servicio de tipos de cabaña', () => {
  beforeEach(() => {
    fetch.mockReset();
    fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) });
  });

  it('crea un tipo mediante la ruta administrativa', async () => {
    const { default: service } = await import('./cabinTypesService');
    const data = { type_key: 'familiar', nombre: 'Familiar' };
    await service.createCabinType(data);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/cabin-types'), expect.objectContaining({
      method: 'POST', body: JSON.stringify(data), headers: expect.objectContaining({ Authorization: 'Bearer qa-token' }),
    }));
  });

  it('muestra el mensaje de validación devuelto por la API', async () => {
    fetch.mockResolvedValue({ ok: false, status: 409, json: async () => ({ message: 'Ya existe un tipo de cabaña con esa clave' }) });
    const { default: service } = await import('./cabinTypesService');
    await expect(service.createCabinType({})).rejects.toThrow('Ya existe un tipo de cabaña con esa clave');
  });
});
