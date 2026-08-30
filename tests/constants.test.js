import { PROVINCIAS_AR, CIUDADES_AR } from '@/utils/constants';

describe('Constantes (Constants)', () => {
  it('debe exportar PROVINCIAS_AR y CIUDADES_AR', () => {
    expect(PROVINCIAS_AR).toBeDefined();
    expect(Array.isArray(PROVINCIAS_AR)).toBe(true);
    expect(PROVINCIAS_AR.length).toBeGreaterThan(0);

    expect(CIUDADES_AR).toBeDefined();
    expect(typeof CIUDADES_AR).toBe('object');
    expect(Object.keys(CIUDADES_AR).length).toBeGreaterThan(0);
  });

  it('debe contener strings válidos en PROVINCIAS_AR', () => {
    expect(typeof PROVINCIAS_AR[0]).toBe('string');
  });
});
