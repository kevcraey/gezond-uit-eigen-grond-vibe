
import { registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlTitleComponent } from '@domg-wc/components/atom';
import { VlWizard, VlWizardPane } from '@domg-wc/components/block/wizard';
import { VlAlert } from '@domg-wc/components/block/alert';
import { VlFormLabelComponent, VlInputFieldComponent } from '@domg-wc/components/form';
import { VlRadioComponent, VlRadioGroupComponent } from '@domg-wc/components/form/radio-group';
import { VlMap, VlMapBaseLayerGRBGray, VlMapFeaturesLayer, VlMapLayerCircleStyle } from '@domg-wc/map';
import { vlContentBlockStyles, vlGridStyles, vlGroupStyles } from '@domg-wc/styles';
import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';

registerWebComponents([
  VlWizard,
  VlWizardPane,
  VlButtonComponent,
  VlTitleComponent,
  VlFormLabelComponent,
  VlInputFieldComponent,
  VlRadioGroupComponent,
  VlRadioComponent,
  VlAlert,
  VlMap,
  VlMapBaseLayerGRBGray,
  VlMapFeaturesLayer,
  VlMapLayerCircleStyle
]);

@customElement('gezond-wizard')
export class GezondWizard extends LitElement {
  @state() private activeStep: number = 1;
  @state() private address: string = '';
  @state() private coordinates: [number, number] | null = null;
  @state() private suggestions: any[] = [];
  @state() private showSuggestions: boolean = false;
  @state() private addressConfirmed: boolean = false;
  @state() private checkResults: {
    contamination: boolean;
    waterloop: boolean;
    busyRoad: boolean;
    pfasFireStation: boolean;
    industrial: boolean;
  } | null = null;
  
  // Step 2: Materialen
  @state() private materials: string = '';
  @state() private materialsConfirmed: boolean = false;

  // Step 3: Asbest
  @state() private asbestos: string = '';
  @state() private asbestConfirmed: boolean = false;

  // Step 4: Verontreiniging
  @state() private pollutionOil: string = '';
  @state() private pollutionBurning: string = '';
  @state() private pollutionPesticides: string = '';
  @state() private pollutionConfirmed: boolean = false;

  private searchTimeout: any;

