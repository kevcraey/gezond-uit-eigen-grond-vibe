# Landingspagina en Adviestools Implementatie Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Landingspagina toevoegen met drie adviestools: bestaande wizard, groenten advies, eieren advies.

**Architecture:** Hash-based routing in `gezond-index.ts`, gedeelde kaart-component geëxtraheerd uit wizard, config-driven advieslogica.

**Tech Stack:** Lit 3.x, TypeScript, DOMG-WC components, OpenLayers (via @domg-wc/map)

---

## Task 1: Hash Router in gezond-index.ts

**Files:**
- Modify: `src/wizard/paginas/gezond-index.ts`

**Step 1: Update gezond-index.ts met hash routing**

```typescript
import '../../common/config/app.config';
import { defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { LitElement, TemplateResult, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { GezondWizard } from '../componenten/gezond-wizard';
import '../../common/componenten/gezond-template';

registerWebComponents([GezondWizard]);

type Route = 'landing' | 'doe-de-test' | 'advies-groenten' | 'advies-eieren';

export class GezondIndex extends LitElement {
  @state() private currentRoute: Route = 'landing';

  static get styles() {
    return [
      css`
        :host {
          display: block;
          min-height: 100vh;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
      `
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleHashChange();
    window.addEventListener('hashchange', this._handleHashChange.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._handleHashChange.bind(this));
  }

  private _handleHashChange() {
    const hash = window.location.hash.slice(1) || 'landing';
    const validRoutes: Route[] = ['landing', 'doe-de-test', 'advies-groenten', 'advies-eieren'];
    this.currentRoute = validRoutes.includes(hash as Route) ? (hash as Route) : 'landing';
  }

  protected render(): TemplateResult {
    return html`
      <gezond-template>
        <div class="container">
          ${this._renderRoute()}
        </div>
      </gezond-template>
    `;
  }

  private _renderRoute(): TemplateResult {
    switch (this.currentRoute) {
      case 'doe-de-test':
        return html`<gezond-wizard></gezond-wizard>`;
      case 'advies-groenten':
        return html`<p>Advies groenten - komt later</p>`;
      case 'advies-eieren':
        return html`<p>Advies eieren - komt later</p>`;
      case 'landing':
      default:
        return html`<p>Landing page - komt later</p>`;
    }
  }
}

defineWebComponent(GezondIndex, 'gezond-index');
```

**Step 2: Test handmatig**

Run: `cd gezond-uit-eigen-grond && npm run dev`

Test:
- `http://localhost:9000/` → toont "Landing page - komt later"
- `http://localhost:9000/#doe-de-test` → toont bestaande wizard
- `http://localhost:9000/#advies-groenten` → toont placeholder
- `http://localhost:9000/#advies-eieren` → toont placeholder

**Step 3: Commit**

```bash
git add src/wizard/paginas/gezond-index.ts
git commit -m "feat: hash routing toevoegen aan gezond-index"
```

---

## Task 2: Landingspagina Component

**Files:**
- Create: `src/landing/componenten/gezond-landing-page.ts`
- Modify: `src/wizard/paginas/gezond-index.ts`

**Step 1: Maak directory structuur**

```bash
mkdir -p src/landing/componenten
```

**Step 2: Maak gezond-landing-page.ts**

```typescript
import { BaseLitElement, defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlTitleComponent } from '@domg-wc/components/atom';
import { VlInfoTile } from '@domg-wc/components/block/info-tile';
import { vlGridStyles, vlColumnStyles } from '@domg-wc/styles';
import { TemplateResult, html, css } from 'lit';

registerWebComponents([VlButtonComponent, VlTitleComponent, VlInfoTile]);

interface TileConfig {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  route: string;
}

export class GezondLandingPage extends BaseLitElement {
  private tiles: TileConfig[] = [
    {
      id: 'doe-de-test',
      title: 'Doe de test',
      description: 'Ontdek of jouw locatie geschikt is voor een moestuin of kippen. We checken risicofactoren zoals PFAS-zones, nabijheid van wegen en spoorlijnen, en gekende verontreinigingen.',
      buttonLabel: 'Start de test',
      route: '#doe-de-test'
    },
    {
      id: 'advies-groenten',
      title: 'Advies groenten',
      description: 'Je hebt labo-resultaten van je bodemstaal? Vul de gemeten waarden voor zware metalen in en ontvang een persoonlijk advies over groenten telen in je tuin.',
      buttonLabel: 'Vraag advies',
      route: '#advies-groenten'
    },
    {
      id: 'advies-eieren',
      title: 'Advies eieren',
      description: 'Je hebt labo-resultaten voor dioxines en PCB\'s? Vul de gemeten waarden in en ontdek hoeveel eieren van je eigen kippen je veilig kan eten.',
      buttonLabel: 'Vraag advies',
      route: '#advies-eieren'
    }
  ];

  static get styles() {
    return [
      vlGridStyles,
      vlColumnStyles,
      css`
        :host {
          display: block;
        }
        .intro {
          margin-bottom: 2rem;
        }
        .intro ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .tiles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .tile-wrapper {
          height: 100%;
        }
        vl-info-tile {
          height: 100%;
        }
      `
    ];
  }

  protected render(): TemplateResult {
    return html`
      <div class="intro">
        <vl-title type="h1">Gezond uit eigen grond</vl-title>
        <p>Wil je weten of je veilig groenten kan kweken of kippen kan houden in je tuin? Kies hieronder wat je wil doen:</p>
        <ul>
          <li><strong>Nog geen labo-resultaten?</strong> Doe eerst de test om te zien of jouw locatie geschikt is.</li>
          <li><strong>Wel labo-resultaten?</strong> Vraag direct advies over groenten of eieren.</li>
        </ul>
      </div>

      <div class="tiles-grid">
        ${this.tiles.map(tile => this._renderTile(tile))}
      </div>
    `;
  }

  private _renderTile(tile: TileConfig): TemplateResult {
    return html`
      <div class="tile-wrapper">
        <vl-info-tile>
          <span slot="title">${tile.title}</span>
          <span slot="content">${tile.description}</span>
          <div slot="footer">
            <vl-button @click=${() => this._navigateTo(tile.route)}>${tile.buttonLabel}</vl-button>
          </div>
        </vl-info-tile>
      </div>
    `;
  }

  private _navigateTo(route: string) {
    window.location.hash = route;
  }
}

defineWebComponent(GezondLandingPage, 'gezond-landing-page');
```

**Step 3: Update gezond-index.ts om landing page te importeren**

Voeg bovenaan toe:
```typescript
import '../../landing/componenten/gezond-landing-page';
```

Wijzig `_renderRoute()`:
```typescript
private _renderRoute(): TemplateResult {
  switch (this.currentRoute) {
    case 'doe-de-test':
      return html`<gezond-wizard></gezond-wizard>`;
    case 'advies-groenten':
      return html`<p>Advies groenten - komt later</p>`;
    case 'advies-eieren':
      return html`<p>Advies eieren - komt later</p>`;
    case 'landing':
    default:
      return html`<gezond-landing-page></gezond-landing-page>`;
  }
}
```

**Step 4: Test handmatig**

Run: `npm run dev`

Test:
- `http://localhost:9000/` → toont landingspagina met 3 tegels
- Klik op "Start de test" → navigeert naar `#doe-de-test`
- Klik op browser terug → terug naar landing

**Step 5: Commit**

```bash
git add src/landing/componenten/gezond-landing-page.ts src/wizard/paginas/gezond-index.ts
git commit -m "feat: landingspagina met drie tegels"
```

---

## Task 3: Advies Config Bestand

**Files:**
- Create: `src/public/advies-config.json`

**Step 1: Maak advies-config.json**

```json
{
  "version": "1.0.0",
  "groenten": {
    "stoffen": [
      { "id": "As", "naam": "Arseen", "eenheid": "mg/kg" },
      { "id": "Cd", "naam": "Cadmium", "eenheid": "mg/kg" },
      { "id": "Cr", "naam": "Chroom", "eenheid": "mg/kg" },
      { "id": "Hg", "naam": "Kwik", "eenheid": "mg/kg" },
      { "id": "Pb", "naam": "Lood", "eenheid": "mg/kg" },
      { "id": "Ni", "naam": "Nikkel", "eenheid": "mg/kg" },
      { "id": "BaP", "naam": "Benzo(a)pyreen", "eenheid": "mg/kg" }
    ],
    "tuinTypes": [
      { "id": "priveMetKippen", "label": "Privé-groentetuin met kippen" },
      { "id": "priveZonderKippen", "label": "Privé-groentetuin zonder kippen" },
      { "id": "volkstuin", "label": "Volkstuin" }
    ],
    "drempels": {
      "priveMetKippen": {
        "As":  { "groen": 103, "oranje": 103, "rood": 103 },
        "Cd":  { "groen": 6, "oranje": 6, "rood": 6.8 },
        "Cr":  { "groen": 120, "geel": 240, "oranje": 260, "rood": 260 },
        "Hg":  { "groen": 1 },
        "Pb":  { "groen": 200, "geel": 200, "oranje": 560, "rood": 560 },
        "Ni":  { "groen": 100, "geel": 100, "oranje": 125, "rood": 157 },
        "BaP": { "groen": 3.6, "geel": 4.9, "oranje": 6.3, "rood": 6.3 }
      },
      "priveZonderKippen": {
        "As":  { "groen": 103, "oranje": 103, "rood": 103 },
        "Cd":  { "groen": 6, "oranje": 6, "rood": 6.8 },
        "Cr":  { "groen": 120, "geel": 240, "oranje": 265, "rood": 265 },
        "Hg":  { "groen": 1 },
        "Pb":  { "groen": 200, "geel": 200, "oranje": 560, "rood": 560 },
        "Ni":  { "groen": 100, "geel": 100, "oranje": 150, "rood": 200 },
        "BaP": { "groen": 3.6, "geel": 4.9, "oranje": 6.3, "rood": 6.3 }
      },
      "volkstuin": {
        "As":  { "groen": 103, "oranje": 103, "rood": 103 },
        "Cd":  { "groen": 6, "geel": 4.8, "oranje": 6.8, "rood": 6.8 },
        "Cr":  { "groen": 120, "geel": 240, "oranje": 265, "rood": 265 },
        "Hg":  { "groen": 1 },
        "Pb":  { "groen": 275, "geel": 275, "oranje": 560, "rood": 560 },
        "Ni":  { "groen": 125, "geel": 125, "oranje": 265, "rood": 447 },
        "BaP": { "groen": 7.3, "geel": 7.3, "oranje": 16, "rood": 16 }
      }
    },
    "cdUitzonderingPostcodes": ["2660", "2620", "2340", "2400", "2490", "3920", "3900", "3910", "3930"],
    "cdAdvies": {
      "tot2": {
        "niveau": 1,
        "tekst": "Alle groentensoorten zijn mogelijk indien de bodem niet te zuur is, voldoende organisch stof bevat en groenten grondig gewassen en geschild worden."
      },
      "2tot5": {
        "niveau": 2,
        "tekst": "Vermijd het telen van: andijvie, kervel, peterselie, rabarber, schorseneren, selder, sla, spinazie, tuinkers, veldsla en waterkers."
      },
      "5tot10": {
        "niveau": 3,
        "tekst": "Vermijd ook: aardappelen, aardbeien, bloemkool, prei, radijs, sjalot, ui, witlof en wortelen."
      },
      "boven10": {
        "niveau": 4,
        "tekst": "Vermijd ook: bonen, erwten, paprika en tomaat. Neem contact op met OVAM."
      }
    },
    "adviezen": {
      "groen": {
        "titel": "Goed nieuws!",
        "kleur": "#3c763d",
        "tekst": "Op basis van de resultaten van het onderzoek van je groentetuin kan je zonder beperking genieten van je tuin.",
        "tips": [
          "Was na het werken in de tuin je handen.",
          "Was groenten uit de tuin altijd goed of schil ze eventueel.",
          "Bekijk de tips uit de praktijkgids op www.gezonduiteigengrond.be."
        ]
      },
      "geel": {
        "titel": "Lichte aandacht nodig",
        "kleur": "#8a6d3b",
        "tekst": "Je kan groenten telen in je tuin. De resultaten van je tuinonderzoek tonen aan dat de hoeveelheid van een of meerdere stoffen wat hoger is. Dat komt op vele plaatsen in Vlaanderen voor.",
        "tips": [
          "Zorg voor variatie in soort groenten en afwisseling tussen groenten uit eigen tuin en uit de winkel.",
          "Zorg voor een goede zuurtegraad (pH) door te bekalken en organisch stofgehalte door te bemesten.",
          "Was na het werken in de tuin je handen.",
          "Was groenten uit de tuin altijd goed of schil ze eventueel.",
          "Vermijd om grond uit de tuin in huis te brengen en poets met nat."
        ]
      },
      "oranje": {
        "titel": "Aandacht nodig",
        "kleur": "#a94442",
        "tekst": "De resultaten van je tuinonderzoek tonen aan dat de concentraties van een of meerdere stoffen wat hoger zijn, zoals op vele plaatsen in Vlaanderen. Om groenten te kunnen telen, hou je best rekening met volgend advies.",
        "tips": [
          "Vervang in de moestuin de bovenste 50 cm door een propere laag teelaarde of kweek je groenten in bakken.",
          "Zorg voor een goede zuurtegraad en organisch stofgehalte.",
          "Zorg voor variatie in soort groenten en afkomst (eigen tuin, winkel).",
          "Was groenten uit je tuin altijd goed of schil ze eventueel.",
          "Probeer de oorzaak van de vervuiling te achterhalen."
        ]
      },
      "rood": {
        "titel": "Neem contact op met OVAM",
        "kleur": "#a94442",
        "tekst": "De resultaten van je tuinonderzoek tonen aan dat de waarden wat hoger zijn vergeleken met gezondheidskundige richtlijnen. Neem contact op met OVAM om een advies op maat van je tuin te vragen.",
        "contact": {
          "email": "bodem@ovam.be",
          "telefoon": "015 28 41 38"
        },
        "tips": [
          "Was na het werken in de tuin je handen.",
          "Laat kinderen niet spelen in de volle grond.",
          "Eet geen groenten uit de tuin totdat je advies van OVAM hebt gekregen."
        ]
      }
    }
  },
  "eieren": {
    "stoffen": [
      { "id": "PCDD_F", "naam": "PCDD/F's", "eenheid": "ng/kg ds" },
      { "id": "DioxPCB", "naam": "Dioxineachtige PCB's", "eenheid": "ng/kg ds" }
    ],
    "verhoudingen": {
      "metGroenten": [
        { "advies": "3eieren", "aFactor": 12.3, "bFactor": 3.9 },
        { "advies": "2eieren", "aFactor": 18.7, "bFactor": 5.84 },
        { "advies": "1ei", "aFactor": 36.5, "bFactor": 11.5 },
        { "advies": "afgeraden", "aFactor": 856, "bFactor": 470 }
      ],
      "zonderGroenten": [
        { "advies": "3eieren", "aFactor": 12.3, "bFactor": 3.9 },
        { "advies": "2eieren", "aFactor": 18.7, "bFactor": 5.84 },
        { "advies": "1ei", "aFactor": 36.5, "bFactor": 11.5 },
        { "advies": "afgeraden", "aFactor": 856, "bFactor": 470 }
      ]
    },
    "leeftijdsadvies": {
      "3eieren": { "volwassenen": "3 eieren/week", "kinderen6tot12": "2 eieren/week", "kinderenOnder6": "1 ei/week" },
      "2eieren": { "volwassenen": "2 eieren/week", "kinderen6tot12": "1 ei/week", "kinderenOnder6": "1 ei per 14 dagen" },
      "1ei": { "volwassenen": "1 ei/week", "kinderen6tot12": "1 ei per 14 dagen", "kinderenOnder6": "Afgeraden" },
      "afgeraden": { "volwassenen": "Afgeraden", "kinderen6tot12": "Afgeraden", "kinderenOnder6": "Afgeraden" }
    },
    "adviezen": {
      "3eieren": {
        "titel": "3 eieren per week",
        "kleur": "#3c763d",
        "tekst": "Je kan de eieren van je eigen kippen eten. Om een te hoog cholesterolgehalte te vermijden, eet je best niet te veel eieren.",
        "tips": [
          "Geniet van je tuin, maar kijk ook even op www.gezonduiteigengrond.be/kippen-houden voor algemeen preventieve adviezen."
        ]
      },
      "2eieren": {
        "titel": "2 eieren per week",
        "kleur": "#8a6d3b",
        "tekst": "Op basis van de meetresultaten voor dioxines en PCB's in de bodem van de kippenren is het aangeraden om het aantal eieren te beperken.",
        "tips": [
          "Kijk op www.gezonduiteigengrond.be/kippen-houden voor hoe je jouw kippenren best inricht."
        ]
      },
      "1ei": {
        "titel": "1 ei per week",
        "kleur": "#a94442",
        "tekst": "Op basis van de meetresultaten voor dioxines en PCB's in de bodem van de kippenren is het aangeraden om het aantal eieren sterk te beperken.",
        "tips": [
          "Kijk op www.gezonduiteigengrond.be/kippen-houden voor hoe je jouw kippenren best inricht.",
          "Overweeg om de grond van de kippenren te vervangen."
        ]
      },
      "afgeraden": {
        "titel": "Eieren afgeraden",
        "kleur": "#a94442",
        "tekst": "Op basis van de meetresultaten voor dioxines en PCB's in de bodem van de kippenren is het afgeraden om eieren van je eigen kippen te eten.",
        "tips": [
          "Neem contact op met een deskundige voor advies over sanering van de kippenren."
        ]
      }
    }
  }
}
```

**Step 2: Commit**

```bash
git add src/public/advies-config.json
git commit -m "feat: advies configuratie voor groenten en eieren"
```

---

## Task 4: Advies Config Types

**Files:**
- Create: `src/common/domein/advies-config.ts`

**Step 1: Maak advies-config.ts**

```typescript
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
```

**Step 2: Test de logica**

Maak test bestand `test/domein/advies-config.test.ts`:

```typescript
import { bepaalStofAdvies, bepaalGroentenAdvies, bepaalEierenAdvies, AdviesKleur, GroentenInvoer, EierenInvoer, GroentenConfig, EierenConfig, DrempelWaarden } from '../../src/common/domein/advies-config';

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
  });
});
```

**Step 3: Run tests**

Run: `npm test`

Expected: All tests pass

**Step 4: Commit**

```bash
git add src/common/domein/advies-config.ts test/domein/advies-config.test.ts
git commit -m "feat: advies config types en regel engine"
```

---

## Task 5: Gedeelde Kaart Component

**Files:**
- Create: `src/common/componenten/gezond-kaart-invoer.ts`
- Modify: `src/common/services/spatial.service.ts`

**Step 1: Extend SpatialService voor postcode extractie**

Voeg toe aan `spatial.service.ts`:

```typescript
/**
 * Extracts postcode from geolocation response
 */
async getPostcodeFromCoordinates(x: number, y: number): Promise<string | null> {
  try {
    const response = await fetch(`${SpatialService.GEOLOCATION_API_URL}?xy=${x},${y}`);
    if (!response.ok) {
      throw new Error(`Geolocation API failed: ${response.statusText}`);
    }
    const data = await response.json();

    if (data && data.LocationResult && data.LocationResult.length > 0) {
      const result = data.LocationResult[0];
      // Extract postcode from the response - adjust based on actual API response structure
      return result.Zipcode || result.PostalCode || this._extractPostcodeFromAddress(result.FormattedAddress);
    }
    return null;
  } catch (error) {
    console.error('SpatialService: Error fetching postcode', error);
    return null;
  }
}

private _extractPostcodeFromAddress(address: string): string | null {
  if (!address) return null;
  // Belgian postcodes are 4 digits
  const match = address.match(/\b(\d{4})\b/);
  return match ? match[1] : null;
}
```

**Step 2: Maak gezond-kaart-invoer.ts**

```typescript
import { BaseLitElement, defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlTitleComponent } from '@domg-wc/components/atom';
import {
  VlMap,
  VlMapBaseLayerGRBGray,
  VlMapFeaturesLayer,
  VlMapSearch,
  VlMapDrawPolygonAction,
  VlMapLayerStyle,
  VlMapModifyAction
} from '@domg-wc/map';
import { VlModalComponent } from '@domg-wc/components/block/modal';
import { TemplateResult, html, css } from 'lit';
import { state, property, query } from 'lit/decorators.js';
import { spatialService } from '../services/spatial.service';

registerWebComponents([
  VlButtonComponent,
  VlTitleComponent,
  VlMap,
  VlMapBaseLayerGRBGray,
  VlMapFeaturesLayer,
  VlMapSearch,
  VlMapDrawPolygonAction,
  VlMapLayerStyle,
  VlMapModifyAction,
  VlModalComponent
]);

export interface LocationData {
  geometry: any;
  coordinates: [number, number];
  address: string;
  postcode: string | null;
  wkt: string;
}

export class GezondKaartInvoer extends BaseLitElement {
  @property({ type: String }) label = 'Teken je tuin in op de kaart';
  @property({ type: String }) description = 'Zoek eerst je adres via de zoekbalk, en teken daarna de exacte locatie.';

  @state() private drawnPolygon: any = null;
  @state() private address: string = '';
  @state() private postcode: string | null = null;
  @state() private showDeleteModal: boolean = false;
  @state() private isEditing: boolean = false;

  @query('vl-map') private mapElement: any;

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .map-container {
        position: relative;
        height: 400px;
        margin: 1rem 0;
      }
      .map-controls {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;
        display: flex;
        gap: 10px;
      }
      .location-info {
        margin-top: 1rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
      }
      .location-info p {
        margin: 0.25rem 0;
      }
    `;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;
    this._bindMapActions();
  }

  private _bindMapActions() {
    const drawAction = this.shadowRoot?.querySelector('#draw-polygon-action') as any;
    if (drawAction) {
      drawAction.onDraw(this._handlePolygonDrawn.bind(this));
    }

    const modifyAction = this.shadowRoot?.querySelector('#modify-polygon-action') as any;
    if (modifyAction) {
      modifyAction.onModify(this._handlePolygonModified.bind(this));
    }
  }

  protected render(): TemplateResult {
    const hasPolygon = this.drawnPolygon !== null;

    return html`
      <p>${this.description}</p>

      <div class="map-container">
        <vl-map>
          <vl-map-baselayer-grb-gray></vl-map-baselayer-grb-gray>
          <vl-map-search></vl-map-search>

          <div class="map-controls">
            <vl-button
              icon="pencil"
              @click=${this._toggleEditMode}
              ?disabled=${!hasPolygon || this.showDeleteModal}>
              ${this.isEditing ? 'Klaar' : 'Aanpassen'}
            </vl-button>
            <vl-button
              error
              icon="trash"
              @click=${this._requestDelete}
              ?disabled=${!hasPolygon || this.isEditing}>
              Verwijder
            </vl-button>
          </div>

          <vl-map-features-layer name="polygon-layer">
            <vl-map-layer-style
              border-color="rgba(0, 85, 204, 1)"
              border-size="2"
              color="rgba(0, 85, 204, 0.3)">
            </vl-map-layer-style>
            <vl-map-draw-polygon-action
              id="draw-polygon-action"
              .active=${!this.isEditing}>
            </vl-map-draw-polygon-action>
            <vl-map-modify-action
              id="modify-polygon-action"
              .active=${this.isEditing}>
            </vl-map-modify-action>
          </vl-map-features-layer>
        </vl-map>
      </div>

      <vl-modal
        title="Bent u zeker?"
        ?open=${this.showDeleteModal}
        @close=${this._cancelDelete}
        not-cancellable>
        <p slot="content">Alles wat u getekend hebt zal verwijderd worden.</p>
        <div slot="button">
          <vl-button secondary @click=${this._cancelDelete}>Annuleer</vl-button>
          <vl-button @click=${this._confirmDelete}>OK</vl-button>
        </div>
      </vl-modal>

      ${hasPolygon ? html`
        <div class="location-info">
          <p><strong>Adres:</strong> ${this.address || 'Wordt bepaald...'}</p>
          ${this.postcode ? html`<p><strong>Postcode:</strong> ${this.postcode}</p>` : ''}
        </div>
      ` : html`
        <p style="color: #666;">Teken een polygoon op de kaart om je locatie aan te duiden.</p>
      `}
    `;
  }

  private async _handlePolygonDrawn(eventOrFeature: any) {
    let feature = eventOrFeature;
    if (eventOrFeature instanceof CustomEvent) {
      feature = eventOrFeature.detail?.feature;
    }

    if (feature) {
      this.drawnPolygon = feature;
      await this._processPolygon(feature);
    }
  }

  private async _handlePolygonModified(_e: any) {
    if (this.drawnPolygon) {
      await this._processPolygon(this.drawnPolygon);
    }
  }

  private async _processPolygon(feature: any) {
    const geometry = feature.getGeometry();
    if (!geometry) return;

    const extent = geometry.getExtent();
    const centerX = (extent[0] + extent[2]) / 2;
    const centerY = (extent[1] + extent[3]) / 2;
    const wkt = this._extractWkt(feature);

    // Get address and postcode
    this.address = 'Locatie bepalen...';

    try {
      const [address, postcode] = await Promise.all([
        spatialService.reverseGeocode(centerX, centerY),
        spatialService.getPostcodeFromCoordinates(centerX, centerY)
      ]);

      this.address = address || `Locatie: ${centerX.toFixed(2)}, ${centerY.toFixed(2)}`;
      this.postcode = postcode;
    } catch (e) {
      console.error('Error resolving location:', e);
      this.address = `Locatie: ${centerX.toFixed(2)}, ${centerY.toFixed(2)}`;
    }

    // Dispatch event with location data
    const locationData: LocationData = {
      geometry,
      coordinates: [centerX, centerY],
      address: this.address,
      postcode: this.postcode,
      wkt
    };

    this.dispatchEvent(new CustomEvent('location-changed', {
      detail: locationData,
      bubbles: true,
      composed: true
    }));
  }

  private _extractWkt(feature: any): string {
    if (!feature) return '';
    const geometry = feature.getGeometry();
    if (!geometry) return '';

    const coords = geometry.getCoordinates();
    const rings = coords.map((ring: any[]) => {
      return '(' + ring.map(c => `${c[0]} ${c[1]}`).join(', ') + ')';
    }).join(', ');

    return `POLYGON(${rings})`;
  }

  private _toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  private _requestDelete() {
    this.showDeleteModal = true;
  }

  private _cancelDelete() {
    this.showDeleteModal = false;
  }

  private _confirmDelete() {
    this.drawnPolygon = null;
    this.address = '';
    this.postcode = null;
    this._clearPolygonFromLayer();
    this.showDeleteModal = false;
    this.isEditing = false;

    this.dispatchEvent(new CustomEvent('location-cleared', {
      bubbles: true,
      composed: true
    }));
  }

  private _clearPolygonFromLayer() {
    const featuresLayer = this.shadowRoot?.querySelector('vl-map-features-layer[name="polygon-layer"]') as any;
    if (featuresLayer && featuresLayer.layer) {
      featuresLayer.layer.getSource().clear();
    }
  }

  // Public method to check if location is set
  public hasLocation(): boolean {
    return this.drawnPolygon !== null;
  }

  // Public method to get current location data
  public getLocationData(): LocationData | null {
    if (!this.drawnPolygon) return null;

    const geometry = this.drawnPolygon.getGeometry();
    const extent = geometry.getExtent();
    const centerX = (extent[0] + extent[2]) / 2;
    const centerY = (extent[1] + extent[3]) / 2;

    return {
      geometry,
      coordinates: [centerX, centerY],
      address: this.address,
      postcode: this.postcode,
      wkt: this._extractWkt(this.drawnPolygon)
    };
  }
}

