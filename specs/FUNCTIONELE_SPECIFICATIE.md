# Gezond Grond Tool - Functionele Specificatie

> **Status**: Concept v1.0  
> **Doel**: Dit document beschrijft de huidige functionaliteiten van de applicatie en dient als basis voor verdere iteratie.

---

## 1. Overzicht

**Doel van de tool**: Burgers helpen inschatten of hun tuin geschikt is voor het kweken van groenten of het houden van kippen, door middel van een stapsgewijze vragenlijst.

**Doelgroep**: Inwoners van Vlaanderen met een tuin

**Formaat**: 4-stappen wizard met progressie-indicator

---

## 2. Wizard Stappen

### Stap 1: Adres Identificatie

| Functionaliteit | Beschrijving | Status |
|-----------------|--------------|--------|
| Adres invoer | Vrij tekstveld voor adres | ✅ |
| Adres suggesties | Dropdown met suggesties tijdens typen | ✅ |
| Geocoding | Vertaling adres → coördinaten via Nominatim API | ✅ |
| Kaartweergave | Interactieve OpenStreetMap kaart | ✅ |
| Marker verslepen | Gebruiker kan locatie verfijnen | ✅ |
| Adres bevestiging | Expliciete bevestiging vóór doorgaan | ✅ |

**Open vragen:**

- [ ] Moeten we de zoekresultaten beperken tot Vlaanderen?
- [ ] Wat als het adres niet gevonden wordt?

---

### Stap 2: Bodemvreemde Materialen

| Functionaliteit | Beschrijving | Status |
|-----------------|--------------|--------|
| Enkelvoudige selectie | 5 radio button opties | ✅ |
| Directe feedback | "Toon aanbeveling" knop toont resultaat | ✅ |
| Kleur-codering | Groen/oranje/rood gebaseerd op risico | ✅ |

**Antwoordopties:**

1. Geen van onderstaande → 🟢 Veilig
2. Beperkte hoeveelheid (baksteen, beton, etc.) → 🟠 Aandacht
3. Assen (PAK, ZM) → 🔴 Risico
4. Asbestresten/asbesthoudende materialen → 🔴 Risico
5. Veel aangetroffen → 🔴 Risico

**Open vragen:**

- [ ] Is de huidige indeling van opties correct?
- [ ] Moeten we uitleg/voorbeelden tonen bij elke optie?

---

### Stap 3: Asbest

| Functionaliteit | Beschrijving | Status |
|-----------------|--------------|--------|
| Ja/Nee vraag | Asbesthoudende daken/wanden aanwezig? | ✅ |
| Hulp link | "Hoe kan ik asbest herkennen?" | ✅ (placeholder) |
| Directe feedback | Aanbeveling gebaseerd op antwoord | ✅ |

**Vraag:**
> Zijn er asbesthoudende daken of wanden met asbesthoudende bekleding waarvan het water afloopt naar je moestuin of kippenren aanwezig?

**Open vragen:**

- [ ] Moet de hulplink naar een externe pagina verwijzen?
- [ ] Zijn er meer specifieke asbest-gerelateerde vragen nodig?

---

### Stap 4: Bodemverontreiniging

| Functionaliteit | Beschrijving | Status |
|-----------------|--------------|--------|
| Meerdere Ja/Nee vragen | 3 afzonderlijke vragen | ✅ |
| Per-vraag feedback | Elk antwoord genereert eigen aanbeveling | ✅ |

**Vragen:**

1. **Opslagtanks/oliegeur**: Weet van opslagtanks, morsen smeermiddelen, oliegeur?
2. **Verbranden**: Weet van verbranden afval, stoken, assen uitspreiden?
3. **Pesticiden**: Weet van pesticidengebruik?

**Open vragen:**

- [ ] Zijn dit de juiste vragen voor bodemverontreiniging?
- [ ] Moeten we meer context/uitleg toevoegen bij elke vraag?

---

## 3. Resultaatpagina

### Adres-gebaseerde Resultaten

Automatische controles op basis van locatie:

| Controle | Bron | Status |
|----------|------|--------|
| Bodemverontreiniging VL databank | *Gesimuleerd* | 🔲 TODO |
| Waterloop in de buurt | *Gesimuleerd* | 🔲 TODO |
| PFAS no-regret zones | *Gesimuleerd* | 🔲 TODO |
| Nabijheid brandweerkazerne | *Gesimuleerd* | 🔲 TODO |
| Drukke weg of spoorweg | *Gesimuleerd* | 🔲 TODO |
| Industriële activiteiten | *Gesimuleerd* | 🔲 TODO |

### Survey-gebaseerde Resultaten

Samenvatting van antwoorden uit stappen 2-4 met bijbehorende aanbevelingen.

### Algemeen Advies

Vaste tekst met algemene tips voor moestuiniers.

**Open vragen:**

- [ ] Welke echte databronnen moeten worden geïntegreerd?
- [ ] Moet de gebruiker een PDF-export kunnen maken?
- [ ] Call-to-action "Vraag je bodemstalen op" - waar linkt dit naartoe?

---

## 4. Kleur-codering Systeem

| Kleur | Betekenis | Gebruik |
|-------|-----------|---------|
| 🟢 Groen | Veilig | Geen risico's gedetecteerd |
| 🟠 Oranje | Aandacht | Extra voorzorgsmaatregelen aanbevolen |
| 🔴 Rood | Risico | Actie vereist, niet aanbevolen zonder maatregelen |
| 🔵 Blauw | Onbekend | Geen data beschikbaar voor deze controle |

---

## 5. Technische Integraties

| Component | Huidige Oplossing | Productie Vereist |
|-----------|-------------------|-------------------|
| Geocoding | Nominatim (OpenStreetMap) | ❓ |
| Kaarten | Leaflet.js + OSM tiles | ❓ |
| VL Databank | *Niet geïmplementeerd* | API nodig |
| PFAS zones | *Niet geïmplementeerd* | GIS data nodig |
| Overstromingsgebied | *Niet geïmplementeerd* | GIS data nodig |

---

## 6. Navigatie & UX

| Functionaliteit | Beschrijving | Status |
|-----------------|--------------|--------|
| Progressie-indicator | Visuele weergave stappen 1-4 | ✅ |
| Volgende/Terug knoppen | Navigatie tussen stappen | ✅ |
| Validatie stap 1 | Adres moet bevestigd zijn | ✅ |
| Scroll naar content | Automatisch scrollen bij stap-wissel | ✅ |
| Responsive design | Mobile-vriendelijk | ✅ |

---

## 7. Nog te Bespreken

### Functioneel

1. Welke databronnen zijn beschikbaar voor adres-gebaseerde controles?
2. Moet de gebruiker zijn resultaten kunnen opslaan/doorsturen?
3. Is er een koppeling met bodemattest nodig?
4. Moeten we meerdere locaties per sessie ondersteunen?

### Inhoudelijk

1. Zijn de huidige survey-vragen volledig en correct geformuleerd?
2. Klopt de risico-indeling (groen/oranje/rood) per antwoord?
3. Wat is de exacte tekst voor het "Algemeen advies" gedeelte?

### Technisch

1. Waar wordt de applicatie gehost?
2. Is authenticatie/login nodig?
3. Moeten we analytics tracken?

---

*Laatste update: 15 januari 2026*
