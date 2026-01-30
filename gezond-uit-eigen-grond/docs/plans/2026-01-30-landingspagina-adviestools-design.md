# Ontwerp: Landingspagina en Adviestools

**Datum:** 2026-01-30
**Status:** Goedgekeurd

## Samenvatting

Toevoegen van een landingspagina aan "Gezond uit eigen grond" met drie keuzemogelijkheden:
1. **Doe de test** - Bestaande wizard voor locatie-risicofactoren
2. **Advies groenten** - Nieuwe tool voor advies op basis van labo-resultaten zware metalen
3. **Advies eieren** - Nieuwe tool voor advies over eierenconsumptie op basis van dioxines/PCB's

---

## 1. Architectuur & Routing

### Mappenstructuur

```
src/
├── landing/
│   └── componenten/
│       └── gezond-landing-page.ts      # Landingspagina met 3 tegels
├── wizard/                              # Bestaande "Doe de test"
│   └── componenten/
│       └── gezond-wizard.ts
├── groenten/                            # Nieuw: Advies groenten
│   └── componenten/
│       └── gezond-groenten-advies.ts
├── eieren/                              # Nieuw: Advies eieren
│   └── componenten/
│       └── gezond-eieren-advies.ts
├── common/
│   └── componenten/
│       ├── gezond-kaart-invoer.ts      # Gedeelde kaart-component (extract uit wizard)
│       └── gezond-template.ts           # Bestaande layout wrapper
└── paginas/
    └── gezond-index.ts                  # Entry point met hash router
```

### Hash Routing

| Route | Component | Beschrijving |
|-------|-----------|--------------|
| `/` of `/#landing` | `gezond-landing-page` | Landingspagina |
| `/#doe-de-test` | `gezond-wizard` | Bestaande wizard |
| `/#advies-groenten` | `gezond-groenten-advies` | Groenten advies tool |
| `/#advies-eieren` | `gezond-eieren-advies` | Eieren advies tool |

### Router Implementatie

`gezond-index.ts` wordt aangepast:
- Luistert naar `hashchange` events
- Rendert het juiste component op basis van de hash
- Default naar landing bij lege hash

---

## 2. Landingspagina

### Component

`gezond-landing-page.ts`

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Header - gezond-template]                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Gezond uit eigen grond                                 │
│                                                         │
│  Wil je weten of je veilig groenten kan kweken of       │
│  kippen kan houden in je tuin? Kies hieronder wat       │
│  je wil doen:                                           │
│  • Nog geen labo-resultaten? Doe eerst de test om      │
│    te zien of jouw locatie geschikt is.                │
│  • Wel labo-resultaten? Vraag direct advies over       │
│    groenten of eieren.                                  │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │ Doe de test │ │   Advies    │ │   Advies    │        │
│  │             │ │  groenten   │ │   eieren    │        │
│  │             │ │             │ │             │        │
│  │[Start test] │ │[Vraag adv.] │ │[Vraag adv.] │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tegelteksten

**Tegel 1: Doe de test**
> Ontdek of jouw locatie geschikt is voor een moestuin of kippen. We checken risicofactoren zoals PFAS-zones, nabijheid van wegen en spoorlijnen, en gekende verontreinigingen.

*Knop: "Start de test"*

**Tegel 2: Advies groenten**
> Je hebt labo-resultaten van je bodemstaal? Vul de gemeten waarden voor zware metalen in en ontvang een persoonlijk advies over groenten telen in je tuin.

*Knop: "Vraag advies"*

**Tegel 3: Advies eieren**
> Je hebt labo-resultaten voor dioxines en PCB's? Vul de gemeten waarden in en ontdek hoeveel eieren van je eigen kippen je veilig kan eten.

*Knop: "Vraag advies"*

### Technische Details

- Gebruikt `vl-info-tile` uit DOMG-WC
- Responsive grid: 3 kolommen op desktop, 1 kolom op mobiel
- Teksten hardcoded in component

---

## 3. Gedeelde Kaart-Component

### Component

`gezond-kaart-invoer.ts`

### Doel

Herbruikbare component voor locatie-invoer, geëxtraheerd uit de bestaande wizard.

### Functionaliteit

- Adres zoeken via tekstveld (bestaande geocoding)
- Locatie intekenen/aanpassen op kaart (polygon)
- Automatisch afleiden van:
  - Adres (bestaand)
  - Postcode (nieuw - uit dezelfde geocoding response)

### Interface

```typescript
// Input properties
@property() initialLocation?: Geometry;

// Output events
@event() location-changed: CustomEvent<{
  geometry: Geometry;
  address: string;
  postcode: string;
}>
```

### Gebruik per Tool

| Tool | Gebruik kaart-component |
|------|------------------------|
| Doe de test | Volledige wizard-flow met WFS-checks |
| Advies groenten | Alleen locatie → postcode (voor Cd-uitzondering) |
| Advies eieren | Alleen locatie → postcode |

---

## 4. Advies Groenten Tool

