import { describe, expect, it } from 'vitest';
import { cabinTypeToForm, emptyCabinTypeForm, normalizeCabinTypeForm, validateCabinTypeForm } from './cabinTypeForm';

const valid = {
  type_key: 'familiar_2', nombre: 'Familiar', tipo: 'cabana', capacidad: '6',
  habitaciones: '2', baños: '1', precio_noche: '3500', fotos: 'https://example.com/uno.jpg\nhttps://example.com/dos.webp',
};

describe('formulario de tipos de cabaña', () => {
  it('normaliza números, clave y fotografías', () => {
    expect(normalizeCabinTypeForm({ ...valid, type_key: ' FAMILIAR_2 ' })).toMatchObject({
      type_key: 'familiar_2', capacidad: 6, precio_noche: 3500,
      fotos: ['https://example.com/uno.jpg', 'https://example.com/dos.webp'],
    });
  });

  it('acepta un tipo nuevo válido', () => {
    expect(validateCabinTypeForm(valid, { creating: true })).toBeNull();
  });

  it.each([
    [{ ...valid, type_key: 'Clave con espacios' }, 'clave'],
    [{ ...valid, capacidad: '0' }, 'capacidad'],
    [{ ...valid, precio_noche: '-1' }, 'precio'],
    [{ ...valid, fotos: 'http://example.com/foto.jpg' }, 'fotografía'],
  ])('rechaza datos inválidos', (form, fragment) => {
    expect(validateCabinTypeForm(form, { creating: true }).toLowerCase()).toContain(fragment);
  });

  it('convierte las fotos existentes a líneas editables', () => {
    expect(cabinTypeToForm({ ...emptyCabinTypeForm, fotos: ['https://example.com/a.jpg'] }).fotos)
      .toBe('https://example.com/a.jpg');
  });
});
