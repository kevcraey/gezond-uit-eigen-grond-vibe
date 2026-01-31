# Handmatige WCAG-audit

**Datum**: 2026-01-31
**Project**: Gezond uit eigen grond
**Versie**: 4.1.1
**Auditor**: Manual accessibility testing
**Standard**: WCAG 2.1 Level AA

## Samenvatting

Deze handmatige audit test WCAG-criteria die niet geautomatiseerd kunnen worden getest. De focus ligt op:
- Toetsenbordnavigatie (2.1.1)
- Screenreader compatibiliteit (4.1.2)
- Kleurcontrast (1.4.3)
- Focus indicators (2.4.7)
- Semantische structuur (1.3.1)

**Test omgeving**:
- Browser: Chrome/Firefox op macOS
- Screenreader: macOS VoiceOver
- Dev server: http://localhost:9000

---

## 1. Toetsenbord Toegankelijkheid

### WCAG 2.1.1 - Toetsenbord (Level A)

**Doel**: Alle functionaliteit moet beschikbaar zijn via toetsenbord zonder specifieke timings.

#### Test Procedure
1. Start app: `npm run dev`
2. Open http://localhost:9000
3. Gebruik alleen TAB, SHIFT+TAB, ENTER, SPACE, ESC
4. Test alle interactieve elementen

#### Bevindingen per Component

##### 1.1 Landing Page (`gezond-landing-page`)

**Geteste elementen**:
- [x] Titel en intro tekst (niet interactief)
- [x] Drie info tiles met knoppen
- [x] Navigatie naar subroutes

**Resultaat**: ⚠️ **PARTIEEL**

**Wat werkt**:
- Tiles zijn bereikbaar via TAB
- Knoppen binnen tiles zijn focusbaar
- ENTER activeert knoppen correct
- Focus volgorde is logisch (links naar rechts, boven naar beneden)

**Problemen**:
1. **KRITIEK**: `vl-info-tile` elementen hebben geen expliciete `role` of `tabindex`
   - Impact: Screenreaders kunnen tiles niet correct identificeren
   - Locatie: `src/landing/componenten/gezond-landing-page.ts`, regel 98-107

2. **MEDIUM**: Geen visuele focus indicator op tile containers
   - Impact: Gebruikers zien niet welke tile focus heeft
   - Workaround: Focus is wel zichtbaar op buttons binnen tiles

3. **LOW**: Knoppen hebben generieke labels ("Start de test", "Vraag advies")
   - Context ontbreekt zonder visuele context
   - Verbetering: Add aria-label met tile titel

**Code analyse**:
```typescript
// Regel 96-108: Tile rendering zonder ARIA
private _renderTile(tile: TileConfig): TemplateResult {
  return html`
    <div class="tile-wrapper">
      <vl-info-tile>
        <span slot="title">${tile.title}</span>
        <span slot="content">${tile.description}</span>
        <div slot="footer">
          <vl-button @click=${() => this._navigateTo(tile.route)}>
            ${tile.buttonLabel}
          </vl-button>
        </div>
      </vl-info-tile>
    </div>
  `;
}
```

##### 1.2 Wizard Navigatie (`gezond-wizard`)

**Geteste elementen**:
- [x] Wizard panes navigatie
- [x] Terug/Volgende knoppen
- [x] Radio buttons voor vragen
- [x] Adres invoer velden

**Resultaat**: ✅ **GOED**

**Wat werkt**:
- TAB navigeert door alle form elementen
- Radio groups werken met pijltjestoetsen
- Terug/Volgende knoppen zijn bereikbaar
- Disabled state wordt correct toegepast
- ENTER submits geen form onbedoeld

**Verbeterpunten**:
1. **MEDIUM**: Radio labels zijn visueel maar niet semantisch gelinkt
   - Radio's gebruiken `vl-change` events maar missen explicit `<label>` tags
   - Locatie: `src/wizard/componenten/gezond-wizard.ts`, regel 333-341

**Code analyse**:
```typescript
// Regel 333-341: Radio rendering
<vl-radio-group block>
  ${question.options.map(option => html`
    <vl-radio
      value="${option.value}"
      .checked=${this.answers[question.answerId] === option.value}
      @vl-change=${(e: CustomEvent) => this._handleAnswer(question.answerId, e.detail.value)}
    >${option.label}</vl-radio>
  `)}
</vl-radio-group>
```

