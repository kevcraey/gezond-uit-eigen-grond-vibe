import { BaseLitElement, defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlTitleComponent } from '@domg-wc/components/atom';
import { VlAlert } from '@domg-wc/components/block/alert';
import { VlWizard, VlWizardPane } from '@domg-wc/components/block/wizard';
import { VlFormLabelComponent, VlInputFieldComponent } from '@domg-wc/components/form';
import { VlRadioComponent, VlRadioGroupComponent } from '@domg-wc/components/form/radio-group';
import { vlGridStyles, vlStackedStyles } from '@domg-wc/styles';
import { accessibilityStyles } from '../../common/styles/accessibility.css';
import { TemplateResult, html, css, nothing } from 'lit';
import { state, query } from 'lit/decorators.js';
import '../../common/componenten/gezond-kaart-invoer';
import { GezondKaartInvoer, LocationChangedEvent } from '../../common/componenten/gezond-kaart-invoer';
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

  // Stap 1: Locatie
  @state() private locationData: LocationChangedEvent | null = null;

  // Stap 2: Gegevens
  @state() private tuinType: string = '';
  @state() private waarden: { [stofId: string]: number | null } = {};

  // Stap 3: Resultaat
  @state() private adviesKleur: AdviesKleur | null = null;
  @state() private cdAdviesNiveau: string | null = null;

  // Validatie
  @state() private errors: { [key: string]: string } = {};

  // Live region announcements
  @state() private announceMessage: string = '';

  @query('gezond-kaart-invoer') private kaartInvoer!: GezondKaartInvoer;

  static get styles() {
    return [
      vlGridStyles,
      vlStackedStyles,
      accessibilityStyles,
      css`
        :host {
          display: block;
        }
        .content-section {
          margin-bottom: 3rem;
        }

        /* Custom Alert Colors are injected via JS to penetrate Shadow DOM */

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
        .actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .result-section {
          scroll-margin-top: 2rem;
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

    const heeftTuinType = this.tuinType !== '';
    const heeftMinstensEenWaarde = this.config.groenten.stoffen.some(
      s => this.waarden[s.id] !== null && this.waarden[s.id] !== undefined
    );
    const alleVeldenIngevuld = this.locationData?.postcode && heeftTuinType && heeftMinstensEenWaarde;

    return html`
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        class="visually-hidden">
        ${this.announceMessage}
      </div>

      <vl-title type="h1">Advies groenten</vl-title>
      <p>Bereken op basis van je labo-resultaten of je veilig groenten kan kweken in je moestuin.</p>

      <div class="content-section">
        <vl-title type="h2">1. Locatie</vl-title>
        <p>Selecteer de locatie van je moestuin op de kaart. We gebruiken dit om je postcode te bepalen.</p>

        ${this.errors['locatie'] ? html`
          <vl-alert type="error" icon="alert-triangle" role="alert">
            ${this.errors['locatie']}
          </vl-alert>
        ` : nothing}

        <gezond-kaart-invoer
          mode="polygon"
          instructie="Zoek eerst je adres via de zoekbalk, en teken daarna de exacte locatie van je moestuin."
          @location-changed=${this._handleLocationChanged}>
        </gezond-kaart-invoer>
      </div>

      <div class="content-section">
        <vl-title type="h2">2. Gegevens invoeren</vl-title>

        <div class="form-group">
          <vl-title type="h4">Soort tuin</vl-title>

          ${this.errors['tuinType'] ? html`
            <vl-alert type="error" icon="alert-triangle" role="alert">
              ${this.errors['tuinType']}
            </vl-alert>
          ` : nothing}

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

          ${this.errors['waarden'] ? html`
            <vl-alert type="error" icon="alert-triangle" role="alert">
              ${this.errors['waarden']}
            </vl-alert>
          ` : nothing}

          <div class="stoffen-grid">
            ${this.config.groenten.stoffen.map(stof => html`
              <div class="stof-input">
                <vl-form-label for="input-${stof.id}">
                  ${stof.naam} (${stof.id})
                </vl-form-label>
                <vl-input-field
                  id="input-${stof.id}"
                  type="number"
                  step="0.1"
                  aria-describedby="hint-${stof.id}"
                  .value=${this.waarden[stof.id]?.toString() || ''}
                  @input=${(e: Event) => this._handleStofInput(stof.id, e)}>
                </vl-input-field>
                <small id="hint-${stof.id}">${stof.eenheid}</small>
              </div>
            `)}
          </div>
        </div>

        <div class="actions">
          <vl-button @click=${this._berekenAdvies} ?disabled=${!alleVeldenIngevuld}>Bereken advies</vl-button>
          ${this.adviesKleur ? html`<vl-button secondary @click=${this._reset}>Opnieuw beginnen</vl-button>` : nothing}
        </div>
      </div>

      ${this.adviesKleur ? this._renderResultaat() : nothing}
    `;
  }

  private _renderResultaat(): TemplateResult {
    if (!this.config || !this.adviesKleur) return html``;

    const advies = this.config.groenten.adviezen[this.adviesKleur];
    const cdAdvies = this.cdAdviesNiveau ? this.config.groenten.cdAdvies[this.cdAdviesNiveau] : null;
    const isInCdRegio = this.locationData?.postcode &&
      this.config.groenten.cdUitzonderingPostcodes.includes(this.locationData.postcode);

    // Map kleuren naar alert types en classes
    let alertType = 'success';
    let alertClass = '';
    let icon = 'check-circle';

    switch (this.adviesKleur) {
      case 'groen':
        alertType = 'success';
        icon = 'check-circle';
        break;
      case 'geel':
        alertType = 'warning';
        alertClass = 'alert-geel';
        icon = 'alert-circle';
        break;
      case 'oranje':
        alertType = 'warning';
        alertClass = 'alert-oranje';
        icon = 'alert-triangle';
        break;
      case 'rood':
        alertType = 'error';
        icon = 'alert-triangle';
        break;
    }

    return html`
      <div class="content-section result-section" id="resultaat">
        <vl-title type="h2">3. Je advies</vl-title>

        ${this.locationData?.address ? html`
          <p><strong>Locatie:</strong> ${this.locationData.address}</p>
        ` : nothing}

        <vl-alert type="${alertType}" icon="${icon}" class="${alertClass}">
          <span slot="title">${advies.titel}</span>
          <div>
            <p>${advies.tekst}</p>

            ${advies.tips && advies.tips.length > 0 ? html`
              <p><strong>Tips:</strong></p>
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
        </vl-alert>

        ${cdAdvies && isInCdRegio ? html`
          <div class="cd-advies">
            <vl-title type="h4">Bijzonder advies voor cadmium (Cd)</vl-title>
            <p>Je bent gelegen in een regio met verhoogde cadmiumwaarden. Let extra op:</p>
            <p>${cdAdvies.tekst}</p>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _handleLocationChanged(e: CustomEvent<LocationChangedEvent>) {
    this.locationData = e.detail;
  }

  private _handleStofInput(stofId: string, e: Event) {
    const input = e.target as HTMLInputElement;
    const value = input.value ? parseFloat(input.value) : null;
    this.waarden = { ...this.waarden, [stofId]: value };
  }

  private _validate(): boolean {
    this.errors = {};

    if (!this.locationData?.postcode) {
      this.errors['locatie'] = 'Selecteer een locatie op de kaart';
    }

    if (!this.tuinType) {
      this.errors['tuinType'] = 'Selecteer een soort tuin';
    }

    const heeftWaarden = this.config?.groenten.stoffen.some(
      s => this.waarden[s.id] !== null && this.waarden[s.id] !== undefined
    );

    if (!heeftWaarden) {
      this.errors['waarden'] = 'Vul minimaal één labo-resultaat in';
    }

    return Object.keys(this.errors).length === 0;
  }

  private _berekenAdvies() {
    if (!this._validate()) {
      this.announceMessage = `Fout: ${Object.values(this.errors)[0]}`;
      // Focus eerste error
      const firstErrorKey = Object.keys(this.errors)[0];
      const errorElement = this.shadowRoot?.querySelector(`[id*="${firstErrorKey}"]`);
      if (errorElement instanceof HTMLElement) {
        errorElement.focus();
      }
      return;
    }

    if (!this.config || !this.locationData) return;

    const invoer: GroentenInvoer = {
      tuinType: this.tuinType,
      postcode: this.locationData.postcode || '',
      waarden: this.waarden
    };

    this.adviesKleur = bepaalGroentenAdvies(invoer, this.config.groenten);
    this.cdAdviesNiveau = bepaalCdAdviesNiveau(this.waarden['Cd']);

    // Announce result
    const advies = this.config.groenten.adviezen[this.adviesKleur!];
    this.announceMessage = `Advies berekend: ${advies.titel}`;

    // Scroll naar resultaat
    setTimeout(() => {
      const resultElement = this.shadowRoot?.getElementById('resultaat');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  private _reset() {
    this.locationData = null;
    this.tuinType = '';
    this.waarden = {};
    this.adviesKleur = null;
    this.cdAdviesNiveau = null;
    this.errors = {};
    if (this.kaartInvoer) {
      this.kaartInvoer.reset();
    }
    // Scroll naar boven
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updated(changedProperties: any) {
    super.updated(changedProperties);
    this._injectAlertStyles();

    // Clear announcement after it's been read
    if (changedProperties.has('announceMessage') && this.announceMessage) {
      setTimeout(() => {
        this.announceMessage = '';
      }, 1000);
    }
  }

  private _injectAlertStyles() {
    const alerts = this.shadowRoot?.querySelectorAll('vl-alert');
    alerts?.forEach(alert => {
      // Check if we can access the shadowRoot (it should be open for LitElements)
      if (alert.shadowRoot && !alert.shadowRoot.querySelector('style#custom-alert-styles')) {
        const style = document.createElement('style');
        style.id = 'custom-alert-styles';
        style.textContent = `
          :host(.alert-geel) .vl-alert {
            background-color: #fef8e7 !important;
            border-color: #f4d03f !important;
            color: #7d6608 !important;
          }
          :host(.alert-geel) .vl-icon::before {
             color: #7d6608 !important;
          }
          :host(.alert-geel) .vl-alert__title,
          :host(.alert-geel) .vl-alert__message {
             color: #7d6608 !important;
          }

          :host(.alert-oranje) .vl-alert {
            background-color: #fff4e6 !important;
            border-color: #ff9933 !important;
            color: #993d00 !important;
          }
          :host(.alert-oranje) .vl-icon::before {
             color: #993d00 !important;
          }
          :host(.alert-oranje) .vl-alert__title,
          :host(.alert-oranje) .vl-alert__message {
             color: #993d00 !important;
          }
        `;
        alert.shadowRoot.appendChild(style);
      }
    });
  }
}

defineWebComponent(GezondGroentenAdvies, 'gezond-groenten-advies');
