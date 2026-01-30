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
  @state() private activeStep: number = 1;

  // Stap 1: Locatie
  @state() private locationData: LocationChangedEvent | null = null;

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
      <p>Bereken op basis van je labo-resultaten of je veilig groenten kan kweken in je moestuin.</p>

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
        <p>Selecteer de locatie van je moestuin op de kaart. We gebruiken dit om je postcode te bepalen.</p>

        <gezond-kaart-invoer
          mode="point"
          instructie="Klik op de kaart om de locatie van je moestuin aan te duiden."
          @location-changed=${this._handleLocationChanged}>
        </gezond-kaart-invoer>

        <div class="wizard-actions">
          <vl-button secondary @click=${this._naarLanding}>Terug naar overzicht</vl-button>
          <vl-button @click=${this._naarStap2} ?disabled=${!this.locationData?.postcode}>Volgende</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderStap2(): TemplateResult {
    if (!this.config) return html``;

    const heeftTuinType = this.tuinType !== '';
    const heeftMinstensEenWaarde = this.config.groenten.stoffen.some(
      s => this.waarden[s.id] !== null && this.waarden[s.id] !== undefined
    );
    const alleVeldenIngevuld = heeftTuinType && heeftMinstensEenWaarde;

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

        ${this.locationData?.address ? html`
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

  private _handleLocationChanged(e: CustomEvent<LocationChangedEvent>) {
    this.locationData = e.detail;
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
    window.location.hash = '';
  }

  private _reset() {
    this.activeStep = 1;
    this.locationData = null;
    this.tuinType = '';
    this.waarden = {};
    this.adviesKleur = null;
    this.cdAdviesNiveau = null;
    if (this.kaartInvoer) {
      this.kaartInvoer.reset();
    }
  }
}

defineWebComponent(GezondGroentenAdvies, 'gezond-groenten-advies');
