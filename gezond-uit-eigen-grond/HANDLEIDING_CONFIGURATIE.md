# Handleiding Configuratie Gezond uit Eigen Grond

Deze handleiding legt uit hoe je als beheerder de teksten, vragen en kaartlagen van de "Gezond uit Eigen Grond" toepassing kunt aanpassen zonder dat je programmeercode hoeft te wijzigen.

Alle configuratie bevindt zich in één bestand: `src/public/wizard-config.json`.

## 1. Het configuratiebestand openen

Open het bestand `src/public/wizard-config.json` in een teksteditor (zoals Visual Studio Code, Notepad, of TextEdit).
Dit bestand is geschreven in **JSON** formaat. Het is belangrijk dat de structuur (haakjes `{}`, `[]` en komma's `,`) intact blijft.

> **Tip voor beheerders:** Als de applicatie al online staat, vind je dit bestand meestal in de hoofdmap van de website als `wizard-config.json`. Je kunt dit bestand direct op de server aanpassen; een nieuwe installatie (build) is niet nodig. Vernieuw daarna wel de pagina in de browser.
>
> **Let op:** JSON is strikt. Vergeet geen komma's tussen items, gebruik altijd dubbele aanhalingstekens `"` voor teksten, en zorg dat haakjes netjes sluiten.

## 2. Algemene teksten aanpassen

Bovenaan het bestand vind je de sectie `"general"`. Hier pas je de titel en de introductietekst van de applicatie aan.

```json
"general": {
  "title": "Gezond uit eigen grond",
  "description": "De moestuin maakt een comeback...",
  "advice": {
    "title": "Algemeen advies",
    "items": [
      "Kies een goede locatie...",
      "Was steeds zorgvuldig je handen..."
    ]
  }
}
```

* **title/description**: Pas de tekst tussen de aanhalingstekens aan.
* **advice -> items**: Dit is een lijst van adviezen. Je kunt regels toevoegen of verwijderen. Zorg dat elke regel tussen `"` staat en dat ze gescheiden zijn door een komma (behalve de laatste).

## 3. Kaartlagen (WFS) configureren

De toepassing controleert automatisch of een perceel in de buurt ligt van bepaalde elementen (waterlopen, spoorwegen, etc.). Deze definities vind je onder `"answers"`.

Zoek naar items met `"type": "computed"` en `"source": { "type": "wfs" }`.

Voorbeeld:

```json
{
  "id": "waterloop",
  "type": "computed",
  "name": "Waterloop langs perceel",
  "source": { 
    "type": "wfs", 
    "url": "https://www.mercator.vlaanderen.be/raadpleegdienstenmercatorpubliek/ows",
    "layer": "ps:ps_hbtrl", 
    "buffer": 5 
  }
}
```

* **url**: De URL van de WFS service (bijv. Mercator public service).
* **layer**: De technische naam van de laag in de WFS (bijv. `ps:ps_hbtrl`).
* **buffer**: De afstand in meters waarbinnen gezocht moet worden.
  * `5` betekent: alles binnen 5 meter van het perceel.
  * `0` betekent: het perceel moet effectief in de zone liggen (overlappen).

**Nieuwe laag toevoegen?**
Je kunt een heel blok `{ ... }` kopiëren en plakken. Zorg dat de *"id"* uniek is (bijv. `"nieuwe_laag"`).

## 4. Vragen en Antwoorden aanpassen

Vragen worden gedefinieerd in de sectie `"steps"`. Zoek naar stappen met `"type": "question"`.

Voorbeeld van een vraag:

```json
{
  "answerId": "pesticiden",
  "title": "Pesticiden?",
  "description": "Heb je weet van het gebruik van pesticiden op je perceel?",
  "type": "radio",
  "options": [
    { "value": false, "label": "Neen" },
    { "value": true, "label": "Ja" }
  ]
}
```

* **answerId**: Dit koppelt de vraag aan de interne logica. **Verander dit niet** tenzij je weet wat je doet.
* **title / description**: Pas de vraagstelling aan.
* **options**: Pas de keuzemogelijkheden aan.
  * `value`: De waarde die achter de schermen wordt gebruikt (bijv. `true`, `false`, of `"tekst"`).
  * `label`: De tekst die de gebruiker ziet.

## 5. Resultaten en Adviezen aanpassen

Wanneer de gebruiker iets invult of wanneer er iets op de kaart gevonden wordt, toont de app een resultaatblokje. Deze staan onder `"results"`.

Elk blokje heeft een sleutel (bijv. `"dicht_bij_waterloop"`) die wordt aangeroepen door de regels.

Voorbeeld:

```json
"dicht_bij_waterloop": {
  "title": "Waterloop langs perceel",
  "description": "Je hof ligt langs een waterloop. Vermijd...",
  "type": "warning", 
  "important": false
},
```

* **title / description**: Pas de adviestekst aan. Je mag eenvoudige HTML gebruiken (zoals `<strong>` voor vetgedrukt).
* **type**: Bepaalt de kleur van het blokje.
  * `"success"` (Groen, alles in orde)
  * `"warning"` (Oranje, let op)
  * `"error"` (Rood, gevaar/actie vereist)
* **button** (optioneel): Voegt een actieknop toe.
  * `"button": { "caption": "Klik hier", "link": "https://..." }`

## 6. Regels (Rules) aanpassen

De sectie `"rules"` bepaalt welk resultaat getoond wordt op basis van de antwoorden.

Voorbeeld:

```json
{ "condition": { "waterloop": true }, "result": "dicht_bij_waterloop", "priority": 10 }
```

Dit betekent: "Als de check `waterloop` waar is (true), toon dan het resultaatblokje `dicht_bij_waterloop`".

Hier hoef je meestal niets aan te veranderen tenzij je nieuwe lagen of vragen hebt toegevoegd.

## Samenvatting

1. Open `src/public/wizard-config.json`.
2. Pas teksten aan tussen dubbele quotes.
3. Wijzig WFS lagen en buffer-afstanden indien nodig.
4. Controleer of je geen komma's vergeet.
5. Herlaad de pagina om de wijzigingen te zien.
