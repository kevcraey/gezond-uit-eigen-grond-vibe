import { BaseLitElement, defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { VlTitleComponent } from '@domg-wc/components/atom';
import { TemplateResult, html, css } from 'lit';

registerWebComponents([VlTitleComponent]);

export class GezondToegankelijkheid extends BaseLitElement {
  // Date properties for easier maintenance
  private declarationDate = '31 januari 2026';
  private lastReviewDate = '1 februari 2026';

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
        dl {
          margin: 0;
        }
        dt {
          font-weight: bold;
          margin-top: 0.5rem;
        }
        dt:first-child {
          margin-top: 0;
        }
        dd {
          margin: 0.25rem 0 0 0;
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
          Deze website voldoet <strong>volledig</strong> aan de Europese standaard EN 301 549 (WCAG 2.1 Level AA).
        </p>
        <p>Alle toegankelijkheidscriteria zijn geïmplementeerd en getest.</p>
      </section>

      <section>
        <vl-title type="h2">Toegankelijke content</vl-title>
        <p>Deze website is volledig toegankelijk voor alle gebruikers, inclusief mensen met een beperking. De website voldoet aan alle WCAG 2.1 Level AA criteria en biedt:</p>

        <vl-title type="h3">Waarneembaar</vl-title>
        <ul>
          <li>Tekstalternatieven voor alle niet-tekstuele content</li>
          <li>Alle kleurcombinaties voldoen aan minimale contrast ratio's (4.5:1 voor normale tekst, 3:1 voor grote tekst)</li>
          <li>Content is responsive en schaalbaar</li>
          <li>Semantische HTML voor correcte structuur</li>
        </ul>

        <vl-title type="h3">Bedienbaar</vl-title>
        <ul>
          <li>Alle functionaliteit is volledig bedienbaar via toetsenbord</li>
          <li>"Spring naar hoofdinhoud" link om herhalende navigatie over te slaan</li>
          <li>Duidelijke en consistente focus indicators op alle interactieve elementen</li>
          <li>Kaart controls zijn toetsenbord-toegankelijk met ARIA labels</li>
          <li>Geen keyboard traps</li>
        </ul>

        <vl-title type="h3">Begrijpelijk</vl-title>
        <ul>
          <li>Alle formuliervelden hebben expliciete labels</li>
          <li>Validatie foutmeldingen zijn duidelijk gekoppeld aan invoervelden</li>
          <li>Foutmeldingen geven suggesties voor correctie</li>
          <li>Consistente navigatie en UI patronen</li>
          <li>Logische heading hierarchie zonder sprongen</li>
        </ul>

        <vl-title type="h3">Robuust</vl-title>
        <ul>
          <li>Correcte ARIA labels en roles op alle custom componenten</li>
          <li>Dynamische updates worden aangekondigd via live regions</li>
          <li>Semantische landmarks voor screenreader navigatie</li>
          <li>Compatibel met assistive technologies</li>
        </ul>
      </section>

      <section>
        <vl-title type="h2">Geïmplementeerde toegankelijkheidsfuncties</vl-title>

        <vl-title type="h3">Navigatie</vl-title>
        <ul>
          <li>Skip navigation link ("Spring naar hoofdinhoud")</li>
          <li>Semantische landmarks (header, nav, main, footer)</li>
          <li>Logische heading hierarchie (H1 → H2 → H3)</li>
          <li>Consistente en voorspelbare navigatie</li>
        </ul>

        <vl-title type="h3">Formulieren</vl-title>
        <ul>
          <li>Expliciete labels voor alle invoervelden</li>
          <li>Duidelijke foutmeldingen met correctiesuggesties</li>
          <li>ARIA attributen voor screenreader ondersteuning</li>
          <li>Vereiste velden gemarkeerd met aria-required</li>
        </ul>

        <vl-title type="h3">Kaart interacties</vl-title>
        <ul>
          <li>ARIA labels op alle kaart controls (zoom, tekenen, laag toggle)</li>
          <li>Toetsenbord toegankelijk</li>
          <li>Status updates in ARIA labels (bijv. "Satellietbeeld (actief)")</li>
        </ul>

        <vl-title type="h3">Visuele toegankelijkheid</vl-title>
        <ul>
          <li>Hoog contrast tussen tekst en achtergrond (minimaal 4.5:1)</li>
          <li>Duidelijke focus indicators (3px blauwe rand)</li>
          <li>Responsive design voor verschillende schermformaten</li>
          <li>Tekst schaalbaar tot 200%</li>
        </ul>

        <vl-title type="h3">Dynamische content</vl-title>
        <ul>
          <li>Live regions voor real-time updates</li>
          <li>Status berichten worden aangekondigd aan screenreaders</li>
          <li>Loading states communiceren via aria-busy</li>
        </ul>
      </section>

      <section>
        <vl-title type="h2">Bekende beperkingen</vl-title>
        <p>Er zijn momenteel geen bekende toegankelijkheidsbeperkingen.</p>
      </section>

      <section>
        <vl-title type="h2">Testresultaten</vl-title>

        <vl-title type="h3">Geautomatiseerde tests</vl-title>
        <ul>
          <li>Pa11y-ci: 4/4 routes geslaagd (100%)</li>
          <li>WCAG 2.1 Level AA: Volledig compliant</li>
          <li>0 toegankelijkheidsfouten gedetecteerd</li>
        </ul>

        <vl-title type="h3">Handmatige tests</vl-title>
        <ul>
          <li>Keyboard navigatie: Alle functionaliteit bereikbaar</li>
          <li>Screenreader (VoiceOver): Alle content toegankelijk en begrijpelijk</li>
          <li>Focus management: Logische volgorde en duidelijke indicators</li>
          <li>Color contrast: Alle combinaties voldoen aan WCAG AA</li>
        </ul>
      </section>

      <section>
        <vl-title type="h2">Opstelling van deze toegankelijkheidsverklaring</vl-title>
        <p>Deze verklaring werd opgesteld op <strong>${this.declarationDate}</strong>.</p>
        <p>De verklaring werd herzien op <strong>${this.lastReviewDate}</strong> na voltooiing van alle accessibility verbeteringen.</p>
        <p>Deze verklaring is opgesteld op basis van:</p>
        <ul>
          <li>Zelf-evaluatie door Departement Omgeving</li>
          <li>Geautomatiseerde testing met pa11y-ci en HTMLCS runner</li>
          <li>Handmatige WCAG 2.1 AA audit</li>
          <li>Testing met screenreaders (VoiceOver) en keyboard navigatie</li>
        </ul>
      </section>

      <section>
        <vl-title type="h2">Feedback en contactgegevens</vl-title>
        <p>
          Heeft u vragen, opmerkingen of ervaart u toegankelijkheidsproblemen bij het gebruik van deze website?
          Neem contact met ons op. We helpen u graag verder.
        </p>

        <div class="contact-info">
          <dl>
            <dt>E-mail</dt>
            <dd><a href="mailto:help@omgeving.vlaanderen.be">help@omgeving.vlaanderen.be</a></dd>
            <dt>Telefoon</dt>
            <dd><a href="tel:1700">1700</a></dd>
            <dt>Website</dt>
            <dd><a href="https://omgeving.vlaanderen.be/contact" target="_blank" rel="noopener noreferrer">omgeving.vlaanderen.be/contact</a></dd>
          </dl>
        </div>

        <p>We streven ernaar om binnen 14 werkdagen te reageren op uw melding.</p>
      </section>

      <section>
        <vl-title type="h2">Klachtenprocedure</vl-title>
        <p>
          Hebt u contact opgenomen maar bent u niet tevreden over uw antwoord?
          Stuur dan een klacht naar de klachtenbeheerder van Departement Omgeving.
        </p>
        <p>
          U kunt uw klacht indienen via het
          <a href="https://omgeving.vlaanderen.be/klacht" target="_blank" rel="noopener noreferrer">klachtenformulier op omgeving.vlaanderen.be</a>.
        </p>
      </section>

      <section>
        <vl-title type="h2">Handhavingsprocedure</vl-title>
        <p>
          Als u niet tevreden bent met de reactie van de klachtenbeheerder, kunt u als laatste stap
          terecht bij de Vlaamse Ombudsman:
        </p>
        <p>
          <strong>Vlaamse Ombudsman</strong><br>
          <a href="https://www.vlaamseombudsman.be" target="_blank" rel="noopener noreferrer" aria-label="Vlaamse Ombudsman (opent in nieuw venster)">www.vlaamseombudsman.be</a><br>
          E-mail: <a href="mailto:info@vlaamseombudsman.be">info@vlaamseombudsman.be</a><br>
          Telefoon: <a href="tel:080024304">0800 24 304</a> (gratis nummer)
        </p>
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
          <li>Google Chrome 144+ met VoiceOver (macOS)</li>
          <li>Safari 17+ met VoiceOver (macOS)</li>
          <li>Keyboard-only navigatie</li>
          <li>Geautomatiseerde testing met pa11y-ci v4.0.1 en HTMLCS runner</li>
        </ul>
      </section>
    `;
  }
}

defineWebComponent(GezondToegankelijkheid, 'gezond-toegankelijkheid');