### Component

`gezond-groenten-advies.ts`

### Flow (3 stappen)

**Stap 1: Locatie**
- Kaart-component voor locatie-invoer
- Toont afgeleide adres en postcode

**Stap 2: Gegevens**
- Soort tuin: Privé / Volkstuin
- Kippen: Ja / Nee
- Labo-resultaten (alle in mg/kg):
  - As (arseen)
  - Cd (cadmium)
  - Cr (chroom)
  - Hg (kwik)
  - Pb (lood)
  - Ni (nikkel)
  - BaP

**Stap 3: Resultaat**
- Kleurcode (groen/geel/oranje/rood)
- Adviestekst per kleur
- Bij verhoogd Cd: extra advies over welke groenten te vermijden

### Advieslogica

1. Bepaal tuintype → selecteer juiste drempelwaarden-set
2. Check of postcode in Cd-uitzonderingslijst zit
3. Per stof: vergelijk waarde met drempels → kleurcode (1-4)
4. **Eindadvies = `Math.max()` van alle stoffen** (worst case)
5. Bij verhoogd Cd: extra advies afhankelijk van concentratie

### Cd-uitzonderingspostcodes

2660, 2620, 2340, 2400, 2490, 3920, 3900, 3910, 3930

### Cd-specifiek Advies

| Cd-waarde | Advies |
|-----------|--------|
| < 2 mg/kg | Alle groentensoorten mogelijk |
| 2-5 mg/kg | Vermijd: andijvie, kervel, peterselie, rabarber, schorseneren, selder, sla, spinazie, tuinkers, veldsla, waterkers |
| 5-10 mg/kg | Vermijd ook: aardappelen, aardbeien, bloemkool, prei, radijs, sjalot, ui, witlof, wortelen |
| > 10 mg/kg | Vermijd ook: bonen, erwten, paprika, tomaat |

---

## 5. Advies Eieren Tool

### Component

`gezond-eieren-advies.ts`

### Flow (3 stappen)

**Stap 1: Locatie**
- Kaart-component voor locatie-invoer (kippenren)
- Toont afgeleide adres en postcode

**Stap 2: Gegevens**
- Vraag: "Eet je ook groenten uit eigen tuin?" (Ja/Nee)
- Labo-resultaten (in ng/kg ds):
  - PCDD/F's
  - Dioxineachtige PCB's

**Stap 3: Resultaat**
- Advies aantal eieren per week
- Uitgesplitst per leeftijdscategorie

### Advieslogica

```
A = PCDD/F's waarde (ng/kg ds)
B = Dioxineachtige PCB's waarde (ng/kg ds)

Verhoudingen berekenen:
- verhouding 1: A/12.3 + B/3.9
- verhouding 2: A/18.7 + B/5.84
- verhouding 3: A/36.5 + B/11.5
- verhouding 4: A/856 + B/470

Advies (eerste verhouding < 1 geldt):
- verhouding 1 < 1 → 3 eieren/week (groen)
- verhouding 2 < 1 → 2 eieren/week (geel)
- verhouding 3 < 1 → 1 ei/week (oranje)
- verhouding 4 < 1 → afgeraden (rood)
```

### Leeftijdscategorieën

| Advies (volwassenen) | Kinderen 6-12 | Kinderen <6 |
|---------------------|---------------|-------------|
| 3 eieren/week | 2 eieren/week | 1 ei/week |
| 2 eieren/week | 1 ei/week | 1 ei per 14 dagen |
| 1 ei/week | 1 ei per 14 dagen | Afgeraden |
| Afgeraden | Afgeraden | Afgeraden |

---

## 6. Configuratie

### Nieuw Bestand

`src/public/advies-config.json`

### Structuur