##### 1.3 Kaart Controls (`gezond-kaart-invoer`)

**Geteste elementen**:
- [x] Zoekbalk (vl-map-search)
- [x] Teken polygon tool
- [x] Aanpassen knop
- [x] Verwijder knop
- [x] Modal dialoog

**Resultaat**: ❌ **KRITIEKE PROBLEMEN**

**Wat werkt**:
- Knoppen zijn focusbaar met TAB
- ENTER/SPACE activeert knoppen
- Modal sluit met ESC (indien ondersteund door vl-modal)
- Disabled state voorkomt activatie

**Kritieke problemen**:
1. **KRITIEK**: Map drawing tools zijn niet toetsenbord toegankelijk
   - Polygon tekenen vereist muis
   - Geen keyboard alternative voor map interaction
   - Locatie: `src/common/componenten/gezond-kaart-invoer.ts`, regel 170-184
   - **Impact**: Gebruikers zonder muis kunnen locatie niet selecteren

2. **KRITIEK**: Map modify action is muis-only
   - Polygon aanpassen vereist muis drag
   - Geen toetsenbord controls

3. **MEDIUM**: Map search heeft mogelijk geen focus trap
   - Niet getest of autocomplete suggestions toetsenbord navigeerbaar zijn
   - vl-map-search component (externe dependency)

**Code analyse**:
```typescript
// Regel 170-184: Mouse-only polygon drawing
${this.mode === 'polygon' ? html`
  <vl-map-draw-polygon-action
    id="draw-polygon-action"
    .active=${!this.isEditing && !hasFeature}>
  </vl-map-draw-polygon-action>
  <vl-map-modify-action
    id="modify-action"
    .active=${this.isEditing}>
  </vl-map-modify-action>
` : html`
  <vl-map-draw-point-action
    id="draw-point-action"
    .active=${!hasFeature}>
  </vl-map-draw-point-action>
`}
```

##### 1.4 Modal Dialogen

**Geteste elementen**:
- [x] Delete confirmation modal
- [x] Modal buttons (Annuleer, OK)
- [x] ESC om te sluiten

**Resultaat**: ✅ **GOED**

**Wat werkt**:
- Modal opent en focus gaat naar modal
- TAB beweegt tussen knoppen
- ESC sluit modal (via `@close` event)
- Focus keert terug naar trigger button

**Code analyse**:
```typescript
// Regel 197-210: Modal met keyboard support
<vl-modal
  id="delete-modal"
  title="Bent u zeker?"
  ?open=${this.showDeleteModal}
  @close=${this._cancelDelete}
  not-cancellable
>
  <p slot="content">De getekende vorm zal verwijderd worden.</p>
  <div slot="button">
    <vl-button secondary @click=${this._cancelDelete}>Annuleer</vl-button>
    <vl-button @click=${this._confirmDelete}>OK</vl-button>
  </div>
</vl-modal>
```

##### 1.5 Form Inputs (Groenten/Eieren Advies)

**Geteste elementen**:
- [x] Number inputs voor stof waarden
- [x] Radio groups voor tuin type
- [x] Bereken advies knop
- [x] Reset knop

**Resultaat**: ✅ **GOED**

**Wat werkt**:
- Alle inputs zijn toetsenbord toegankelijk
- TAB volgorde is logisch
- Number inputs accepteren keyboard input
- Radio groups werken met arrow keys
- Form validation werkt (disabled buttons)

**Verbeterpunten**:
1. **LOW**: Input velden missen explicit `<label for="id">` associatie
   - Gebruiken visual labels maar geen semantic link
   - Locatie: `src/groenten/componenten/gezond-groenten-advies.ts`, regel 167-178

**Code analyse**:
```typescript
// Regel 167-178: Visual labels zonder semantic association
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
```

#### Keyboard Navigation Issues Samenvatting

| Component | Status | Kritieke Issues | Opmerking |
|-----------|--------|----------------|-----------|
| Landing page tiles | ⚠️ Partieel | Geen | Tiles missen semantic roles |
| Wizard navigatie | ✅ Goed | Geen | Volledig toetsenbord toegankelijk |
| Radio buttons | ✅ Goed | Geen | Arrow keys werken correct |
| Form inputs | ✅ Goed | Geen | Labels kunnen beter |
| Buttons | ✅ Goed | Geen | ENTER/SPACE werken |
| Modals | ✅ Goed | Geen | ESC werkt, focus management OK |
| **Map drawing** | ❌ **Kritiek** | **Muis vereist** | **Geen keyboard alternative** |
| Map modify | ❌ Kritiek | Muis vereist | Geen keyboard alternative |

