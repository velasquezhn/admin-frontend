import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = { getItem: vi.fn(() => 'test-token') };
globalThis.localStorage = storage;
globalThis.sessionStorage = storage;
globalThis.fetch = vi.fn();

describe('acciones administrativas de reservas', () => {
  beforeEach(() => {
    vi.resetModules();
    fetch.mockReset();
    fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true, notificationSent: true }) });
  });

  it('usa la acción dedicada para aprobar y notificar', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.approveReservation(7);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/reservations/7/approve'), expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ Authorization: 'Bearer test-token' })
    }));
  });

  it('autoriza el pago antes del comprobante', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.authorizeReservationPayment(7);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/reservations/7/authorize-payment'), expect.objectContaining({ method: 'POST' }));
  });

  it('guarda el porcentaje y las cuentas de pago', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.updatePaymentSettings({ deposit_percentage: 50, bank_accounts: ['Banco - 123'], notes: '' });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/payment-settings'), expect.objectContaining({ method: 'PUT' }));
  });

  it('envía el motivo al rechazar', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.rejectReservation(8, 'Comprobante ilegible');
    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({ reason: 'Comprobante ilegible' }));
  });

  it('guarda administradores de WhatsApp desde configuración', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.createWhatsAppAdmin({ display_name: 'Carlos', phone_number: '50499990000' });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/whatsapp-admins'), expect.objectContaining({
      method: 'POST', body: JSON.stringify({ display_name: 'Carlos', phone_number: '50499990000' })
    }));
  });

  it('envía una prueba al administrador de WhatsApp', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.testWhatsAppAdmin(3);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/whatsapp-admins/3/test'), expect.objectContaining({ method: 'POST' }));
  });

  it('consulta las métricas reales del dashboard', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.getDashboardStats();
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/admin\/dashboard$/), expect.any(Object));
  });

  it('consulta ocupación usando un rango explícito', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.getOccupancyReport('2026-01-01', '2026-12-31');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/dashboard/occupancy?start_date=2026-01-01&end_date=2026-12-31'), expect.any(Object));
  });

  it('crea una copia de seguridad desde el panel', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.createBackup();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/backup/create'), expect.objectContaining({ method: 'POST' }));
  });

  it('convierte los campos numéricos al crear una reserva administrativa', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.createReservation({
      cabin_id: '2', user_id: '4', start_date: '2026-10-10', end_date: '2026-10-12',
      status: 'pendiente_autorizacion', total_price: '3000', personas: '3'
    });
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      cabin_id: 2, user_id: 4, total_price: 3000, number_of_people: 3
    });
  });

  it('cancela sin borrar físicamente mediante la acción administrativa', async () => {
    const { default: apiService } = await import('./apiService');
    await apiService.deleteReservation(9);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/reservations/9'), expect.objectContaining({ method: 'DELETE' }));
  });
});