```json
{
  "groenten": {
    "stoffen": ["As", "Cd", "Cr", "Hg", "Pb", "Ni", "BaP"],
    "eenheden": "mg/kg",
    "drempels": {
      "priveMetKippen": {
        "As":  { "groen": 103, "geel": null, "oranje": 103, "rood": 103 },
        "Cd":  { "groen": 6, "geel": null, "oranje": 6, "rood": 6 },
        "Cr":  { "groen": 120, "geel": 120, "oranje": 240, "rood": 260 },
        "Hg":  { "groen": 1, "geel": null, "oranje": null, "rood": null },
        "Pb":  { "groen": 200, "geel": 200, "oranje": 560, "rood": 560 },
        "Ni":  { "groen": 100, "geel": 100, "oranje": 125, "rood": 157 },
        "BaP": { "groen": 3.6, "geel": 4.9, "oranje": 6.3, "rood": 6.3 }
      },
      "priveZonderKippen": { },
      "volkstuin": { }
    },
    "cdUitzonderingPostcodes": [2660, 2620, 2340, 2400, 2490, 3920, 3900, 3910, 3930],
    "cdAdvies": {
      "tot2": "Alle groentensoorten zijn mogelijk indien de bodem niet te zuur is, voldoende organisch stof bevat en groenten grondig gewassen en geschild worden.",
      "2tot5": "Vermijd het telen van: andijvie, kervel, peterselie, rabarber, schorseneren, selder, sla, spinazie, tuinkers, veldsla en waterkers.",
      "5tot10": "Vermijd ook: aardappelen, aardbeien, bloemkool, prei, radijs, sjalot, ui, witlof en wortelen.",
      "boven10": "Vermijd ook: bonen, erwten, paprika en tomaat. Neem contact op met OVAM."
    },
    "adviezen": {
      "groen": {
        "titel": "Goed nieuws!",
        "tekst": "Op basis van de resultaten van het onderzoek van je groentetuin kan je zonder beperking genieten van je tuin.",
        "tips": [
          "Was na het werken in de tuin je handen.",
          "Was groenten uit de tuin altijd goed of schil ze eventueel.",
          "Bekijk de tips uit de praktijkgids op www.gezonduiteigengrond.be."
        ]
      },
      "geel": {
        "titel": "Lichte aandacht nodig",
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
    "stoffen": ["PCDD/F's", "Dioxineachtige PCB's"],
    "eenheden": "ng/kg ds",
    "verhoudingen": {
      "metGroenten": {
        "3eieren": { "aFactor": 12.3, "bFactor": 3.9 },
        "2eieren": { "aFactor": 18.7, "bFactor": 5.84 },
        "1ei": { "aFactor": 36.5, "bFactor": 11.5 },
        "afgeraden": { "aFactor": 856, "bFactor": 470 }
      },
      "zonderGroenten": {
        "3eieren": { "aFactor": 12.3, "bFactor": 3.9 },
        "2eieren": { "aFactor": 18.7, "bFactor": 5.84 },
        "1ei": { "aFactor": 36.5, "bFactor": 11.5 },
        "afgeraden": { "aFactor": 856, "bFactor": 470 }
      }
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
        "kleur": "groen",
        "tekst": "Je kan de eieren van je eigen kippen eten. Om een te hoog cholesterolgehalte te vermijden, eet je best niet te veel eieren.",
        "tips": [
          "Geniet van je tuin, maar kijk ook even op www.gezonduiteigengrond.be/kippen-houden voor algemeen preventieve adviezen."
        ]
      },
      "2eieren": {
        "titel": "2 eieren per week",
        "kleur": "geel",
        "tekst": "Op basis van de meetresultaten voor dioxines en PCB's in de bodem van de kippenren is het aangeraden om het aantal eieren te beperken.",
        "tips": [
          "Kijk op www.gezonduiteigengrond.be/kippen-houden voor hoe je jouw kippenren best inricht."
        ]
      },
      "1ei": {
        "titel": "1 ei per week",
        "kleur": "oranje",
        "tekst": "Op basis van de meetresultaten voor dioxines en PCB's in de bodem van de kippenren is het aangeraden om het aantal eieren te beperken.",
        "tips": [
          "Kijk op www.gezonduiteigengrond.be/kippen-houden voor hoe je jouw kippenren best inricht.",
          "Overweeg om de grond van de kippenren te vervangen."
        ]
      },
      "afgeraden": {
        "titel": "Eieren afgeraden",
        "kleur": "rood",
        "tekst": "Op basis van de meetresultaten voor dioxines en PCB's in de bodem van de kippenren is het afgeraden om eieren van je eigen kippen te eten.",
        "tips": [
          "Neem contact op met een deskundige voor advies over sanering van de kippenren."
        ]
      }
    }
  }
}
```

---

## 7. Implementatie Overzicht

### Te Wijzigen Bestanden

| Bestand | Wijziging |
|---------|-----------|
| `src/wizard/paginas/gezond-index.ts` | Hash router toevoegen |
| `src/wizard/componenten/gezond-wizard.ts` | Kaart-logica extraheren |

### Nieuwe Bestanden

| Bestand | Beschrijving |
|---------|--------------|
| `src/landing/componenten/gezond-landing-page.ts` | Landingspagina |
| `src/common/componenten/gezond-kaart-invoer.ts` | Gedeelde kaart-component |
| `src/groenten/componenten/gezond-groenten-advies.ts` | Groenten advies tool |
| `src/eieren/componenten/gezond-eieren-advies.ts` | Eieren advies tool |
| `src/public/advies-config.json` | Configuratie drempelwaarden |

### Dependencies

Geen nieuwe dependencies nodig - gebruikt bestaande DOMG-WC componenten:
- `vl-info-tile`
- `vl-grid` / `vl-column`
- `vl-button`
- `vl-title`
- `vl-form` / `vl-input-field`
- `vl-radio` / `vl-checkbox`

---

## 8. Open Punten

- [ ] Exacte drempelwaarden uit Excel valideren en invullen in config
- [ ] Adviesteksten uit Word-document overnemen en valideren
- [ ] Scenario "zonder groenten" voor eieren-tool: andere verhoudingen nodig?