defineWebComponent(GezondKaartInvoer, 'gezond-kaart-invoer');
```

**Step 3: Commit**

```bash
git add src/common/componenten/gezond-kaart-invoer.ts src/common/services/spatial.service.ts
git commit -m "feat: gedeelde kaart-invoer component met postcode extractie"
```

---

## Task 6: Groenten Advies Component

**Files:**
- Create: `src/groenten/componenten/gezond-groenten-advies.ts`
- Modify: `src/wizard/paginas/gezond-index.ts`

**Step 1: Maak directory**

```bash
mkdir -p src/groenten/componenten
```

**Step 2: Maak gezond-groenten-advies.ts**

```typescript
import { BaseLitElement, defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlTitleComponent } from '@domg-wc/components/atom';
import { VlAlert } from '@domg-wc/components/block/alert';
import { VlWizard, VlWizardPane } from '@domg-wc/components/block/wizard';
import { VlFormLabelComponent, VlInputFieldComponent } from '@domg-wc/components/form';
import { VlRadioComponent, VlRadioGroupComponent } from '@domg-wc/components/form/radio-group';
import { vlGridStyles, vlStackedStyles } from '@domg-wc/styles';
import { TemplateResult, html, css, nothing } from 'lit';
import { state, query } from 'lit/decorators.js';
import '../../common/componenten/gezond-kaart-invoer';
import { GezondKaartInvoer, LocationData } from '../../common/componenten/gezond-kaart-invoer';
import {
  AdviesConfig,
  GroentenInvoer,
  bepaalGroentenAdvies,
  bepaalCdAdviesNiveau,
  AdviesKleur
} from '../../common/domein/advies-config';

