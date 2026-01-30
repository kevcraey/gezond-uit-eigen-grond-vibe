import {
  bepaalStofAdvies,
  bepaalGroentenAdvies,
  bepaalEierenAdvies,
  bepaalCdAdviesNiveau,
  GroentenInvoer,
  EierenInvoer,
  GroentenConfig,
  EierenConfig,
  DrempelWaarden
} from '../../src/common/domein/advies-config';

describe('advies-config', () => {
  describe('bepaalStofAdvies', () => {
    const drempels: DrempelWaarden = { groen: 100, geel: 200, oranje: 300, rood: 400 };

    it('returns groen for values below groen threshold', () => {
      expect(bepaalStofAdvies(50, drempels)).toBe('groen');
    });

    it('returns geel for values at or above geel threshold', () => {
      expect(bepaalStofAdvies(200, drempels)).toBe('geel');
      expect(bepaalStofAdvies(250, drempels)).toBe('geel');
    });

    it('returns oranje for values at or above oranje threshold', () => {
      expect(bepaalStofAdvies(300, drempels)).toBe('oranje');
    });

    it('returns rood for values at or above rood threshold', () => {
      expect(bepaalStofAdvies(400, drempels)).toBe('rood');
      expect(bepaalStofAdvies(500, drempels)).toBe('rood');
    });

    it('returns null for null values', () => {
      expect(bepaalStofAdvies(null, drempels)).toBe(null);
    });
  });

  describe('bepaalGroentenAdvies', () => {
    const mockConfig: Partial<GroentenConfig> = {
      stoffen: [
        { id: 'Pb', naam: 'Lood', eenheid: 'mg/kg' },
        { id: 'Cd', naam: 'Cadmium', eenheid: 'mg/kg' }
      ],
      drempels: {
        priveMetKippen: {
          Pb: { groen: 200, geel: 200, oranje: 560, rood: 560 },
          Cd: { groen: 6, oranje: 6, rood: 6.8 }
        }
      }
    };

    it('returns groen when all values are below thresholds', () => {
      const invoer: GroentenInvoer = {
        tuinType: 'priveMetKippen',
        postcode: '9000',
        waarden: { Pb: 100, Cd: 3 }
      };
      expect(bepaalGroentenAdvies(invoer, mockConfig as GroentenConfig)).toBe('groen');
    });

    it('returns worst case when multiple stoffen have issues', () => {
      const invoer: GroentenInvoer = {
        tuinType: 'priveMetKippen',
        postcode: '9000',
        waarden: { Pb: 250, Cd: 7 }  // Pb = geel, Cd = rood
      };
      expect(bepaalGroentenAdvies(invoer, mockConfig as GroentenConfig)).toBe('rood');
    });

    it('returns groen for unknown tuinType', () => {
      const invoer: GroentenInvoer = {
        tuinType: 'onbekend',
        postcode: '9000',
        waarden: { Pb: 1000, Cd: 100 }
      };
      expect(bepaalGroentenAdvies(invoer, mockConfig as GroentenConfig)).toBe('groen');
    });
  });

  describe('bepaalCdAdviesNiveau', () => {
    it('returns tot2 for Cd < 2', () => {
      expect(bepaalCdAdviesNiveau(1.5)).toBe('tot2');
    });

    it('returns 2tot5 for Cd between 2 and 5', () => {
      expect(bepaalCdAdviesNiveau(3)).toBe('2tot5');
    });

    it('returns 5tot10 for Cd between 5 and 10', () => {
      expect(bepaalCdAdviesNiveau(7)).toBe('5tot10');
    });

    it('returns boven10 for Cd >= 10', () => {
      expect(bepaalCdAdviesNiveau(12)).toBe('boven10');
    });

    it('returns null for null value', () => {
      expect(bepaalCdAdviesNiveau(null)).toBe(null);
    });
  });

  describe('bepaalEierenAdvies', () => {
    const mockConfig: Partial<EierenConfig> = {
      verhoudingen: {
        metGroenten: [
          { advies: '3eieren', aFactor: 12.3, bFactor: 3.9 },
          { advies: '2eieren', aFactor: 18.7, bFactor: 5.84 },
          { advies: '1ei', aFactor: 36.5, bFactor: 11.5 },
          { advies: 'afgeraden', aFactor: 856, bFactor: 470 }
        ],
        zonderGroenten: [
          { advies: '3eieren', aFactor: 12.3, bFactor: 3.9 },
          { advies: '2eieren', aFactor: 18.7, bFactor: 5.84 },
          { advies: '1ei', aFactor: 36.5, bFactor: 11.5 },
          { advies: 'afgeraden', aFactor: 856, bFactor: 470 }
        ]
      }
    };

    it('returns 3eieren for low values', () => {
      const invoer: EierenInvoer = { eetGroenten: true, PCDD_F: 1, DioxPCB: 1 };
      expect(bepaalEierenAdvies(invoer, mockConfig as EierenConfig)).toBe('3eieren');
    });

    it('returns afgeraden for high values', () => {
      const invoer: EierenInvoer = { eetGroenten: true, PCDD_F: 1000, DioxPCB: 500 };
      expect(bepaalEierenAdvies(invoer, mockConfig as EierenConfig)).toBe('afgeraden');
    });

    it('uses zonderGroenten verhoudingen when eetGroenten is false', () => {
      const invoer: EierenInvoer = { eetGroenten: false, PCDD_F: 1, DioxPCB: 1 };
      expect(bepaalEierenAdvies(invoer, mockConfig as EierenConfig)).toBe('3eieren');
    });
  });
});