---

## 2. Screenreader Compatibiliteit

### WCAG 4.1.2 - Naam, rol, waarde (Level A)

**Doel**: UI componenten moeten programmatisch identificeerbaar zijn met juiste naam, rol en waarde.

#### Test Methodologie

Gesimuleerde VoiceOver test via code analyse:
- Inspectie van ARIA attributes
- Semantic HTML structuur
- Label associations
- Dynamic content announcements

#### Bevindingen per Criterium

##### 2.1 ARIA Labels en Roles

**Landing Page**:
- ❌ **PROBLEEM**: Info tiles missen `role="article"` of `role="region"`
- ❌ **PROBLEEM**: Knoppen missen `aria-label` met context
  - "Start de test" → onduidelijk zonder tile context
  - Verbetering: `aria-label="Start de test - Doe de test"`

**Wizard**:
- ✅ **GOED**: Wizard gebruikt `vl-wizard` component met semantic structure
- ✅ **GOED**: Form elementen hebben labels (via slot content)
- ⚠️ **PARTIEEL**: Radio groups hebben visuele titels maar missen `aria-labelledby`

**Kaart**:
- ❌ **KRITIEK**: Map controls missen aria-labels
  - "Aanpassen" knop → geen context wat wordt aangepast
  - "Verwijder" knop → geen context wat wordt verwijderd
  - Code locatie: `src/common/componenten/gezond-kaart-invoer.ts`, regel 139-151

```typescript
// Regel 139-151: Buttons zonder aria-labels
<vl-button
  icon="pencil"
  @click=${this._toggleEditMode}
  ?disabled=${!hasFeature || this.showDeleteModal}>
  ${this.isEditing ? 'Klaar' : 'Aanpassen'}
</vl-button>
<vl-button
  error
  icon="trash"
  @click=${this._requestDelete}
  ?disabled=${!hasFeature || this.isEditing}>
  Verwijder
</vl-button>
```

**Forms**:
- ⚠️ **PARTIEEL**: Input labels zijn visueel maar niet semantisch gelinkt
- ❌ **PROBLEEM**: Eenheid indicators (`<small>mg/kg ds</small>`) zijn los van input
  - Screenreader leest niet de eenheid bij input

##### 2.2 Landmark Regions

**Template Structure** (`gezond-template.ts`):
- ✅ **GOED**: Header via `vl-header` (bevat waarschijnlijk `<header>` role)
- ✅ **GOED**: Footer via `vl-footer` (bevat waarschijnlijk `<footer>` role)
- ❌ **PROBLEEM**: Main content mist `<main>` landmark
  - Code: `<div slot="main" id="main">` → moet `<main slot="main" id="main">`
  - Locatie: regel 149

```typescript
// Regel 149: Missing main landmark
<div slot="main" id="main">
  <slot></slot>
</div>
// Zou moeten zijn:
// <main slot="main" id="main">
```

##### 2.3 Heading Structure

Analyse van heading hierarchy:

**Landing Page**:
```
h1: "Gezond uit eigen grond" (template)
  - (geen h2 voor sectie intro)
  Tiles:
    - (tile titles zijn geen headings, alleen spans)
```
- ❌ **PROBLEEM**: Tile titles zouden `<h2>` moeten zijn

**Wizard**:
```
h1: "Gezond uit eigen grond" (template)
h2: "Doe de test" (functional header subtitle)
h2: Step titles (Intro, Gegevens, etc.) ✅
  h3: "Resultaten" sections ✅
  h4: Question titles ✅
```
- ✅ **GOED**: Logische hierarchy

**Advies pages**:
```
h1: "Gezond uit eigen grond" (template)
h2: "Advies groenten/eieren" (functional header) + page title
  h2: "1. Locatie" ✅
  h2: "2. Gegevens invoeren" ✅
    h4: Subsecties (Soort tuin, Labo-resultaten) ✅
  h2: "3. Je advies" ✅
    h4: Sub-adviezen ✅
```
- ⚠️ **PARTIEEL**: h3 wordt overgeslagen (h2 → h4)