registerWebComponents([
  VlButtonComponent,
  VlTitleComponent,
  VlAlert,
  VlWizard,
  VlWizardPane,
  VlFormLabelComponent,
  VlInputFieldComponent,
  VlRadioGroupComponent,
  VlRadioComponent
]);

export class GezondGroentenAdvies extends BaseLitElement {
  @state() private config: AdviesConfig | null = null;
  @state() private activeStep: number = 1;

  // Stap 1: Locatie
  @state() private locationData: LocationData | null = null;

  // Stap 2: Gegevens
  @state() private tuinType: string = '';
  @state() private waarden: { [stofId: string]: number | null } = {};

  // Stap 3: Resultaat
  @state() private adviesKleur: AdviesKleur | null = null;
  @state() private cdAdviesNiveau: string | null = null;

  @query('gezond-kaart-invoer') private kaartInvoer!: GezondKaartInvoer;

  static get styles() {
    return [
      vlGridStyles,
      vlStackedStyles,
      css`
        :host {
          display: block;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .stoffen-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .stof-input {
          display: flex;
          flex-direction: column;
        }
        .stof-input label {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .stof-input small {
          color: #666;
          margin-top: 0.25rem;
        }
        .result-card {
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .result-card.groen { background: #dff0d8; border: 1px solid #3c763d; }
        .result-card.geel { background: #fcf8e3; border: 1px solid #8a6d3b; }
        .result-card.oranje { background: #f2dede; border: 1px solid #a94442; }
        .result-card.rood { background: #f2dede; border: 2px solid #a94442; }
        .tips-list {
          margin-top: 1rem;
          padding-left: 1.5rem;
        }
        .cd-advies {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
        }
        .wizard-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
      `
    ];
  }