  static get styles() {
    return [
      vlContentBlockStyles,
      vlGridStyles,
      vlGroupStyles,
      css`
        :host { display: block; }
        .wizard-content { margin-top: 2rem; }
        
        .result-box {
            padding: 2rem;
            margin-top: 2rem;
            border: 1px solid #ccc;
            background: #f9f9f9;
        }
        .result-good { border-color: green; background: #e6ffec; }
        .result-bad { border-color: red; background: #ffe6e6; }
        
        .suggestions-list {
            position: absolute;
            z-index: 1000;
            background: white;
            border: 1px solid #ccc;
            width: 100%;
            max-height: 200px;
            overflow-y: auto;
            list-style: none;
            padding: 0;
            margin: 0;
            margin-top: 2px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .suggestion-item {
            padding: 10px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
        }
        
        .suggestion-item:hover {
            background-color: #f0f0f0;
        }

        .input-wrapper {
            position: relative;
            width: 100%;
        }
        
        vl-input-field {
            width: 100%;
            min-width: 400px;
            --vl-input-field-width: 100%;
        }
        
        vl-input-field::part(input) {
            width: 100%;
        }

        .vl-action-group {
            display: flex;
            justify-content: flex-end;
            margin-top: 2rem;
            gap: 1rem;
        }
        
        vl-wizard-pane > vl-title {
            margin-bottom: 1rem;
        }
        
        vl-wizard-pane > p {
            margin-bottom: 0.5rem;
        }
        
        vl-wizard-pane > ul {
            margin-bottom: 1.5rem;
        }
        
        vl-wizard-pane .vl-grid {
            margin-bottom: 1rem;
        }
        
        vl-alert {
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
        }
        
        vl-alert + vl-alert {
            margin-top: 1rem;
        }
        
        .input-wrapper + vl-button {
            margin-top: 1.5rem;
        }
        
        .button-spacer {
            margin-top: 1.5rem;
        }
        
        .alert-spacer {
            margin-top: 1.5rem;
        }
        
        .results-section {
            margin-top: 3rem;
        }
        
        .results-section > vl-title {
            margin-bottom: 0.5rem;
        }
        
        .results-section > p {
            color: #666;
            margin-bottom: 1.5rem;
        }
        
        .step-results {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .step-results > vl-title {
            margin-bottom: 0.25rem;
        }
        
        .address-subtitle {
            color: #666;
            font-style: italic;
            margin-bottom: 1rem;
        }
        
        .advice-section {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e0e0e0;
        }
        
        .advice-section ul {
            margin-top: 0.5rem;
            padding-left: 1.5rem;
        }
        
        .advice-section li {
            margin-bottom: 0.5rem;
        }
        
        .radio-group-vertical {
            margin-top: 1.5rem;
        }
        
        .radio-group-vertical vl-radio-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .radio-group-vertical vl-radio {
            display: block;
        }
        .alert-box {
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 4px;
            border-left: 4px solid;
        }
        
        .alert-warning {
            background: #fff3cd;
            border-color: #ffc107;
        }
        
        .alert-danger {
            background: #f8d7da;
            border-color: #dc3545;
        }
        
        .alert-success {
            background: #d4edda;
            border-color: #28a745;
        }
        
        .alert-title {
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .pill {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
        }
        
        .pill-danger {
            background: #dc3545;
            color: white;
        }
        
        .pill-success {
            background: #28a745;
            color: white;
        }
      `
    ];
  }

