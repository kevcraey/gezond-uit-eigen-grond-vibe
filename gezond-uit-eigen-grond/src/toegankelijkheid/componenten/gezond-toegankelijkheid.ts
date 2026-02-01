import { BaseLitElement, defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { VlTitleComponent } from '@domg-wc/components/atom';
import { TemplateResult, html, css } from 'lit';

registerWebComponents([VlTitleComponent]);

export class GezondToegankelijkheid extends BaseLitElement {
  static get styles() {
    return [
      css`
        :host {
          display: block;
        }
        section {
          margin-bottom: 2rem;
        }
        ul {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        li {
          margin-bottom: 0.5rem;
        }
        .contact-info {
          background: #f5f5f5;
          padding: 1rem;
          border-left: 4px solid #0055CC;
          margin: 1rem 0;
        }
      `
    ];
  }

  protected render(): TemplateResult {
    return html`
      <vl-title type="h1">Toegankelijkheidsverklaring</vl-title>

      <section>
        <vl-title type="h2">Inleiding</vl-title>
        <p>
          Departement Omgeving verbindt zich ertoe om haar websites en mobiele applicaties toegankelijk te maken,
          overeenkomstig het Bestuursdecreet van 19 juli 2018 en de Europese norm EN 301 549.
          Deze toegankelijkheidsverklaring is van toepassing op <strong>Gezond uit eigen grond</strong>.
        </p>
      </section>

      <section>
        <vl-title type="h2">Nalevingsstatus</vl-title>
        <p>
          Deze website voldoet <strong>gedeeltelijk</strong> aan de Europese standaard EN 301 549.
        </p>
        <p>De hieronder vermelde niet-nalevingen en uitzonderingen doen zich voor.</p>
      </section>

      <section>
        <vl-title type="h2">Niet-toegankelijke content</vl-title>

        <vl-title type="h3">Niet-naleving van het bestuursdecreet</vl-title>
        <p>De hieronder vermelde content is om de volgende redenen niet toegankelijk:</p>

        <vl-title type="h4">Waarneembaar</vl-title>
        <ul>
          <li><strong>1.1.1 Niet-tekstuele content (Level A)</strong>: Kaart componenten missen tekstalternatieven voor getekende geometrieën</li>
          <li><strong>1.4.3 Contrast (Minimum) (Level AA)</strong>: Enkele kleurcombinaties in custom alert styling voldoen mogelijk niet aan 4.5:1 contrast ratio</li>
        </ul>

        <vl-title type="h4">Bedienbaar</vl-title>
        <ul>
          <li><strong>2.1.1 Toetsenbord (Level A)</strong>: Kaart tekenfunctionaliteit (polygon drawing) is niet volledig bedienbaar via toetsenbord</li>
          <li><strong>2.4.1 Blokken omzeilen (Level A)</strong>: Geen "skip to main content" link aanwezig</li>
          <li><strong>2.4.7 Focus zichtbaar (Level AA)</strong>: Focus indicator niet altijd voldoende zichtbaar op kaart controls</li>
        </ul>

        <vl-title type="h4">Begrijpelijk</vl-title>
        <ul>
          <li><strong>3.3.1 Foutidentificatie (Level A)</strong>: Validatie foutmeldingen in formulieren niet altijd duidelijk geassocieerd met invoervelden</li>
          <li><strong>3.3.2 Labels of instructies (Level A)</strong>: Enkele form fields missen expliciete labels (gebruiken placeholders)</li>
        </ul>

        <vl-title type="h4">Robuust</vl-title>
        <ul>
          <li><strong>4.1.2 Naam, rol, waarde (Level AA)</strong>: Custom kaart controls missen ARIA labels en roles</li>
          <li><strong>4.1.3 Statusberichten (Level AA)</strong>: Dynamische updates (bv. na berekening advies) worden niet aangekondigd aan screenreaders</li>
        </ul>
      </section>

      <section>
        <vl-title type="h2">Opstelling van deze toegankelijkheidsverklaring</vl-title>
        <p>Deze verklaring werd opgesteld op <strong>31 januari 2026</strong>.</p>
        <p>De verklaring werd herzien op <strong>31 januari 2026</strong>.</p>
        <p>Deze verklaring is opgesteld op basis van een zelf-evaluatie door Departement Omgeving.</p>
      </section>

      <section>
        <vl-title type="h2">Feedback en contactgegevens</vl-title>
        <p>Als u toegankelijkheidsproblemen ervaart bij het gebruik van deze website, contacteer ons dan:</p>

        <div class="contact-info">
          <p><strong>E-mail</strong>: info@omgeving.vlaanderen.be</p>
          <p><strong>Telefoon</strong>: 1700</p>
        </div>

        <p>We streven ernaar om binnen 14 dagen te reageren op uw melding.</p>
      </section>

      <section>
        <vl-title type="h2">Handhavingsprocedure</vl-title>
        <p>
          Indien u niet tevreden bent met de manier waarop wij omgaan met uw klacht over de toegankelijkheid
          van deze website, kan u terecht bij:
        </p>
        <p><strong>Raad voor het Milieurecht</strong><br>
        <a href="https://www.minaraad.be" target="_blank" rel="noopener noreferrer">www.minaraad.be</a></p>
      </section>

      <section>
        <vl-title type="h2">Technische specificaties</vl-title>
        <p>De toegankelijkheid van deze website is afhankelijk van de volgende technologieën:</p>
        <ul>
          <li>HTML5</li>
          <li>CSS3</li>
          <li>JavaScript/TypeScript</li>
          <li>Web Components (Lit 3.x)</li>
          <li>DOMG-WC component library</li>
        </ul>

        <p>Deze website is getest met de volgende browsers en hulpmiddelen:</p>
        <ul>
          <li>Google Chrome 120+ met VoiceOver (macOS)</li>
          <li>Firefox 120+</li>
          <li>Safari 17+ met VoiceOver (macOS)</li>
        </ul>
      </section>
    `;
  }
}

defineWebComponent(GezondToegankelijkheid, 'gezond-toegankelijkheid');
