import { BaseLitElement, defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlTitleComponent } from '@domg-wc/components/atom';
import { VlAlert } from '@domg-wc/components/block/alert';
import { VlFormLabelComponent, VlInputFieldComponent } from '@domg-wc/components/form';
import { VlRadioComponent, VlRadioGroupComponent } from '@domg-wc/components/form/radio-group';
import { vlGridStyles, vlStackedStyles } from '@domg-wc/styles';
import { accessibilityStyles } from '../../common/styles/accessibility.css';
import { TemplateResult, html, css, nothing } from 'lit';
import { state, query } from 'lit/decorators.js';
import '../../common/componenten/gezond-kaart-invoer';
import { GezondKaartInvoer, LocationChangedEvent } from '../../common/componenten/gezond-kaart-invoer';
import { AdviesConfig, EierenInvoer, bepaalEierenAdvies } from '../../common/domein/advies-config';

registerWebComponents([
  VlButtonComponent,
  VlTitleComponent,
  VlAlert,
  VlFormLabelComponent,
  VlInputFieldComponent,
  VlRadioGroupComponent,
  VlRadioComponent
]);

export class GezondEierenAdvies extends BaseLitElement {
  @state() private config: AdviesConfig | null = null;

  // Stap 1: Locatie
  @state() private locationData: LocationChangedEvent | null = null;

  // Stap 2: Gegevens
  @state() private eetGroenten: boolean | null = null;
  @state() private pcddF: number | null = null;
  @state() private dioxPCB: number | null = null;

  // Stap 3: Resultaat
  @state() private adviesId: string | null = null;

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

        /* Custom Alert Colors are injected via JS to penetrate Shadow DOM */

        .content-section {
          margin-bottom: 3rem;
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

    const alleVeldenIngevuld = this.locationData &&
      this.eetGroenten !== null &&
      this.pcddF !== null && this.dioxPCB !== null;

    return html`
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        class="visually-hidden">
        ${this.announceMessage}
      </div>

      <vl-title type="h1">Advies eieren</vl-title>
      <p>Bereken op basis van je labo-resultaten hoeveel eieren van je eigen kippen je veilig kan eten.</p>

      <div class="content-section">
        <vl-title type="h2">1. Locatie</vl-title>
        <p>Selecteer de locatie van je kippenren op de kaart.</p>

        ${this.errors['locatie'] ? html`
          <vl-alert type="error" icon="alert-triangle" role="alert">
            ${this.errors['locatie']}
          </vl-alert>
        ` : nothing}

        <gezond-kaart-invoer
          mode="polygon"
          instructie="Zoek eerst je adres via de zoekbalk, en teken daarna de exacte locatie van je kippenren."
          @location-changed=${this._handleLocationChanged}>
        </gezond-kaart-invoer>
      </div>

      <div class="content-section">
        <vl-title type="h2">2. Gegevens invoeren</vl-title>
        
        <div class="form-group">
          <vl-title type="h4">Eet je ook groenten uit eigen tuin?</vl-title>
          <p>Dit is belangrijk omdat de totale blootstelling aan dioxines en PCB's afhangt van je volledige voeding.</p>

          ${this.errors['eetGroenten'] ? html`
            <vl-alert type="error" icon="alert-triangle" role="alert">
              ${this.errors['eetGroenten']}
            </vl-alert>
          ` : nothing}

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

          ${this.errors['waarden'] ? html`
            <vl-alert type="error" icon="alert-triangle" role="alert">
              ${this.errors['waarden']}
            </vl-alert>
          ` : nothing}

          <div class="stoffen-inputs">
            <div class="stof-input">
              <vl-form-label for="input-pcdd-f">PCDD/F's</vl-form-label>
              <vl-input-field
                id="input-pcdd-f"
                type="number"
                step="0.01"
                aria-describedby="hint-pcdd-f"
                .value=${this.pcddF?.toString() || ''}
                @input=${(e: Event) => this._handlePcddInput(e)}>
              </vl-input-field>
              <small id="hint-pcdd-f">ng/kg ds</small>
            </div>
            <div class="stof-input">
              <vl-form-label for="input-diox-pcb">Dioxineachtige PCB's</vl-form-label>
              <vl-input-field
                id="input-diox-pcb"
                type="number"
                step="0.01"
                aria-describedby="hint-diox-pcb"
                .value=${this.dioxPCB?.toString() || ''}
                @input=${(e: Event) => this._handleDioxInput(e)}>
              </vl-input-field>
              <small id="hint-diox-pcb">ng/kg ds</small>
            </div>
          </div>
        </div>

        <div class="actions">
          <vl-button @click=${this._berekenAdvies} ?disabled=${!alleVeldenIngevuld}>Bereken advies</vl-button>
          ${this.adviesId ? html`<vl-button secondary @click=${this._reset}>Opnieuw beginnen</vl-button>` : nothing}
        </div>
      </div>

      ${this.adviesId ? this._renderResultaat() : nothing}
    `;
  }

  private _renderResultaat(): TemplateResult {
    if (!this.config || !this.adviesId) return html``;

    const advies = this.config.eieren.adviezen[this.adviesId];
    const leeftijdsAdvies = this.config.eieren.leeftijdsadvies[this.adviesId];

    // Map adviesId naar alert types en classes
    let alertType = 'success';
    let alertClass = '';
    let icon = 'check-circle';

    if (this.adviesId === '3eieren') {
      alertType = 'success';
      icon = 'check-circle';
    } else if (this.adviesId === '2eieren') {
      alertType = 'warning';
      alertClass = 'alert-geel';
      icon = 'alert-circle';
    } else if (this.adviesId === '1ei') {
      alertType = 'warning';
      alertClass = 'alert-oranje';
      icon = 'alert-triangle';
    } else {
      alertType = 'error';
      icon = 'alert-triangle';
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
              <p style="margin-top: 1rem;"><strong>Tips:</strong></p>
              <ul class="tips-list">
                ${advies.tips.map(tip => html`<li>${tip}</li>`)}
              </ul>
            ` : nothing}
          </div>
        </vl-alert>
      </div>
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

  private _validate(): boolean {
    this.errors = {};

    if (!this.locationData?.postcode) {
      this.errors['locatie'] = 'Selecteer een locatie op de kaart';
    }

    if (this.eetGroenten === null) {
      this.errors['eetGroenten'] = 'Kies of je groenten uit eigen tuin eet';
    }

    if (this.pcddF === null || this.dioxPCB === null) {
      this.errors['waarden'] = 'Vul beide labo-resultaten in';
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

    if (!this.config || this.eetGroenten === null || this.pcddF === null || this.dioxPCB === null) return;

    const invoer: EierenInvoer = {
      eetGroenten: this.eetGroenten,
      PCDD_F: this.pcddF,
      DioxPCB: this.dioxPCB
    };

    this.adviesId = bepaalEierenAdvies(invoer, this.config.eieren);

    // Announce result
    const advies = this.config.eieren.adviezen[this.adviesId!];
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
    this.eetGroenten = null;
    this.pcddF = null;
    this.dioxPCB = null;
    this.adviesId = null;
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

defineWebComponent(GezondEierenAdvies, 'gezond-eieren-advies');