  protected render(): TemplateResult {
    return html`
      <vl-wizard numeric ?clickable=${false} .activeStep=${this.activeStep}>
        <vl-wizard-pane name="Adres">
            <vl-title type="h2">Je adres</vl-title>
            <p>Op basis van je adres zullen volgende controles gebeuren:</p>
            <ul>
                <li>verontreiniging van het perceel gekend in VL databank</li>
                <li>waterloop in de buurt</li>
                <li>lig je in de buurt van PFAS no regret zones?</li>
                <li>lig je in de buurt van (vroegere) brandweer?</li>
                <li>lig je naast een drukke weg of spoorweg?</li>
                <li>zijn er industriële activiteiten in je nabije omgeving?</li>
            </ul>
            <div class="vl-grid">
                <div class="vl-col--12-12">
                    <vl-form-label for="address" block>Adres</vl-form-label>
                    <p style="font-size: 0.9em; color: #666;">Zoek hieronder je adres</p>
                    <div class="input-wrapper">
                        <vl-input-field 
                            id="address" 
                            block 
                            .value=${this.address} 
                            @input=${this._handleAddressInput}
                            autocomplete="off"
                        ></vl-input-field>
                        
                        ${this.showSuggestions && this.suggestions.length > 0 ? html`
                            <ul class="suggestions-list">
                                ${this.suggestions.map((s) => html`
                                    <li class="suggestion-item" @click=${() => this._selectSuggestion(s)}>
                                        ${s.display_name}
                                    </li>
                                `)}
                            </ul>
                        ` : ''}
                    </div>
                    
                    <div class="button-spacer">
                        <vl-button @click=${this._confirmAddress} ?disabled=${!this.coordinates}>Adres opzoeken</vl-button>
                    </div>
                </div>
            </div>
            
            <div class="vl-action-group" style="margin-top: 1rem;">
                <vl-button secondary disabled>Terug</vl-button>
                <vl-button @click=${this._nextStep} ?disabled=${!this.addressConfirmed}>Volgende stap: Bodemvreemde materialen</vl-button>
            </div>
        </vl-wizard-pane>

        <vl-wizard-pane name="Materialen">
            <vl-title type="h2">Bodemvreemde materialen</vl-title>
            <p>Zijn er bodemvreemde materialen aanwezig in de bovenste 30 cm van uw bodem? Let op de volgende elementen: kiezels, as, stukjes baksteen, betonresten, asbest, schroot, plastic, glas, enz.</p>
            <p><a href="#">Hoe herken je bodemvreemde materialen in je tuin?</a></p>
            
            <div class="radio-group-vertical">
                <vl-radio-group .value=${this.materials} @vl-input=${(e: any) => this.materials = e.target.value}>
                    <vl-radio value="geen">Geen van onderstaande</vl-radio>
                    <vl-radio value="beperkt">Beperkte hoeveelheid bodemvreemde materialen aangetroffen (baksteenresten, betonbrokken, tegelresten, schroot, plastic, glas,…)</vl-radio>
                    <vl-radio value="assen">Assen (PAK, ZM)</vl-radio>
                    <vl-radio value="asbest">Asbestresten/asbesthoudende materialen aangetroffen</vl-radio>
                    <vl-radio value="veel">Veel aangetroffen</vl-radio>
                </vl-radio-group>
            </div>
            
            <div class="button-spacer">
                <vl-button @click=${this._confirmMaterials} ?disabled=${!this.materials}>Toon aanbeveling</vl-button>
            </div>
            
            <div class="vl-action-group" style="margin-top: 1.5rem;">
                <vl-button secondary @click=${this._prevStep}>Terug</vl-button>
                <vl-button @click=${this._nextStep} ?disabled=${!this.materialsConfirmed}>Volgende stap: Asbest</vl-button>
            </div>
        </vl-wizard-pane>

        <vl-wizard-pane name="Asbest">
            <vl-title type="h2">Asbest</vl-title>
            <p>Zijn er asbesthoudende daken of wanden met asbesthoudende bekleding waarvan het water afloopt naar je moestuin of kippenren aanwezig? Zijn er asbesthoudende bloembakken/tuinmateriaal aanwezig?</p>
            <p><a href="#">Hoe kan ik asbest herkennen?</a></p>
            
            <div class="radio-group-vertical">
                <vl-radio-group .value=${this.asbestos} @vl-input=${(e: any) => this.asbestos = e.target.value}>
                    <vl-radio value="nee">Neen</vl-radio>
                    <vl-radio value="ja">Ja</vl-radio>
                </vl-radio-group>
            </div>
            
            <div class="button-spacer">
                <vl-button @click=${this._confirmAsbest} ?disabled=${!this.asbestos}>Toon aanbeveling</vl-button>
            </div>
            
            <div class="vl-action-group" style="margin-top: 1.5rem;">
                <vl-button secondary @click=${this._prevStep}>Terug</vl-button>
                <vl-button @click=${this._nextStep} ?disabled=${!this.asbestConfirmed}>Volgende stap: Bodemverontreiniging</vl-button>
            </div>
        </vl-wizard-pane>

        <vl-wizard-pane name="Verontreiniging">
            <vl-title type="h2">Bodemverontreiniging</vl-title>
            <p>Optionele bijkomende check: heb je weet van activiteiten die bodemverontreiniging kunnen veroorzaken?</p>
            
            <div class="radio-group-vertical">
                <p><strong>Opslagtanks / oliegeur?</strong><br>Heb je weet van opslagtanks (bvb voor stookolie) op je terrein, morsen van smeermiddelen, merk je een oliegeur op in de bodem?</p>
                <vl-radio-group .value=${this.pollutionOil} @vl-input=${(e: any) => this.pollutionOil = e.target.value}>
                    <vl-radio value="nee">Neen</vl-radio>
                    <vl-radio value="ja">Ja</vl-radio>
                </vl-radio-group>
            </div>
            
            <div class="radio-group-vertical">
                <p><strong>Verbranden van afval, stoken, kachels?</strong><br>Heb je weet van het verbranden van afval op je perceel? Wordt er regelmatig gestookt in de tuin of wordt in je buurt verwarmd met hout of een steenkoolkachel? Werden de assen uitgespreid over de tuin?</p>
                <vl-radio-group .value=${this.pollutionBurning} @vl-input=${(e: any) => this.pollutionBurning = e.target.value}>
                    <vl-radio value="nee">Neen</vl-radio>
                    <vl-radio value="ja">Ja</vl-radio>
                </vl-radio-group>
            </div>
            
            <div class="radio-group-vertical">
                <p><strong>Pesticiden?</strong><br>Heb je weet van het gebruik van pesticiden op je perceel?</p>
                <vl-radio-group .value=${this.pollutionPesticides} @vl-input=${(e: any) => this.pollutionPesticides = e.target.value}>
                    <vl-radio value="nee">Neen</vl-radio>
                    <vl-radio value="ja">Ja</vl-radio>
                </vl-radio-group>
            </div>
            
            <div class="button-spacer">
                <vl-button @click=${this._confirmPollution} ?disabled=${!this.pollutionOil || !this.pollutionBurning || !this.pollutionPesticides}>Toon aanbeveling</vl-button>
            </div>
            
            <div class="vl-action-group" style="margin-top: 1.5rem;">
                <vl-button secondary @click=${this._prevStep}>Terug</vl-button>
                <vl-button @click=${this._finish} ?disabled=${!this.pollutionConfirmed}>Klaar</vl-button>
            </div>
        </vl-wizard-pane>

        <vl-wizard-pane name="Resultaat">
             <vl-title type="h2">Resultaat</vl-title>
             ${this._renderResult()}
             <div class="vl-action-group">
                <vl-button @click=${this._reset}>Opnieuw</vl-button>
             </div>
        </vl-wizard-pane>
      </vl-wizard>
      
      <!-- Results section - advice always visible, step results added cumulatively -->
      <div class="results-section">
          <!-- Verontreiniging results (Step 4) - shown on top when confirmed -->
          ${this.pollutionConfirmed ? html`
              <div class="step-results">
                  <vl-title type="h3">Aanbeveling op basis van bodemverontreiniging</vl-title>
                  ${this._renderPollutionResult()}
              </div>
          ` : ''}
          
          <!-- Asbest results (Step 3) -->
          ${this.asbestConfirmed ? html`
              <div class="step-results">
                  <vl-title type="h3">Aanbeveling op basis van asbest</vl-title>
                  ${this._renderAsbestResult()}
              </div>
          ` : ''}
          
          <!-- Materials results (Step 2) -->
          ${this.materialsConfirmed ? html`
              <div class="step-results">
                  <vl-title type="h3">Aanbeveling op basis van bodemvreemde materialen</vl-title>
                  ${this._renderMaterialsResult()}
              </div>
          ` : ''}
          
          <!-- Address results (Step 1) -->
          ${this.addressConfirmed ? html`
              <div class="step-results">
                  <vl-title type="h3">Aanbeveling op basis van je adres</vl-title>
                  <p class="address-subtitle">${this.address}</p>
                  ${this._renderCheckResults()}
              </div>
          ` : ''}
          
          <!-- Algemeen advies - always visible -->
          <div class="advice-section">
              <vl-title type="h3">Algemeen advies</vl-title>
              <p>Met onze uitgebreidere checks kan je ook onderzoeken of er potentiële verontreinigingsbronnen in je tuin aanwezig zijn, of laat een bodemanalyse uitvoeren.</p>
              <ul>
                  <li>Kies een goede locatie voor je moestuin, fruitplanten of kippenren.</li>
                  <li>De meeste verontreinigende stoffen uit een bodem nemen we op via bodemdeeltjes, was dus steeds zorgvuldig je handen, groenten en fruit.</li>
                  <li>Vermijd steeds het gebruik van pesticiden.</li>
                  <li>Gebruik bij voorkeur regenwater voor de planten in de tuin.</li>
                  <li>Breng variatie in je voedsel en kies voor gezonde tuinmaterialen.</li>
                  <li>Vermijd het stoken in de tuin en gebruik je kachel verstandig zodat er minder dioxines in je tuin ronddwarrelen. Gooi in geen geval assen van je kachel in je moestuin of kippenren.</li>
              </ul>
          </div>
      </div>
    `;
  }