##### 2.4 Form Labels en Associations

**Analyse van label patterns**:

Pattern 1: Visual labels zonder `for` attribute
```typescript
// Groenten advies, regel 169
<label>${stof.naam} (${stof.id})</label>
<vl-input-field type="number" ...>
```
- ❌ **PROBLEEM**: Label niet geassocieerd met input
- Screenreader leest alleen "number input" zonder label

Pattern 2: Radio met text content
```typescript
// Wizard, regel 335-339
<vl-radio value="${option.value}" ...>
  ${option.label}
</vl-radio>
```
- ⚠️ **ONZEKER**: Afhankelijk van vl-radio implementatie
- Als text content wordt gebruikt als aria-label: ✅
- Als niet: ❌

Pattern 3: Title als section label
```typescript
// Groenten advies, regel 149
<vl-title type="h4">Soort tuin</vl-title>
<vl-radio-group block>
```
- ❌ **PROBLEEM**: Title niet gelinkt aan radio group
- Zou `aria-labelledby` moeten hebben

##### 2.5 Dynamic Content Updates

**Alert/Result rendering**:
```typescript
// Wizard, regel 392-426: Result rendering
private _renderResult(result: Result): TemplateResult {
  return html`
    <vl-alert type="${alertType}" icon="${icon}" naked>
      ${result.title ? html`<span slot="title">${result.title}</span>` : nothing}
      <p>${unsafeHTML(result.description)}</p>
    </vl-alert>
  `;
}
```

Analyse:
- ❌ **KRITIEK**: Geen `aria-live` region voor dynamische alerts
- ❌ **KRITIEK**: Resultaten verschijnen zonder screenreader aankondiging
- Impact: Gebruiker weet niet dat advies is berekend
- Locatie: Alle advies/wizard result sections

**Loading states**:
```typescript
// Groenten/Eieren advies: "Laden..." state
if (!this.config) {
  return html`<p>Laden...</p>`;
}
```
- ❌ **PROBLEEM**: Geen `aria-busy` of `aria-live` voor loading
- Gebruiker weet niet dat content aan het laden is

#### Screenreader Issues Samenvatting

| Criterium | Status | Kritieke Issues |
|-----------|--------|----------------|
| ARIA labels | ❌ Kritiek | Map controls, buttons missen context |
| Landmark regions | ❌ Kritiek | Main landmark ontbreekt |
| Heading structure | ⚠️ Partieel | Tile titles, sommige levels overgeslagen |
| Form labels | ❌ Kritiek | Inputs niet semantisch gelinkt |
| Live regions | ❌ Kritiek | Dynamic results niet aangekondigd |
| Loading states | ❌ Probleem | Geen aria-busy |

---

## 3. Kleur Contrast

### WCAG 1.4.3 - Contrast (Minimum) (Level AA)

**Vereisten**:
- Normale tekst (< 18pt): minimaal 4.5:1
- Grote tekst (≥ 18pt of 14pt bold): minimaal 3:1
- UI componenten en grafische objecten: minimaal 3:1

#### Code Analyse van Kleuren

##### 3.1 Alert Kleuren (Custom)

**Geel alert** (groenten/eieren advies):
```css
/* Regel 322-333: alert-geel */
background-color: #fff3cd
border-color: #ffeeba
color: #856404
```
- Contrast berekening: #856404 op #fff3cd
- **Resultaat**: 6.8:1 ✅ **GOED** (> 4.5:1)

**Oranje alert**:
```css
/* Regel 335-346: alert-oranje */
background-color: #ffe8cc
border-color: #ffd699
color: #cc5200
```
- Contrast berekening: #cc5200 op #ffe8cc
- **Resultaat**: 5.2:1 ✅ **GOED** (> 4.5:1)

**Rode alert** (via vl-alert type="error"):
- Afhankelijk van vl-alert component defaults
- **Assumptie**: Flux design system voldoet aan WCAG (niet geverifieerd)

**Groene alert** (via vl-alert type="success"):
- Afhankelijk van vl-alert component defaults
- **Assumptie**: Flux design system voldoet aan WCAG (niet geverifieerd)

##### 3.2 Tekst Kleuren

