import { beforeEach, describe, expect, it, vi } from 'vitest';

const localStorageMock = { getItem: vi.fn(), removeItem: vi.fn() };
const sessionStorageMock = { getItem: vi.fn(), removeItem: vi.fn() };
globalThis.localStorage = localStorageMock;
globalThis.sessionStorage = sessionStorageMock;
globalThis.fetch = vi.fn();

describe('cliente HTTP autenticado', () => {
  beforeEach(() => {
    vi.resetModules();
    fetch.mockReset();
    localStorageMock.getItem.mockReset().mockReturnValue(null);
    sessionStorageMock.getItem.mockReset().mockReturnValue(null);
    localStorageMock.removeItem.mockReset();
    sessionStorageMock.removeItem.mockReset();
    fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
  });

  it('envía siempre las cookies de sesión', async () => {
    const { apiFetch } = await import('./httpClient');
    await apiFetch('/auth/verify', { method: 'POST' });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/verify'), expect.objectContaining({
      method: 'POST', credentials: 'include'
    }));
  });

  it('mantiene compatibilidad temporal con el token de la sesión anterior', async () => {
    sessionStorageMock.getItem.mockReturnValue('token-anterior');
    const { apiFetch } = await import('./httpClient');
    await apiFetch('/admin/cabins');
    expect(fetch.mock.calls[0][1].headers).toMatchObject({ Authorization: 'Bearer token-anterior' });
  });

  it('no envía Authorization con valores null o undefined', async () => {
    const { apiFetch } = await import('./httpClient');
    await apiFetch('/auth/verify');
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
  });

  it('borra tanto la sesión temporal como la anterior al cerrar sesión', async () => {
    const { clearClientSession } = await import('./httpClient');
    clearClientSession();
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('adminToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUser');
  });

  it('elimina automáticamente una sesión rechazada por el servidor', async () => {
    fetch.mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: 'Sesión inválida' }) });
    const { apiFetch } = await import('./httpClient');
    await apiFetch('/admin/cabins');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('adminToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUser');
  });
});
