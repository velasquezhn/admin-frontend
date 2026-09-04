import { describe, expect, it } from 'vitest';
import { attentionNotificationCount } from './notificationStats';

describe('contador de mensajes que requieren atención', () => {
  it('suma pendientes y fallidos', () => {
    expect(attentionNotificationCount({ pending: 2, dead: 3, sent: 20 })).toBe(5);
  });

  it('tolera respuestas vacías o valores negativos', () => {
    expect(attentionNotificationCount()).toBe(0);
    expect(attentionNotificationCount({ pending: -2, dead: 1 })).toBe(1);
  });
});