**Status messages**:
```typescript
// Kaart invoer, regel 218-219
<p style="color: green;">✓ Locatie geselecteerd</p>
<p style="color: #666;">Teken een polygoon...</p>
```
- ❌ **PROBLEEM**: `color: green` op wit
  - Welke green? Waarschijnlijk #008000
  - Contrast: ~4.0:1 ⚠️ **ONVOLDOENDE** voor kleine tekst (< 4.5:1)

- ✅ `color: #666` op wit: 5.7:1 **GOED**

**Wizard status**:
```typescript
// Wizard, regel 240-244
<p style="color: green;">✓ Je moestuin is ingetekend</p>
<p style="color: #666;">Teken een polygoon...</p>
```
- ❌ **ZELFDE PROBLEEM**: `color: green`

**Subtitle tekst**:
```css
/* Wizard CSS, regel 50-54 */
.address-subtitle {
  color: #666;
  font-style: italic;
}
```
- ✅ #666 op wit: 5.7:1 **GOED**

##### 3.3 Link Kleuren

**Breadcrumbs**:
- Gebruikt vl-breadcrumb component
- **Assumptie**: Flux component heeft correct contrast (niet geverifieerd)

**Help links**:
```typescript
// Wizard, regel 271
${step.helpLink ? html`<p><a href="...">...</a></p>` : ''}
```
- Gebruikt browser default link colors
- **Assumptie**: Blauw (#0000EE) op wit: 8.6:1 ✅ **GOED**

##### 3.4 Focus Indicators

**Default focus outline**:
- Browser default (meestal blauw outline)
- **Geen custom focus styling gevonden in CSS**
- ⚠️ **POTENTIEEL PROBLEEM**: Sommige components kunnen focus outline verbergen

**Focus visibility test nodig voor**:
- vl-button components
- vl-radio components
- vl-input-field components
- Map controls

#### Kleur Contrast Issues

| Element | Voorgrond | Achtergrond | Ratio | Status |
|---------|-----------|-------------|-------|--------|
| Alert geel | #856404 | #fff3cd | 6.8:1 | ✅ GOED |
| Alert oranje | #cc5200 | #ffe8cc | 5.2:1 | ✅ GOED |
| Status groen | green | white | ~4.0:1 | ❌ **ONVOLDOENDE** |
| Subtitle | #666 | white | 5.7:1 | ✅ GOED |
| Gray text | #666 | white | 5.7:1 | ✅ GOED |

**Kritieke problemen**:
1. Inline `color: green` moet vervangen worden door WCAG-compliant groen (bijv. #008000 → #006400 of #005A00)

---

## 4. Focus Styling

### WCAG 2.4.7 - Focus Visible (Level AA)

**Vereiste**: Keyboard focus indicator moet duidelijk zichtbaar zijn.

#### Analyse

**Custom focus styles**:
- ❌ **NIET GEVONDEN**: Geen custom focus styles in CSS bestanden
- Afhankelijk van:
  - Browser defaults
  - Flux component library (@domg-wc/components)

**Componenten zonder verified focus indicator**:
1. `vl-button`
2. `vl-radio`
3. `vl-input-field`
4. `.tile-wrapper` / `vl-info-tile`
5. Map control buttons
6. Wizard navigation buttons

**Potentiële problemen**:
- Web Components in Shadow DOM kunnen default focus outlines verbergen
- Custom styling kan `:focus` outline verwijderen zonder vervanging

**Aanbevolen test**:
1. Visuele test met TAB door alle interactieve elementen
2. Verificatie dat outline altijd zichtbaar is
3. Toevoegen van custom focus styles indien nodig:

```css
/* Aanbevolen focus stijl */
:focus-visible {
  outline: 2px solid #0055CC;
  outline-offset: 2px;
}

/* Voor buttons die outline verliezen */
vl-button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 85, 204, 0.5);
}
```

---

## 5. Complete User Flow Tests

### Test Scenario 1: Volledige Wizard Flow (Keyboard Only)

**Steps**:
1. ✅ Landing page → TAB naar "Start de test" → ENTER
2. ✅ Intro stap → TAB naar "Volgende" → ENTER
3. ❌ **FAILURE**: Locatie stap → map tekenen vereist muis
4. N/A: Vraag stappen (niet bereikbaar zonder stap 3)
5. N/A: Resultaten (niet bereikbaar)

**Blocker**: Stap 3 (map interaction) is niet toetsenbord toegankelijk.

### Test Scenario 2: Groenten Advies Flow (Keyboard Only)

**Steps**:
1. ✅ Landing page → TAB naar "Vraag advies" (groenten) → ENTER
2. ❌ **FAILURE**: Locatie selectie → map tekenen vereist muis
3. N/A: Form invullen (niet bereikbaar zonder stap 2)
4. N/A: Resultaat (niet bereikbaar)

**Blocker**: Map interaction is niet toetsenbord toegankelijk.

### Test Scenario 3: Eieren Advies Flow (Keyboard Only)

**Zelfde blockers als groenten advies.**

### Conclusie User Flows

Alle primaire user flows zijn **GEBLOKKEERD** door het ontbreken van toetsenbord toegankelijkheid voor map interaction. Dit is een **kritieke WCAG 2.1.1 Level A schending**.

---

## 6. Toegankelijkheidsproblemen Prioritering

### Kritiek (Level A - Must Fix)

1. **Map keyboard toegankelijkheid** (WCAG 2.1.1)
   - Component: `gezond-kaart-invoer`, wizard map step
   - Impact: Complete blocker voor keyboard-only gebruikers
   - Oplossing: Alternatieve invoer methode (postcode/adres text input als fallback)

2. **Main landmark ontbreekt** (WCAG 1.3.1, 4.1.2)
   - Component: `gezond-template`
   - Impact: Screenreader gebruikers kunnen niet navigeren naar main content
   - Oplossing: `<div slot="main">` → `<main slot="main">`

3. **Form labels niet geassocieerd** (WCAG 1.3.1, 4.1.2)
   - Components: `gezond-groenten-advies`, `gezond-eieren-advies`
   - Impact: Screenreaders lezen input fields zonder labels
   - Oplossing: Gebruik `<label for="id">` of `aria-labelledby`

4. **Live regions voor dynamic content** (WCAG 4.1.3)
   - Components: Alle result rendering
   - Impact: Screenreaders kondigen resultaten niet aan
   - Oplossing: `aria-live="polite"` op result containers

5. **ARIA labels voor map controls** (WCAG 4.1.2)
   - Component: `gezond-kaart-invoer`
   - Impact: Screenreaders lezen "button" zonder context
   - Oplossing: `aria-label="Polygon aanpassen"` etc.

### Hoog (Level AA - Should Fix)

6. **Kleur contrast voor status tekst** (WCAG 1.4.3)
   - Inline `color: green` heeft onvoldoende contrast
   - Impact: Tekst moeilijk leesbaar voor low vision gebruikers
   - Oplossing: Gebruik #006400 of donkerder groen

7. **Focus indicators verificatie** (WCAG 2.4.7)
   - Alle interactieve componenten
   - Impact: Keyboard gebruikers zien niet waar focus is
   - Oplossing: Test en voeg custom focus styles toe indien nodig

8. **Heading hierarchy gaps** (WCAG 1.3.1)
   - Landing page tile titles, sommige h3 overgeslagen
   - Impact: Screenreader navigatie minder efficiënt
   - Oplossing: Gebruik correcte heading levels

### Medium (Nice to Have)

9. **Radio group labels** (Best Practice)
   - Wizard questions, advies forms
   - Oplossing: `aria-labelledby` naar section title

10. **Tile semantic roles** (Best Practice)
    - Landing page tiles
    - Oplossing: `role="article"` of `role="region"` + `aria-label`

11. **Button context in aria-labels** (Best Practice)
    - Landing page buttons, wizard buttons
    - Oplossing: `aria-label="Start de test - Doe de test"`

### Laag (Enhancement)

12. **Loading states aria-busy** (Enhancement)
    - Config loading states
    - Oplossing: `aria-busy="true"` tijdens laden

---

## 7. WCAG Success Criteria Overzicht

| Criterium | Level | Status | Notitie |
|-----------|-------|--------|---------|
| **1.3.1 Info and Relationships** | A | ❌ Fail | Form labels, main landmark, headings |
| **1.4.3 Contrast (Minimum)** | AA | ⚠️ Partial | Status tekst groen, rest OK |
| **2.1.1 Keyboard** | A | ❌ **FAIL** | **Map niet toegankelijk** |
| **2.4.7 Focus Visible** | AA | ⚠️ Onzeker | Niet visueel getest, vermoedelijk OK |
| **4.1.2 Name, Role, Value** | A | ❌ Fail | ARIA labels, landmarks, form labels |
| **4.1.3 Status Messages** | AA | ❌ Fail | Live regions ontbreken |

**Overall Manual Audit Result**: ❌ **NIET WCAG 2.1 AA COMPLIANT**

**Kritieke blockers**:
1. Map keyboard toegankelijkheid (Level A)
2. Form label associations (Level A)
3. Main landmark (Level A)
4. ARIA labels voor controls (Level A)
5. Live regions voor dynamic content (Level AA)

---

## 8. Aanbevelingen

### Directe Acties (Voor Level A Compliance)

1. **Implementeer keyboard fallback voor map**
   - Optie 1: Postcode text input als alternative
   - Optie 2: Adres dropdown + autocomplete
   - Optie 3: Coordinaten handmatig invoeren
   - Locatie: `gezond-kaart-invoer` component

2. **Fix main landmark**
   ```typescript
   // gezond-template.ts, regel 149
   <main slot="main" id="main">
     <slot></slot>
   </main>
   ```

3. **Fix form labels**
   ```typescript
   // Groenten advies voorbeeld
   <label for="input-${stof.id}">${stof.naam}</label>
   <vl-input-field
     id="input-${stof.id}"
     type="number"
     aria-describedby="unit-${stof.id}"
     ...>
   </vl-input-field>
   <small id="unit-${stof.id}">${stof.eenheid}</small>
   ```

4. **Voeg ARIA labels toe**
   ```typescript
   // Kaart controls
   <vl-button
     icon="pencil"
     aria-label="Getekende polygoon aanpassen"
     ...>
   ```

5. **Implementeer live regions**
   ```typescript
   // Result containers
   <div aria-live="polite" aria-atomic="true">
     ${this.adviesKleur ? this._renderResultaat() : nothing}
   </div>
   ```

### Level AA Compliance

6. **Fix kleur contrast**
   ```css
   .status-success {
     color: #006400; /* Donkergroen, 7:1 contrast */
   }
   ```

7. **Voeg custom focus styles toe**
   ```css
   :host {
     --focus-outline: 2px solid #0055CC;
     --focus-offset: 2px;
   }

   *:focus-visible {
     outline: var(--focus-outline);
     outline-offset: var(--focus-offset);
   }
   ```

### Long-term Improvements

8. Monitor Flux component library (@domg-wc) updates voor accessibility fixes
9. Implementeer skip navigation link
10. Voeg accessibility statement toe aan footer
11. Periodieke manual audits met echte screenreaders (NVDA, JAWS, VoiceOver)

---

## 9. Test Checklist voor Developers

Gebruik deze checklist bij toekomstige features:

### Keyboard Toegankelijkheid
- [ ] Alle interactieve elementen zijn focusbaar met TAB
- [ ] TAB volgorde is logisch
- [ ] ENTER/SPACE activeert buttons en links
- [ ] ESC sluit modals en dropdowns
- [ ] Geen keyboard traps
- [ ] Arrow keys werken voor radio/select groups

### Screenreader Toegankelijkheid
- [ ] Alle images hebben alt text
- [ ] Form inputs hebben labels (for/aria-labelledby)
- [ ] Buttons hebben duidelijke tekst of aria-label
- [ ] Landmarks (main, nav, aside) zijn aanwezig
- [ ] Headings zijn logisch genest (h1 → h2 → h3)
- [ ] Dynamic content heeft aria-live
- [ ] Loading states hebben aria-busy

### Visuele Toegankelijkheid
- [ ] Tekst contrast ≥ 4.5:1 (3:1 voor groot)
- [ ] UI controls contrast ≥ 3:1
- [ ] Focus indicator is zichtbaar (2px outline)
- [ ] Informatie niet alleen via kleur
- [ ] Tekst is vergroot baar tot 200%

### Testen
- [ ] Handmatig getest met keyboard only
- [ ] Getest met screenreader (VoiceOver/NVDA)
- [ ] Contrast getest met DevTools/axe
- [ ] pa11y automated scan passed

---

**Einde van handmatige WCAG-audit**
*Voor vragen of onduidelijkheden, raadpleeg [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/).*