  private _handleAddressInput(e: Event) {
      const input = e.target as HTMLInputElement;
      this.address = input.value;
      
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      
      if (this.address.length < 3) {
          this.suggestions = [];
          this.showSuggestions = false;
          return;
      }

      this.searchTimeout = setTimeout(async () => {
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.address)}&countrycodes=be&limit=5`);
            const data = await response.json();
            this.suggestions = data;
            this.showSuggestions = true;
          } catch (e) {
              console.error('Error fetching address suggestions', e);
          }
      }, 300); // 300ms debounce
  }

  private _selectSuggestion(suggestion: any) {
      this.address = suggestion.display_name;
      const lat = parseFloat(suggestion.lat);
      const lon = parseFloat(suggestion.lon);
      this.coordinates = [lon, lat];
      this.showSuggestions = false;
      this.suggestions = [];
      // Reset confirmation when address changes
      this.addressConfirmed = false;
      this.checkResults = null;
  }

  private async _confirmAddress() {
      try {
          const response = await fetch('/mock-config.json');
          const config = await response.json();
          this.checkResults = {
              contamination: config.checks?.contamination ?? false,
              waterloop: config.checks?.waterloop ?? false,
              busyRoad: config.checks?.busyRoad ?? false,
              pfasFireStation: config.checks?.pfasFireStation ?? false,
              industrial: config.checks?.industrial ?? false
          };
      } catch (e) {
          console.error('Error fetching mock config', e);
          this.checkResults = {
              contamination: false,
              waterloop: false,
              busyRoad: false,
              pfasFireStation: false,
              industrial: false
          };
      }
      this.addressConfirmed = true;
  }

  private _confirmMaterials() {
      this.materialsConfirmed = true;
  }

  private _confirmAsbest() {
      this.asbestConfirmed = true;
  }

  private _confirmPollution() {
      this.pollutionConfirmed = true;
  }

  private _renderCheckResults(): TemplateResult {
      if (!this.checkResults) return html``;
      
      // Build arrays for warnings and successes (excluding contamination which is shown separately)
      const warnings: TemplateResult[] = [];
      const successes: TemplateResult[] = [];
      
      // Waterloop
      if (this.checkResults.waterloop) {
          warnings.push(html`
              <div class="alert-spacer">
                  <vl-alert type="warning" icon="alert-circle" naked>
                      <span slot="title">Waterloop langs perceel</span>
                      <p>Er is een waterloop in de nabijheid van het perceel. Dit kan een risico vormen voor verontreiniging.</p>
                  </vl-alert>
              </div>
          `);
      } else {
          successes.push(html`
              <div class="alert-spacer">
                  <vl-alert type="success" icon="check-circle" naked>
                      <span slot="title">Waterloop langs perceel</span>
                      <p>Neen - Er is geen waterloop in de nabijheid van het perceel.</p>
                  </vl-alert>
              </div>
          `);
      }
      
      // Drukke weg of spoorweg
      if (this.checkResults.busyRoad) {
          warnings.push(html`
              <div class="alert-spacer">
                  <vl-alert type="warning" icon="alert-circle" naked>
                      <span slot="title">Ligt je terrein naast een drukke weg of spoorweg?</span>
                      <p>Ja, afstand is groter dan 10 meter. Laat minimaal 10 meter afstand tussen je groenten en de as van de spoorweg.</p>
                  </vl-alert>
              </div>
          `);
      } else {
          successes.push(html`
              <div class="alert-spacer">
                  <vl-alert type="success" icon="check-circle" naked>
                      <span slot="title">Ligt je terrein naast een drukke weg of spoorweg?</span>
                      <p>Neen - Je perceel ligt niet naast een drukke weg of spoorweg.</p>
                  </vl-alert>
              </div>
          `);
      }
      
      // PFAS / Brandweer
      if (this.checkResults.pfasFireStation) {
          warnings.push(html`
              <div class="alert-spacer">
                  <vl-alert type="warning" icon="alert-circle" naked>
                      <span slot="title">Ligt je grond in de nabijheid van een brandweeroefenterrein of een PFAS no regret zone</span>
                      <p>Ja - Je perceel ligt in de buurt van een brandweeroefenterrein of PFAS no regret zone.</p>
                  </vl-alert>
              </div>
          `);
      } else {
          successes.push(html`
              <div class="alert-spacer">
                  <vl-alert type="success" icon="check-circle" naked>
                      <span slot="title">Ligt je grond in de nabijheid van een brandweeroefenterrein of een PFAS no regret zone</span>
                      <p>Neen - Je perceel ligt niet in de buurt van een brandweeroefenterrein of PFAS zone.</p>
                  </vl-alert>
              </div>
          `);
      }
      
      // Industriële activiteiten
      if (this.checkResults.industrial) {
          warnings.push(html`
              <div class="alert-spacer">
                  <vl-alert type="warning" icon="alert-circle" naked>
                      <span slot="title">Worden er industriële activiteiten uitgevoerd die bodemverontreiniging kunnen veroorzaken?</span>
                      <p>Ja - Er zijn industriële activiteiten in de omgeving die mogelijk bodemverontreiniging kunnen veroorzaken.</p>
                  </vl-alert>
              </div>
          `);
      } else {
          successes.push(html`
              <div class="alert-spacer">
                  <vl-alert type="success" icon="check-circle" naked>
                      <span slot="title">Worden er industriële activiteiten uitgevoerd die bodemverontreiniging kunnen veroorzaken?</span>
                      <p>Neen - Er zijn geen industriële activiteiten in de nabijheid gevonden.</p>
                  </vl-alert>
              </div>
          `);
      }
      
      return html`
          <!-- Prominent alerts on top if contamination found -->
          ${this.checkResults.contamination ? html`
              <div class="alert-spacer">
                  <vl-alert type="error" icon="alert-triangle">
                      <span slot="title">Bodemverontreinigingslocatie gevonden</span>
                      <p>Er zijn al gegevens over een bodemverontreinigingslocatie gevonden. Bent u de eigenaar van dit perceel? Meldt u aan de OVAM te bekijken.</p>
                  </vl-alert>
              </div>
              <div class="alert-spacer">
                  <vl-alert type="warning" icon="alert-circle">
                      <span slot="title">Bodemstalen aanvragen</span>
                      <p>Op basis van je geconstateerde locaties kan het nuttig zijn om een bodemstaal te laten analyseren.</p>
                      <div slot="actions">
                          <vl-button secondary>Vraag je bodemstalen aan</vl-button>
                      </div>
                  </vl-alert>
              </div>
          ` : ''}
          
          <!-- Warnings first (orange) -->
          ${warnings}
          
          <!-- Then successes (green) -->
          ${successes}
          
          <!-- Contamination success shown last if no contamination -->
          ${!this.checkResults.contamination ? html`
              <div class="alert-spacer">
                  <vl-alert type="success" icon="check-circle" naked>
                      <span slot="title">Verontreinigd perceel</span>
                      <p>Neen - Er is geen verontreiniging gekend voor dit perceel in de VL databank.</p>
                  </vl-alert>
              </div>
          ` : ''}
      `;
  }

  private _renderMaterialsResult(): TemplateResult {
      switch (this.materials) {
          case 'geen':
              return html`
                  <div class="alert-spacer">
                      <vl-alert type="success" icon="check-circle" naked>
                          <span slot="title">Bodemvreemde materialen</span>
                          <p>Geen risico - Geen bodemvreemde materialen aangetroffen.</p>
                      </vl-alert>
                  </div>
              `;
          case 'beperkt':
              return html`
                  <div class="alert-spacer">
                      <vl-alert type="warning" icon="alert-circle" naked>
                          <span slot="title">Bodemvreemde materialen</span>
                          <p>Laag risico - Beperkte hoeveelheid bodemvreemde materialen aangetroffen. Verwijder indien mogelijk de zichtbare bodemvreemde materialen uit je tuin.</p>
                      </vl-alert>
                  </div>
              `;
          case 'assen':
              return html`
                  <div class="alert-spacer">
                      <vl-alert type="warning" icon="alert-circle" naked>
                          <span slot="title">Bodemvreemde materialen - Assen</span>
                          <p>Matig risico - Assen kunnen PAK en zware metalen bevatten. Overweeg een bodemanalyse om het gehalte aan zware metalen en PAK te controleren.</p>
                      </vl-alert>
                  </div>
              `;
          case 'asbest':
              return html`
                  <div class="alert-spacer">
                      <vl-alert type="error" icon="alert-triangle" naked>
                          <span slot="title">Bodemvreemde materialen - Asbest</span>
                          <p>Hoog risico - Asbestresten zijn aangetroffen. Vermijd contact met deze materialen en overweeg professionele verwijdering. Contacteer een gespecialiseerde firma.</p>
                      </vl-alert>
                  </div>
              `;
          case 'veel':
              return html`
                  <div class="alert-spacer">
                      <vl-alert type="error" icon="alert-triangle" naked>
                          <span slot="title">Bodemvreemde materialen</span>
                          <p>Hoog risico - Veel bodemvreemd materiaal aangetroffen. Overweeg een grondige reiniging of vervanging van de toplaag door schone teelaarde.</p>
                      </vl-alert>
                  </div>
              `;
          default:
              return html``;
      }
  }

  private _renderAsbestResult(): TemplateResult {
      if (this.asbestos === 'ja') {
          return html`
              <div class="alert-spacer">
                  <vl-alert type="error" icon="alert-triangle" naked>
                      <span slot="title">Asbest</span>
                      <p>Hoog risico - Er is asbesthoudend materiaal aanwezig in je tuin. Asbesthoudend materiaal kan degraderen en losse asbestvezels vrijgeven. Deze zijn zeer schadelijk voor de gezondheid, zeker als je tijdens het tuinieren in nauw contact komt met de grond.</p>
                      <ul>
                          <li>Vermijd het om deze zones te betreden</li>
                          <li>Verwijder indien mogelijk het asbesthoudend materiaal - contacteer hiervoor een gespecialiseerde firma</li>
                          <li>Als de dak- of wanbekleding of het asbesthoudend tuinmateriaal is verwijderd kan je overwegen om de toplaag af te graven en te vervangen door schone teelaarde</li>
                      </ul>
                  </vl-alert>
              </div>
          `;
      } else {
          return html`
              <div class="alert-spacer">
                  <vl-alert type="success" icon="check-circle" naked>
                      <span slot="title">Asbest</span>
                      <p>Geen risico - Geen asbesthoudend materiaal aanwezig.</p>
                  </vl-alert>
              </div>
          `;
      }
  }

  private _renderPollutionResult(): TemplateResult {
      const results: TemplateResult[] = [];
      
      // Oil/Storage tanks
      if (this.pollutionOil === 'ja') {
          results.push(html`
              <div class="alert-spacer">
                  <vl-alert type="error" icon="alert-triangle" naked>
                      <span slot="title">Opslagtanks / oliegeur</span>
                      <p>Hoog risico - Merk je een oliegeur op? Kies een andere plek voor je moestuin of kippenren op minstens 10 m van de opslagtank of geurwaarneming. Contacteer de OVAM of een eBSD indien je dit verder wil onderzoeken. Je kan ook overwegen om de verontreinigde grond te verwijderen.</p>
                  </vl-alert>
              </div>
          `);
      } else {
          results.push(html`
              <div class="alert-spacer">
                  <vl-alert type="success" icon="check-circle" naked>
                      <span slot="title">Opslagtanks / oliegeur</span>
                      <p>Geen risico - Geen opslagtanks of oliegeur aanwezig.</p>
                  </vl-alert>
              </div>
          `);
      }
      
      // Burning/Ashes
      if (this.pollutionBurning === 'ja') {
          results.push(html`
              <div class="alert-spacer">
                  <vl-alert type="warning" icon="alert-circle" naked>
                      <span slot="title">Verbranden van afval, stoken, kachels</span>
                      <p>Matig risico - Assen kunnen PAK en zware metalen bevatten. Vermijd het uitspreiden van assen in je moestuin of kippenren. Overweeg een bodemanalyse.</p>
                  </vl-alert>
              </div>
          `);
      } else {
          results.push(html`
              <div class="alert-spacer">
                  <vl-alert type="success" icon="check-circle" naked>
                      <span slot="title">Verbranden van afval, stoken, kachels</span>
                      <p>Geen risico - Geen verbranding of stoken bekend.</p>
                  </vl-alert>
              </div>
          `);
      }
      
      // Pesticides
      if (this.pollutionPesticides === 'ja') {
          results.push(html`
              <div class="alert-spacer">
                  <vl-alert type="warning" icon="alert-circle" naked>
                      <span slot="title">Pesticiden</span>
                      <p>Matig risico - Er zijn pesticiden gebruikt op dit perceel. Overweeg een bodemanalyse om de aanwezigheid van pesticiden te controleren.</p>
                  </vl-alert>
              </div>
          `);
      } else {
          results.push(html`
              <div class="alert-spacer">
                  <vl-alert type="success" icon="check-circle" naked>
                      <span slot="title">Pesticiden</span>
                      <p>Geen risico - Geen pesticidengebruik bekend.</p>
                  </vl-alert>
              </div>
          `);
      }
      
      return html`${results}`;
  }

  private _nextStep() {
    this.activeStep++;
  }

  private _prevStep() {
    if (this.activeStep > 1) this.activeStep--;
  }
  
  private _finish() {
      // Move to result step (5)
      this.activeStep = 5;
  }

  private _reset() {
      this.activeStep = 1;
      this.address = '';
      this.coordinates = null;
      this.materials = '';
      this.asbestos = '';
      this.pollutionOil = '';
      this.pollutionBurning = '';
      this.pollutionPesticides = '';
      this.suggestions = [];
      this.showSuggestions = false;
  }

  private _renderResult(): TemplateResult {
      // Basic logic
      const isBad = this.materials !== 'geen' || this.asbestos === 'ja' || this.pollutionOil === 'ja' || this.pollutionBurning === 'ja' || this.pollutionPesticides === 'ja';
      
      if (isBad) {
          return html`
            <div class="result-box result-bad">
                <h3 is="vl-title" type="h3">Opgelet!</h3>
                <p>Op basis van je antwoorden is je grond mogelijk niet geschikt voor kippen of moestuin zonder verder onderzoek.</p>
                <ul>
                    ${this.materials !== 'geen' ? html`<li>Je gaf aan: ${this.materials} materialen.</li>` : ''}
                    ${this.asbestos === 'ja' ? html`<li>Je gaf aan: Asbest risico.</li>` : ''}
                    ${this.pollutionOil === 'ja' ? html`<li>Je gaf aan: Oliegeur/tanks.</li>` : ''}
                </ul>
            </div>
          `;
      }

      return html`
        <div class="result-box result-good">
            <h3 is="vl-title" type="h3">Goed nieuws!</h3>
            <p>Op basis van je antwoorden lijkt er geen direct risico te zijn.</p>
            <p>Veel succes met je kippen of moestuin!</p>
        </div>
      `;
  }
}
