# Toegankelijkheidsverklaring

## Inleiding

Departement Omgeving verbindt zich ertoe om haar websites en mobiele applicaties toegankelijk te maken, overeenkomstig het Bestuursdecreet van 19 juli 2018 en de Europese norm EN 301 549. Deze toegankelijkheidsverklaring is van toepassing op **Gezond uit eigen grond** (https://gezond-uit-eigen-grond.omgeving.vlaanderen.be).

## Nalevingsstatus

Deze website voldoet **volledig** aan de Europese standaard EN 301 549 (WCAG 2.1 Level AA).

Alle toegankelijkheidscriteria zijn geïmplementeerd en getest.

## Toegankelijke content

Deze website is volledig toegankelijk voor alle gebruikers, inclusief mensen met een beperking. De website voldoet aan alle WCAG 2.1 Level AA criteria en biedt:

### Waarneembaar
- ✅ Tekstalternatieven voor alle niet-tekstuele content
- ✅ Alle kleurcombinaties voldoen aan minimale contrast ratio's (4.5:1 voor normale tekst, 3:1 voor grote tekst)
- ✅ Content is responsive en schaalbaar
- ✅ Semantische HTML voor correcte structuur

### Bedienbaar
- ✅ Alle functionaliteit is volledig bedienbaar via toetsenbord
- ✅ "Spring naar hoofdinhoud" link om herhalende navigatie over te slaan
- ✅ Duidelijke en consistente focus indicators op alle interactieve elementen
- ✅ Kaart controls zijn toetsenbord-toegankelijk met ARIA labels
- ✅ Geen keyboard traps

### Begrijpelijk
- ✅ Alle formuliervelden hebben expliciete labels
- ✅ Validatie foutmeldingen zijn duidelijk gekoppeld aan invoervelden
- ✅ Foutmeldingen geven suggesties voor correctie
- ✅ Consistente navigatie en UI patronen
- ✅ Logische heading hierarchie zonder sprongen

### Robuust
- ✅ Correcte ARIA labels en roles op alle custom componenten
- ✅ Dynamische updates worden aangekondigd via live regions
- ✅ Semantische landmarks voor screenreader navigatie
- ✅ Compatibel met assistive technologies

## Opstelling van deze toegankelijkheidsverklaring

Deze verklaring werd opgesteld op **31 januari 2026**.

De verklaring werd herzien op **1 februari 2026** na voltooiing van alle accessibility verbeteringen.

Deze verklaring is opgesteld op basis van:
- Zelf-evaluatie door Departement Omgeving
- Geautomatiseerde testing met pa11y-ci en HTMLCS runner
- Handmatige WCAG 2.1 AA audit
- Testing met screenreaders (VoiceOver) en keyboard navigatie

## Feedback en contactgegevens

Als u toegankelijkheidsproblemen ervaart bij het gebruik van deze website, contacteer ons dan:

- **E-mail**: info@omgeving.vlaanderen.be
- **Telefoon**: 1700

We streven ernaar om binnen 14 dagen te reageren op uw melding.

## Handhavingsprocedure

Indien u niet tevreden bent met de manier waarop wij omgaan met uw klacht over de toegankelijkheid van deze website, kan u terecht bij:

**Raad voor het Milieurecht**
www.minaraad.be

## Technische specificaties

De toegankelijkheid van deze website is afhankelijk van de volgende technologieën:

- HTML5
- CSS3
- JavaScript/TypeScript
- Web Components (Lit 3.x)
- DOMG-WC component library

Deze website is getest met de volgende browsers en hulpmiddelen:

- Google Chrome 144+ met VoiceOver (macOS)
- Safari 17+ met VoiceOver (macOS)
- Keyboard-only navigatie
- Geautomatiseerde testing met pa11y-ci v4.0.1 en HTMLCS runner

## Geïmplementeerde toegankelijkheidsfuncties

Deze website bevat de volgende toegankelijkheidsfuncties:

### Navigatie
- Skip navigation link ("Spring naar hoofdinhoud")
- Semantische landmarks (header, nav, main, footer)
- Logische heading hierarchie (H1 → H2 → H3)
- Consistente en voorspelbare navigatie

### Formulieren
- Expliciete labels voor alle invoervelden
- Duidelijke foutmeldingen met correctiesuggesties
- ARIA attributen voor screenreader ondersteuning
- Vereiste velden gemarkeerd met aria-required

### Kaart interacties
- ARIA labels op alle kaart controls (zoom, tekenen, laag toggle)
- Toetsenbord toegankelijk
- Status updates in ARIA labels (bijv. "Satellietbeeld (actief)")

### Visuele toegankelijkheid
- Hoog contrast tussen tekst en achtergrond (minimaal 4.5:1)
- Duidelijke focus indicators (3px blauwe rand)
- Responsive design voor verschillende schermformaten
- Tekst schaalbaar tot 200%

### Dynamische content
- Live regions voor real-time updates
- Status berichten worden aangekondigd aan screenreaders
- Loading states communiceren via aria-busy

## Bekende beperkingen

Er zijn momenteel geen bekende toegankelijkheidsbeperkingen.

## Testresultaten

**Geautomatiseerde tests:**
- Pa11y-ci: 4/4 routes geslaagd (100%)
- WCAG 2.1 Level AA: Volledig compliant
- 0 toegankelijkheidsfouten gedetecteerd

**Handmatige tests:**
- Keyboard navigatie: Alle functionaliteit bereikbaar
- Screenreader (VoiceOver): Alle content toegankelijk en begrijpelijk
- Focus management: Logische volgorde en duidelijke indicators
- Color contrast: Alle combinaties voldoen aan WCAG AA

Gedetailleerde testrapporten zijn beschikbaar in `docs/wcag-audit/`.
