// Advies Configuration Types

export interface AdviesConfig {
  version: string;
  groenten: GroentenConfig;
  eieren: EierenConfig;
}

// =============================================================================
// GROENTEN
// =============================================================================

export interface StofConfig {
  id: string;
  naam: string;
  eenheid: string;
}

export interface TuinTypeConfig {
  id: string;
  label: string;
}

export interface DrempelWaarden {
  groen?: number;
  geel?: number;
  oranje?: number;
  rood?: number;
}

export interface CdAdviesNiveau {
  niveau: number;
  tekst: string;
}

export interface GroentenAdvies {
  titel: string;
  kleur: string;
  tekst: string;
  tips: string[];
  contact?: {
    email: string;
    telefoon: string;
  };
}

export interface GroentenConfig {
  stoffen: StofConfig[];
  tuinTypes: TuinTypeConfig[];
  drempels: {
    [tuinType: string]: {
      [stofId: string]: DrempelWaarden;
    };
  };
  cdUitzonderingPostcodes: string[];
  cdAdvies: {
    [niveau: string]: CdAdviesNiveau;
  };
  adviezen: {
    groen: GroentenAdvies;
    geel: GroentenAdvies;
    oranje: GroentenAdvies;
    rood: GroentenAdvies;
  };
}

// =============================================================================
// EIEREN
// =============================================================================

export interface VerhoudingConfig {
  advies: string;
  aFactor: number;
  bFactor: number;
}

export interface LeeftijdsAdvies {
  volwassenen: string;
  kinderen6tot12: string;
  kinderenOnder6: string;
}

export interface EierenAdvies {
  titel: string;
  kleur: string;
  tekst: string;
  tips: string[];
}

export interface EierenConfig {
  stoffen: StofConfig[];
  verhoudingen: {
    metGroenten: VerhoudingConfig[];
    zonderGroenten: VerhoudingConfig[];
  };
  leeftijdsadvies: {
    [adviesId: string]: LeeftijdsAdvies;
  };
  adviezen: {
    [adviesId: string]: EierenAdvies;
  };
}

// =============================================================================
// ADVIES ENGINE
// =============================================================================

export type AdviesKleur = 'groen' | 'geel' | 'oranje' | 'rood';

export interface GroentenInvoer {
  tuinType: string;
  postcode: string;
  waarden: { [stofId: string]: number | null };
}

export interface EierenInvoer {
  eetGroenten: boolean;
  PCDD_F: number;
  DioxPCB: number;
}

/**
 * Bepaalt de advieskleur voor een enkele stof
 */
export function bepaalStofAdvies(
  waarde: number | null,
  drempels: DrempelWaarden
): AdviesKleur | null {
  if (waarde === null || waarde === undefined) return null;

  // Check van hoog naar laag
  if (drempels.rood !== undefined && waarde >= drempels.rood) return 'rood';
  if (drempels.oranje !== undefined && waarde >= drempels.oranje) return 'oranje';
  if (drempels.geel !== undefined && waarde >= drempels.geel) return 'geel';
  if (drempels.groen !== undefined && waarde < drempels.groen) return 'groen';

  // Default naar groen als onder alle drempels
  return 'groen';
}

/**
 * Bepaalt het totale groenten advies (worst case van alle stoffen)
 */
export function bepaalGroentenAdvies(
  invoer: GroentenInvoer,
  config: GroentenConfig
): AdviesKleur {
  const drempelsVoorType = config.drempels[invoer.tuinType];
  if (!drempelsVoorType) return 'groen';

  const kleuren: AdviesKleur[] = [];
  const kleurNiveaus: { [k in AdviesKleur]: number } = {
    groen: 1,
    geel: 2,
    oranje: 3,
    rood: 4
  };

  for (const stof of config.stoffen) {
    const waarde = invoer.waarden[stof.id];
    const drempels = drempelsVoorType[stof.id];

    if (waarde !== null && waarde !== undefined && drempels) {
      const kleur = bepaalStofAdvies(waarde, drempels);
      if (kleur) kleuren.push(kleur);
    }
  }

  if (kleuren.length === 0) return 'groen';

  // Return worst case (hoogste niveau)
  return kleuren.reduce((worst, current) =>
    kleurNiveaus[current] > kleurNiveaus[worst] ? current : worst
  , 'groen' as AdviesKleur);
}

/**
 * Bepaalt het Cd-specifiek advies niveau
 */
export function bepaalCdAdviesNiveau(cdWaarde: number | null): string | null {
  if (cdWaarde === null || cdWaarde === undefined) return null;

  if (cdWaarde < 2) return 'tot2';
  if (cdWaarde < 5) return '2tot5';
  if (cdWaarde < 10) return '5tot10';
  return 'boven10';
}

/**
 * Bepaalt het eieren advies
 */
export function bepaalEierenAdvies(
  invoer: EierenInvoer,
  config: EierenConfig
): string {
  const verhoudingen = invoer.eetGroenten
    ? config.verhoudingen.metGroenten
    : config.verhoudingen.zonderGroenten;

  for (const v of verhoudingen) {
    const ratio = invoer.PCDD_F / v.aFactor + invoer.DioxPCB / v.bFactor;
    if (ratio < 1) {
      return v.advies;
    }
  }

  return 'afgeraden';
}
