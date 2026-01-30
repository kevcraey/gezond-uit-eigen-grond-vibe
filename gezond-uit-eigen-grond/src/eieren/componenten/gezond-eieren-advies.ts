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
  @state() private locationData: LocationChangedEvent | null = null;

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
      <p>Bereken op basis van je labo-resultaten hoeveel eieren van je eigen kippen je veilig kan eten.</p>

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
        <p>Selecteer de locatie van je kippenren op de kaart.</p>

        <gezond-kaart-invoer
          mode="point"
          instructie="Klik op de kaart om de locatie van je kippenren aan te duiden."
          @location-changed=${this._handleLocationChanged}>
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
          <p>Dit is belangrijk omdat de totale blootstelling aan dioxines en PCB's afhangt van je volledige voeding.</p>
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

        ${this.locationData?.address ? html`
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
                <td>Kinderen &lt; 6 jaar</td>
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

  private _handleLocationChanged(e: CustomEvent<LocationChangedEvent>) {
    this.locationData = e.detail;
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
    window.location.hash = '';
  }

  private _reset() {
    this.activeStep = 1;
    this.locationData = null;
    this.eetGroenten = null;
    this.pcddF = null;
    this.dioxPCB = null;
    this.adviesId = null;
    if (this.kaartInvoer) {
      this.kaartInvoer.reset();
    }
  }
}

defineWebComponent(GezondEierenAdvies, 'gezond-eieren-advies');
