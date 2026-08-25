import { describe, expect, it } from 'vitest';
import { normalizeApiUrl } from './config';

describe('normalizeApiUrl', () => {
  it('elimina espacios y barras finales', () => {
    expect(normalizeApiUrl(' https://api.example.com/// ')).toBe('https://api.example.com');
  });

  it('acepta valores vacíos para el proxy de desarrollo', () => {
    expect(normalizeApiUrl()).toBe('');
  });
});