  async connectedCallback() {
    super.connectedCallback();
    await this._loadConfig();
  }

  private async _loadConfig() {
    try {
      const response = await fetch('/advies-config.json');
      this.config = await response.json();
    } catch (e) {
      console.error('Failed to load advies config:', e);
    }
  }

  protected render(): TemplateResult {
    if (!this.config) {
      return html`<p>Laden...</p>`;
    }

    return html`
      <vl-title type="h1">Advies groenten</vl-title>

      <vl-wizard .activeStep=${this.activeStep} numeric>
        ${this._renderStap1()}
        ${this._renderStap2()}
        ${this._renderStap3()}
      </vl-wizard>
    `;
  }

  private _renderStap1(): TemplateResult {
    return html`
      <vl-wizard-pane name="Locatie">
        <vl-title type="h2">Stap 1: Locatie</vl-title>
        <p>Teken de locatie van je moestuin in op de kaart. We gebruiken dit om je postcode te bepalen.</p>

        <gezond-kaart-invoer
          label="Teken je moestuin"
          description="Zoek eerst je adres via de zoekbalk, en teken daarna de exacte locatie van je moestuin."
          @location-changed=${this._handleLocationChanged}
          @location-cleared=${this._handleLocationCleared}>
        </gezond-kaart-invoer>

        <div class="wizard-actions">
          <vl-button secondary @click=${this._naarLanding}>Terug naar overzicht</vl-button>
          <vl-button @click=${this._naarStap2} ?disabled=${!this.locationData}>Volgende</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderStap2(): TemplateResult {
    if (!this.config) return html``;

    const alleVeldenIngevuld = this.tuinType !== '' &&
      this.config.groenten.stoffen.some(s => this.waarden[s.id] !== null && this.waarden[s.id] !== undefined);

    return html`
      <vl-wizard-pane name="Gegevens">
        <vl-title type="h2">Stap 2: Gegevens invoeren</vl-title>

        <div class="form-group">
          <vl-title type="h4">Soort tuin</vl-title>
          <vl-radio-group block>
            ${this.config.groenten.tuinTypes.map(type => html`
              <vl-radio
                value="${type.id}"
                .checked=${this.tuinType === type.id}
                @vl-change=${(e: CustomEvent) => this.tuinType = e.detail.value}>
                ${type.label}
              </vl-radio>
            `)}
          </vl-radio-group>
        </div>

        <div class="form-group">
          <vl-title type="h4">Labo-resultaten</vl-title>
          <p>Vul de gemeten waarden in uit je labo-rapport. Laat velden leeg als je geen waarde hebt.</p>

          <div class="stoffen-grid">
            ${this.config.groenten.stoffen.map(stof => html`
              <div class="stof-input">
                <label>${stof.naam} (${stof.id})</label>
                <vl-input-field
                  type="number"
                  step="0.1"
                  .value=${this.waarden[stof.id]?.toString() || ''}
                  @input=${(e: Event) => this._handleStofInput(stof.id, e)}>
                </vl-input-field>
                <small>${stof.eenheid}</small>
              </div>
            `)}
          </div>
        </div>

        <div class="wizard-actions">
          <vl-button secondary @click=${this._naarStap1}>Terug</vl-button>
          <vl-button @click=${this._berekenAdvies} ?disabled=${!alleVeldenIngevuld}>Bereken advies</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderStap3(): TemplateResult {
    if (!this.config || !this.adviesKleur) return html``;

    const advies = this.config.groenten.adviezen[this.adviesKleur];
    const cdAdvies = this.cdAdviesNiveau ? this.config.groenten.cdAdvies[this.cdAdviesNiveau] : null;
    const isInCdRegio = this.locationData?.postcode &&
      this.config.groenten.cdUitzonderingPostcodes.includes(this.locationData.postcode);

    return html`
      <vl-wizard-pane name="Resultaat">
        <vl-title type="h2">Stap 3: Je advies</vl-title>

        ${this.locationData ? html`
          <p><strong>Locatie:</strong> ${this.locationData.address}</p>
        ` : nothing}

        <div class="result-card ${this.adviesKleur}">
          <vl-title type="h3">${advies.titel}</vl-title>
          <p>${advies.tekst}</p>

          ${advies.tips && advies.tips.length > 0 ? html`
            <vl-title type="h4">Tips</vl-title>
            <ul class="tips-list">
              ${advies.tips.map(tip => html`<li>${tip}</li>`)}
            </ul>
          ` : nothing}

          ${advies.contact ? html`
            <p style="margin-top: 1rem;">
              <strong>Contact:</strong> ${advies.contact.email} of ${advies.contact.telefoon}
            </p>
          ` : nothing}
        </div>

        ${cdAdvies && isInCdRegio ? html`
          <div class="cd-advies">
            <vl-title type="h4">Bijzonder advies voor cadmium (Cd)</vl-title>
            <p>Je bent gelegen in een regio met verhoogde cadmiumwaarden. Let extra op:</p>
            <p>${cdAdvies.tekst}</p>
          </div>
        ` : nothing}

        <div class="wizard-actions">
          <vl-button secondary @click=${this._naarStap2}>Terug</vl-button>
          <vl-button @click=${this._naarLanding}>Terug naar overzicht</vl-button>
          <vl-button secondary @click=${this._reset}>Opnieuw beginnen</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _handleLocationChanged(e: CustomEvent<LocationData>) {
    this.locationData = e.detail;
  }

  private _handleLocationCleared() {
    this.locationData = null;
  }

  private _handleStofInput(stofId: string, e: Event) {
    const input = e.target as HTMLInputElement;
    const value = input.value ? parseFloat(input.value) : null;
    this.waarden = { ...this.waarden, [stofId]: value };
  }

  private _berekenAdvies() {
    if (!this.config || !this.locationData) return;

    const invoer: GroentenInvoer = {
      tuinType: this.tuinType,
      postcode: this.locationData.postcode || '',
      waarden: this.waarden
    };

    this.adviesKleur = bepaalGroentenAdvies(invoer, this.config.groenten);
    this.cdAdviesNiveau = bepaalCdAdviesNiveau(this.waarden['Cd']);

    this.activeStep = 3;
  }

  private _naarStap1() {
    this.activeStep = 1;
  }

  private _naarStap2() {
    this.activeStep = 2;
  }

  private _naarLanding() {
    window.location.hash = 'landing';
  }

  private _reset() {
    this.activeStep = 1;
    this.locationData = null;
    this.tuinType = '';
    this.waarden = {};
    this.adviesKleur = null;
    this.cdAdviesNiveau = null;
  }
}

defineWebComponent(GezondGroentenAdvies, 'gezond-groenten-advies');
```

**Step 3: Update gezond-index.ts**

Voeg import toe:
```typescript
import '../../groenten/componenten/gezond-groenten-advies';
```

Update `_renderRoute()`:
```typescript
case 'advies-groenten':
  return html`<gezond-groenten-advies></gezond-groenten-advies>`;
```

**Step 4: Test handmatig**

Run: `npm run dev`

Test:
- Navigeer naar `#advies-groenten`
- Teken een locatie op de kaart
- Vul tuintype en enkele waarden in
- Klik "Bereken advies"
- Verifieer dat het juiste advies wordt getoond

**Step 5: Commit**

```bash
git add src/groenten/componenten/gezond-groenten-advies.ts src/wizard/paginas/gezond-index.ts
git commit -m "feat: groenten advies tool component"
```

---

## Task 7: Eieren Advies Component

**Files:**
- Create: `src/eieren/componenten/gezond-eieren-advies.ts`
- Modify: `src/wizard/paginas/gezond-index.ts`

**Step 1: Maak directory**

```bash
mkdir -p src/eieren/componenten
```

**Step 2: Maak gezond-eieren-advies.ts**

```typescript
import { BaseLitElement, defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlTitleComponent } from '@domg-wc/components/atom';
import { VlAlert } from '@domg-wc/components/block/alert';
import { VlWizard, VlWizardPane } from '@domg-wc/components/block/wizard';
import { VlFormLabelComponent, VlInputFieldComponent } from '@domg-wc/components/form';
import { VlRadioComponent, VlRadioGroupComponent } from '@domg-wc/components/form/radio-group';
import { vlGridStyles, vlStackedStyles } from '@domg-wc/styles';
import { TemplateResult, html, css, nothing } from 'lit';
import { state, query } from 'lit/decorators.js';
import '../../common/componenten/gezond-kaart-invoer';
import { GezondKaartInvoer, LocationData } from '../../common/componenten/gezond-kaart-invoer';
import { AdviesConfig, EierenInvoer, bepaalEierenAdvies } from '../../common/domein/advies-config';

registerWebComponents([
  VlButtonComponent,
  VlTitleComponent,
  VlAlert,
  VlWizard,
  VlWizardPane,
  VlFormLabelComponent,
  VlInputFieldComponent,
  VlRadioGroupComponent,
  VlRadioComponent
]);

export class GezondEierenAdvies extends BaseLitElement {
  @state() private config: AdviesConfig | null = null;
  @state() private activeStep: number = 1;

  // Stap 1: Locatie
  @state() private locationData: LocationData | null = null;

  // Stap 2: Gegevens
  @state() private eetGroenten: boolean | null = null;
  @state() private pcddF: number | null = null;
  @state() private dioxPCB: number | null = null;

  // Stap 3: Resultaat
  @state() private adviesId: string | null = null;

  @query('gezond-kaart-invoer') private kaartInvoer!: GezondKaartInvoer;

  static get styles() {
    return [
      vlGridStyles,
      vlStackedStyles,
      css`
        :host {
          display: block;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .stoffen-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        .stof-input {
          display: flex;
          flex-direction: column;
        }
        .stof-input label {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .stof-input small {
          color: #666;
          margin-top: 0.25rem;
        }
        .result-card {
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .result-card.groen { background: #dff0d8; border: 1px solid #3c763d; }
        .result-card.geel { background: #fcf8e3; border: 1px solid #8a6d3b; }
        .result-card.oranje { background: #f2dede; border: 1px solid #a94442; }
        .result-card.rood { background: #f2dede; border: 2px solid #a94442; }
        .leeftijds-tabel {
          margin-top: 1rem;
          border-collapse: collapse;
          width: 100%;
        }
        .leeftijds-tabel th,
        .leeftijds-tabel td {
          border: 1px solid #ddd;
          padding: 0.75rem;
          text-align: left;
        }
        .leeftijds-tabel th {
          background: #f5f5f5;
        }
        .tips-list {
          margin-top: 1rem;
          padding-left: 1.5rem;
        }
        .wizard-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
      `
    ];
  }

  async connectedCallback() {
    super.connectedCallback();
    await this._loadConfig();
  }

  private async _loadConfig() {
    try {
      const response = await fetch('/advies-config.json');
      this.config = await response.json();
    } catch (e) {
      console.error('Failed to load advies config:', e);
    }
  }

  protected render(): TemplateResult {
    if (!this.config) {
      return html`<p>Laden...</p>`;
    }

    return html`
      <vl-title type="h1">Advies eieren</vl-title>

      <vl-wizard .activeStep=${this.activeStep} numeric>
        ${this._renderStap1()}
        ${this._renderStap2()}
        ${this._renderStap3()}
      </vl-wizard>
    `;
  }

  private _renderStap1(): TemplateResult {
    return html`
      <vl-wizard-pane name="Locatie">
        <vl-title type="h2">Stap 1: Locatie</vl-title>
        <p>Teken de locatie van je kippenren in op de kaart.</p>

        <gezond-kaart-invoer
          label="Teken je kippenren"
          description="Zoek eerst je adres via de zoekbalk, en teken daarna de exacte locatie van je kippenren."
          @location-changed=${this._handleLocationChanged}
          @location-cleared=${this._handleLocationCleared}>
        </gezond-kaart-invoer>

        <div class="wizard-actions">
          <vl-button secondary @click=${this._naarLanding}>Terug naar overzicht</vl-button>
          <vl-button @click=${this._naarStap2} ?disabled=${!this.locationData}>Volgende</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderStap2(): TemplateResult {
    if (!this.config) return html``;

    const alleVeldenIngevuld = this.eetGroenten !== null &&
      this.pcddF !== null && this.dioxPCB !== null;

    return html`
      <vl-wizard-pane name="Gegevens">
        <vl-title type="h2">Stap 2: Gegevens invoeren</vl-title>

        <div class="form-group">
          <vl-title type="h4">Eet je ook groenten uit eigen tuin?</vl-title>
          <vl-radio-group block>
            <vl-radio
              value="true"
              .checked=${this.eetGroenten === true}
              @vl-change=${() => this.eetGroenten = true}>
              Ja
            </vl-radio>
            <vl-radio
              value="false"
              .checked=${this.eetGroenten === false}
              @vl-change=${() => this.eetGroenten = false}>
              Nee
            </vl-radio>
          </vl-radio-group>
        </div>

        <div class="form-group">
          <vl-title type="h4">Labo-resultaten</vl-title>
          <p>Vul de gemeten waarden in uit je labo-rapport.</p>

          <div class="stoffen-inputs">
            <div class="stof-input">
              <label>PCDD/F's</label>
              <vl-input-field
                type="number"
                step="0.01"
                .value=${this.pcddF?.toString() || ''}
                @input=${(e: Event) => this._handlePcddInput(e)}>
              </vl-input-field>
              <small>ng/kg ds</small>
            </div>
            <div class="stof-input">
              <label>Dioxineachtige PCB's</label>
              <vl-input-field
                type="number"
                step="0.01"
                .value=${this.dioxPCB?.toString() || ''}
                @input=${(e: Event) => this._handleDioxInput(e)}>
              </vl-input-field>
              <small>ng/kg ds</small>
            </div>
          </div>
        </div>

        <div class="wizard-actions">
          <vl-button secondary @click=${this._naarStap1}>Terug</vl-button>
          <vl-button @click=${this._berekenAdvies} ?disabled=${!alleVeldenIngevuld}>Bereken advies</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderStap3(): TemplateResult {
    if (!this.config || !this.adviesId) return html``;

    const advies = this.config.eieren.adviezen[this.adviesId];
    const leeftijdsAdvies = this.config.eieren.leeftijdsadvies[this.adviesId];

    return html`
      <vl-wizard-pane name="Resultaat">
        <vl-title type="h2">Stap 3: Je advies</vl-title>

        ${this.locationData ? html`
          <p><strong>Locatie:</strong> ${this.locationData.address}</p>
        ` : nothing}

        <div class="result-card ${advies.kleur}">
          <vl-title type="h3">${advies.titel}</vl-title>
          <p>${advies.tekst}</p>

          <vl-title type="h4">Aanbevolen hoeveelheid per leeftijd</vl-title>
          <table class="leeftijds-tabel">
            <thead>
              <tr>
                <th>Leeftijdsgroep</th>
                <th>Maximum aantal eieren</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Volwassenen (> 12 jaar)</td>
                <td>${leeftijdsAdvies.volwassenen}</td>
              </tr>
              <tr>
                <td>Kinderen 6-12 jaar</td>
                <td>${leeftijdsAdvies.kinderen6tot12}</td>
              </tr>
              <tr>
                <td>Kinderen < 6 jaar</td>
                <td>${leeftijdsAdvies.kinderenOnder6}</td>
              </tr>
            </tbody>
          </table>

          ${advies.tips && advies.tips.length > 0 ? html`
            <vl-title type="h4">Tips</vl-title>
            <ul class="tips-list">
              ${advies.tips.map(tip => html`<li>${tip}</li>`)}
            </ul>
          ` : nothing}
        </div>

        <div class="wizard-actions">
          <vl-button secondary @click=${this._naarStap2}>Terug</vl-button>
          <vl-button @click=${this._naarLanding}>Terug naar overzicht</vl-button>
          <vl-button secondary @click=${this._reset}>Opnieuw beginnen</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _handleLocationChanged(e: CustomEvent<LocationData>) {
    this.locationData = e.detail;
  }

  private _handleLocationCleared() {
    this.locationData = null;
  }

  private _handlePcddInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.pcddF = input.value ? parseFloat(input.value) : null;
  }

  private _handleDioxInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.dioxPCB = input.value ? parseFloat(input.value) : null;
  }

  private _berekenAdvies() {
    if (!this.config || this.eetGroenten === null || this.pcddF === null || this.dioxPCB === null) return;

    const invoer: EierenInvoer = {
      eetGroenten: this.eetGroenten,
      PCDD_F: this.pcddF,
      DioxPCB: this.dioxPCB
    };

    this.adviesId = bepaalEierenAdvies(invoer, this.config.eieren);
    this.activeStep = 3;
  }

  private _naarStap1() {
    this.activeStep = 1;
  }

  private _naarStap2() {
    this.activeStep = 2;
  }

  private _naarLanding() {
    window.location.hash = 'landing';
  }

  private _reset() {
    this.activeStep = 1;
    this.locationData = null;
    this.eetGroenten = null;
    this.pcddF = null;
    this.dioxPCB = null;
    this.adviesId = null;
  }
}

defineWebComponent(GezondEierenAdvies, 'gezond-eieren-advies');
```

**Step 3: Update gezond-index.ts**

Voeg import toe:
```typescript
import '../../eieren/componenten/gezond-eieren-advies';
```

Update `_renderRoute()`:
```typescript
case 'advies-eieren':
  return html`<gezond-eieren-advies></gezond-eieren-advies>`;
```

**Step 4: Test handmatig**

Run: `npm run dev`

Test:
- Navigeer naar `#advies-eieren`
- Teken een locatie op de kaart
- Beantwoord vraag over groenten
- Vul PCDD/F's en dioxineachtige PCB's in
- Klik "Bereken advies"
- Verifieer dat de tabel met leeftijdsadviezen wordt getoond

**Step 5: Commit**

```bash
git add src/eieren/componenten/gezond-eieren-advies.ts src/wizard/paginas/gezond-index.ts
git commit -m "feat: eieren advies tool component"
```

---

## Task 8: Finale Integratie & Cleanup

**Files:**
- Modify: `src/wizard/paginas/gezond-index.ts` (final version)

**Step 1: Verifieer volledige gezond-index.ts**

```typescript
import '../../common/config/app.config';
import { defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { LitElement, TemplateResult, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { GezondWizard } from '../componenten/gezond-wizard';
import '../../common/componenten/gezond-template';
import '../../landing/componenten/gezond-landing-page';
import '../../groenten/componenten/gezond-groenten-advies';
import '../../eieren/componenten/gezond-eieren-advies';

registerWebComponents([GezondWizard]);

type Route = 'landing' | 'doe-de-test' | 'advies-groenten' | 'advies-eieren';

export class GezondIndex extends LitElement {
  @state() private currentRoute: Route = 'landing';

  static get styles() {
    return [
      css`
        :host {
          display: block;
          min-height: 100vh;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
      `
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleHashChange();
    window.addEventListener('hashchange', this._handleHashChange.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._handleHashChange.bind(this));
  }

  private _handleHashChange() {
    const hash = window.location.hash.slice(1) || 'landing';
    const validRoutes: Route[] = ['landing', 'doe-de-test', 'advies-groenten', 'advies-eieren'];
    this.currentRoute = validRoutes.includes(hash as Route) ? (hash as Route) : 'landing';
  }

  protected render(): TemplateResult {
    return html`
      <gezond-template>
        <div class="container">
          ${this._renderRoute()}
        </div>
      </gezond-template>
    `;
  }

  private _renderRoute(): TemplateResult {
    switch (this.currentRoute) {
      case 'doe-de-test':
        return html`<gezond-wizard></gezond-wizard>`;
      case 'advies-groenten':
        return html`<gezond-groenten-advies></gezond-groenten-advies>`;
      case 'advies-eieren':
        return html`<gezond-eieren-advies></gezond-eieren-advies>`;
      case 'landing':
      default:
        return html`<gezond-landing-page></gezond-landing-page>`;
    }
  }
}

defineWebComponent(GezondIndex, 'gezond-index');
```

**Step 2: Test volledige flow**

Run: `npm run dev`

Test checklist:
- [ ] Landing page toont 3 tegels
- [ ] "Start de test" navigeert naar wizard
- [ ] "Vraag advies" (groenten) navigeert naar groenten tool
- [ ] "Vraag advies" (eieren) navigeert naar eieren tool
- [ ] Browser back/forward werkt correct
- [ ] Elke tool heeft werkende "Terug naar overzicht" knop
- [ ] Groenten tool berekent correct advies
- [ ] Eieren tool berekent correct advies met leeftijdstabel

**Step 3: Build voor productie**

Run: `npm run build`

Verifieer geen build errors.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete landingspagina en adviestools integratie"
```

---

## Samenvatting

| Task | Beschrijving | Geschatte complexiteit |
|------|--------------|----------------------|
| 1 | Hash Router | Laag |
| 2 | Landing Page | Laag |
| 3 | Advies Config JSON | Laag |
| 4 | Advies Config Types + Engine | Medium |
| 5 | Gedeelde Kaart Component | Medium |
| 6 | Groenten Advies Component | Medium |
| 7 | Eieren Advies Component | Medium |
| 8 | Finale Integratie | Laag |

**Totaal: 8 taken, incrementeel testbaar na elke stap.**
