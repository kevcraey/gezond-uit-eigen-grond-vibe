
import { registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlTitleComponent } from '@domg-wc/components/atom';
import { VlWizard, VlWizardPane } from '@domg-wc/components/block/wizard';
import { VlAlert } from '@domg-wc/components/block/alert';
import { VlFormLabelComponent, VlInputFieldComponent } from '@domg-wc/components/form';
import { VlRadioComponent, VlRadioGroupComponent } from '@domg-wc/components/form/radio-group';
import { 
  VlMap, 
  VlMapBaseLayerGRBGray, 
  VlMapFeaturesLayer, 
  VlMapLayerCircleStyle,
  VlMapSearch,
  VlMapDrawPolygonAction,
  VlMapLayerStyle,
  VlMapActionControls,
  VlMapActionControl,
  VlMapModifyAction
} from '@domg-wc/map';
import { VlModalComponent } from '@domg-wc/components/block/modal';
import { vlContentBlockStyles, vlGridStyles, vlGroupStyles } from '@domg-wc/styles';
import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { 
  WizardConfig, 
  Step, 
  StepQuestion, 
  Result, 
  AnswerState, 
  evaluateRules,
  getRulesForAnswers
} from '../models/wizard-config';

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
  VlMapLayerCircleStyle,
  VlMapSearch,
  VlMapDrawPolygonAction,
  VlMapLayerStyle,
  VlMapActionControls,
  VlMapActionControl,
  VlMapModifyAction
]);

@customElement('gezond-wizard')
export class GezondWizard extends LitElement {
  // Config
  @state() private config: WizardConfig | null = null;
  
  // Wizard state
  @state() private activeStep: number = 1;

  @state() private address: string = '';
  @state() private coordinates: [number, number] | null = null;
  @state() private suggestions: any[] = [];
  @state() private showSuggestions: boolean = false;
  
  // All answers (computed + input)
  @state() private answers: AnswerState = {};
  
  // Confirmed steps (for showing results)
  @state() private confirmedSteps: Set<string> = new Set();
  
  // Drawn polygon for vegetable garden location
  // Drawn polygon for vegetable garden location
  @state() private drawnPolygon: any = null;
  @state() private showDeleteModal: boolean = false;
  @state() private isEditing: boolean = false;
  
  // Reference to map element
  @query('vl-map') private mapElement: any;
  
  private searchTimeout: any;

  static get styles() {
    return [
      vlContentBlockStyles,
      vlGridStyles,
      vlGroupStyles,
      css`
        :host { display: block; }
        .wizard-content { margin-top: 2rem; }
        
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
            background: #f0f0f0;
        }
        
        .address-input-wrapper {
            position: relative;
        }
        
        .button-spacer {
            margin-top: 1.5rem;
        }
        
        .alert-spacer {
            margin-bottom: 1rem;
        }
        
        .results-section {
            margin-top: 3rem;
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
        
        .radio-group-vertical {
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
        
        .radio-group-vertical vl-radio-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .radio-group-vertical vl-radio {
            display: block;
        }
        
        .step-inline-results {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e0e0e0;
            position: relative;
            z-index: 5;
            background-color: white;
            clear: both;
        }
        
        .question-block {
            margin-bottom: 1.5rem;
        }
        
        .question-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .map-container {
            height: 400px; 
            margin: 1rem 0; 
            position: relative;
            overflow: hidden; /* Fixes map overflow */
        }

        vl-map {
            width: 100%;
            height: 100%;
            display: block;
        }

        .action-group-container {
            margin-top: 1rem;
            position: relative;
            z-index: 10;
            background: white; /* Ensure it covers anything behind */
            clear: both;
        }
        
        .question-description {
            color: #666;
            margin-bottom: 0.5rem;
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
      const response = await fetch('/wizard-config.json');
      this.config = await response.json();
      
      // Wait for render to complete so map elements exist
      await this.updateComplete;
      
      // Bind draw action callback for polygon tool
      const drawAction = this.shadowRoot?.querySelector('#draw-polygon-action') as any;
      if (drawAction) {
        // VlDrawPolygonAction passes the feature directly to the callback, not an event
        // But we handle both in _handlePolygonDrawn just in case
        drawAction.onDraw(this._handlePolygonDrawn.bind(this));
      }
    } catch (e) {
      console.error('Failed to load wizard config:', e);
    }
  }

  render() {
    if (!this.config) {
      return html`<p>Loading...</p>`;
    }

    return html`
      <vl-wizard .activeStep=${this.activeStep} numeric>
        ${this.config.steps.map((step, index) => this._renderStep(step, index))}
      </vl-wizard>
    `;
  }

  private _renderStep(step: Step, index: number): TemplateResult {
    if (step.type === 'intro') {
      return this._renderIntroStep(step);
    } else if (step.type === 'address-input') {
      return this._renderAddressStep(step);
    } else if (step.type === 'results') {
      return this._renderResultsStep(step);
    } else {
      return this._renderQuestionStep(step);
    }
  }

  private _renderIntroStep(step: Step): TemplateResult {
    return html`
      <vl-wizard-pane name="${step.name}">
        <vl-title type="h2">${step.title}</vl-title>
        <p>${this.config!.general.description}</p>
        
        <ul>
            ${this.config!.general.advice.items.map(item => html`<li>${item}</li>`)}
        </ul>
        <p>${this.config!.general.advice.intro}</p>
        
        <div class="vl-action-group" style="margin-top: 1.5rem;">
            <vl-button @click=${this._nextStep}>${step.navigation.next.label}</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderAddressStep(step: Step): TemplateResult {
    const isConfirmed = this.confirmedSteps.has(step.id);
    const hasPolygon = this.drawnPolygon !== null;
    
    return html`
      <vl-wizard-pane name="${step.name}">
        <vl-title type="h2">${step.title}</vl-title>
        <p>${step.description}</p>
        <p><strong>Zoek eerst je adres</strong> via de zoekbalk, en <strong>teken daarna</strong> de exacte locatie van je moestuin of kippenren door een polygoon te tekenen op de kaart.</p>
        
        <div class="map-container">
          <vl-map>
            <vl-map-baselayer-grb-gray></vl-map-baselayer-grb-gray>
            <vl-map-search></vl-map-search>
            <!-- Custom Controls overlay on map -->
             <div style="position: absolute; top: 10px; right: 10px; z-index: 10; display: flex; gap: 10px;">
               <vl-button 
                  id="btn-modify"
                  icon="pencil" 
                  @click=${this._toggleEditMode} 
                  ?disabled=${!hasPolygon || this.showDeleteModal}>
                  ${this.isEditing ? 'Klaar met aanpassen' : 'Aanpassen'}
               </vl-button>
               <vl-button 
                  id="btn-delete"
                  error 
                  icon="trash" 
                  @click=${this._requestDeletePolygon} 
                  ?disabled=${!hasPolygon || this.isEditing}>
                  Verwijder
               </vl-button>
             </div>

            <vl-map-features-layer name="polygon-layer">
              <vl-map-layer-style 
                border-color="rgba(0, 85, 204, 1)" 
                border-size="2" 
                color="rgba(0, 85, 204, 0.3)">
              </vl-map-layer-style>
              <vl-map-draw-polygon-action 
                id="draw-polygon-action"
                .active=${!this.isEditing}>
              </vl-map-draw-polygon-action>
              <vl-map-modify-action
                id="modify-polygon-action"
                .active=${this.isEditing}>
              </vl-map-modify-action>
            </vl-map-features-layer>
          </vl-map>
        </div>

        <vl-modal
          id="delete-confirmation-modal"
          title="Bent u zeker?"
          ?open=${this.showDeleteModal}
          @close=${this._cancelDeletePolygon}
          not-cancellable
        >
          <p slot="content">Alles wat u getekend heb zal verwijderd worden.</p>
          <div slot="button">
            <vl-button secondary @click=${this._cancelDeletePolygon}>Annuleer</vl-button>
            <vl-button @click=${this._confirmDeletePolygon}>OK</vl-button>
          </div>
        </vl-modal>
        
        ${hasPolygon ? html`
          <p style="color: green;">✓ Je moestuin is ingetekend op de kaart.</p>
        ` : html`
          <p style="color: #666;">Teken een polygoon op de kaart om je moestuin aan te duiden.</p>
        `}
        
        
        <div class="step-inline-results">
          ${this._renderStepResults(step)}
        </div>
        
        <div class="vl-action-group action-group-container">
            ${step.navigation.back ? html`
                <vl-button secondary @click=${this._prevStep}>${step.navigation.back.label}</vl-button>
            ` : html`
                <vl-button secondary disabled>Terug</vl-button>
            `}
            <vl-button @click=${this._nextStep} ?disabled=${!hasPolygon}>${step.navigation.next.label}</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderQuestionStep(step: Step): TemplateResult {
    const isConfirmed = this.confirmedSteps.has(step.id);
    const allQuestionsAnswered = step.questions?.every(q => this.answers[q.answerId] !== undefined) ?? false;
    
    return html`
      <vl-wizard-pane name="${step.name}">
        <vl-title type="h2">${step.title}</vl-title>
        <p>${step.description}</p>
        ${step.helpLink ? html`<p><a href="${step.helpLink.url}">${step.helpLink.label}</a></p>` : ''}
        
        ${step.questions?.map(question => this._renderQuestion(question))}
        
        <div class="step-inline-results">
          ${this._renderStepResults(step)}
        </div>
        
        <div class="vl-action-group" style="margin-top: 1.5rem;">
            ${step.navigation.back ? html`
                <vl-button secondary @click=${this._prevStep}>${step.navigation.back.label}</vl-button>
            ` : ''}
            <vl-button @click=${this._nextStep} ?disabled=${!allQuestionsAnswered}>${step.navigation.next.label}</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderResultsStep(step: Step): TemplateResult {
    return html`
      <vl-wizard-pane name="${step.name}">
        <vl-title type="h2">${step.title}</vl-title>
        <p>${step.description || 'Overzicht van alle aanbevelingen op basis van je antwoorden.'}</p>
        
        ${this._renderAllStepsResults()}
        
        <div class="vl-action-group" style="margin-top: 1.5rem;">
            ${step.navigation.back ? html`
                <vl-button secondary @click=${this._prevStep}>${step.navigation.back.label}</vl-button>
            ` : ''}
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderStepResults(step: Step): TemplateResult {
    if (!this.config) return html``;
    
    // Get answer IDs relevant to this step
    const relevantAnswerIds = this._getRelevantAnswerIds(step);
    
    // Get rules that involve these answers
    const relevantRules = getRulesForAnswers(this.config.rules, relevantAnswerIds);
    
    // Evaluate rules to get matching results
    const matchedResults = evaluateRules(relevantRules, this.config.results, this.answers);
    
    if (matchedResults.length === 0) return html``;
    
    return html`
      ${matchedResults.map(result => this._renderResult(result))}
    `;
  }

  private _renderQuestion(question: StepQuestion): TemplateResult {
    return html`
      <div class="question-block">
        ${question.title ? html`<p class="question-title">${question.title}</p>` : ''}
        ${question.description ? html`<p class="question-description">${question.description}</p>` : ''}
        
        <div class="radio-group-vertical">
          <vl-radio-group 
            @vl-input=${(e: any) => this._handleAnswer(question.answerId, e.target.value)}
          >
            ${question.options.map(option => html`
              <vl-radio value="${option.value}">${option.label}</vl-radio>
            `)}
          </vl-radio-group>
        </div>
      </div>
    `;
  }

  private _renderAllStepsResults(): TemplateResult {
    if (!this.config || this.confirmedSteps.size === 0) {
      return html``;
    }

    const resultBlocks: TemplateResult[] = [];
    
    // Render in reverse order (newest on top)
    const reversedSteps = [...this.config.steps].reverse();
    
    for (const step of reversedSteps) {
      if (!this.confirmedSteps.has(step.id)) continue;
      if (!step.resultsTitle) continue;
      
      // Get answer IDs relevant to this step
      const relevantAnswerIds = this._getRelevantAnswerIds(step);
      
      // Get rules that involve these answers
      const relevantRules = getRulesForAnswers(this.config.rules, relevantAnswerIds);
      
      // Evaluate rules to get matching results
      const matchedResults = evaluateRules(relevantRules, this.config.results, this.answers);
      
      if (matchedResults.length > 0) {
        resultBlocks.push(html`
          <div class="step-results">
            <vl-title type="h3">${step.resultsTitle}</vl-title>
            ${step.type === 'address-input' ? html`<p class="address-subtitle">${this.address}</p>` : ''}
            ${matchedResults.map(result => this._renderResult(result))}
          </div>
        `);
      }
    }
    
    return html`${resultBlocks}`;
  }

  private _getRelevantAnswerIds(step: Step): string[] {
    if (step.type === 'address-input' && step.triggersAnswers) {
      return step.triggersAnswers;
    } else if (step.questions) {
      return step.questions.map(q => q.answerId);
    }
    return [];
  }

  private _renderResult(result: Result): TemplateResult {
    const alertType = result.type === 'error' ? 'error' : result.type === 'warning' ? 'warning' : 'success';
    const icon = result.type === 'error' ? 'alert-triangle' : result.type === 'warning' ? 'alert-circle' : 'check-circle';
    
    return html`
      <div class="alert-spacer">
        <vl-alert type="${alertType}" icon="${icon}" ?naked=${!result.important}>
          <span slot="title">${result.title}</span>
          <p>${unsafeHTML(result.description)}</p>
          ${result.button ? html`
            <div slot="actions">
              <vl-button secondary @click=${() => window.open(result.button!.link, '_blank')}>${result.button.caption}</vl-button>
            </div>
          ` : ''}
        </vl-alert>
      </div>
    `;
  }

  // Event handlers
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
    }, 300);
  }

  private _selectSuggestion(suggestion: any) {
    this.address = suggestion.display_name;
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    this.coordinates = [lon, lat];
    this.showSuggestions = false;
    this.suggestions = [];
  }

  private _handleAnswer(answerId: string, value: string) {
    // Parse boolean values from string
    let parsedValue: string | boolean = value;
    if (value === 'true') parsedValue = true;
    if (value === 'false') parsedValue = false;
    
    this.answers = { ...this.answers, [answerId]: parsedValue };
  }

  private async _handlePolygonDrawn(eventOrFeature: any) {
    // Handle both CustomEvent (from standard Flux components) and direct feature callback (from vl-map-draw-action)
    let feature = eventOrFeature;
    if (eventOrFeature instanceof CustomEvent) {
      feature = eventOrFeature.detail?.feature;
    }

    if (feature) {
      this.drawnPolygon = feature;
      // Get geometry for potential WFS queries
      const geometry = feature.getGeometry();
      if (geometry) {
        // Store coordinates for address/location info
        const extent = geometry.getExtent();
        const centerX = (extent[0] + extent[2]) / 2;
        const centerY = (extent[1] + extent[3]) / 2;
        this.coordinates = [centerX, centerY];
        this.address = `Locatie: ${centerX.toFixed(2)}, ${centerY.toFixed(2)}`;
        
        // Automatically run checks and show results
        const addressStep = this.config?.steps.find(s => s.type === 'address-input');
        if (addressStep) {
          await this._confirmAddressStep(addressStep);
        }
        
        // Resolve address using Geolocation API
        try {
          this.address = `Locatie bepalen...`;
          const response = await fetch(`https://geo.api.vlaanderen.be/geolocation/v4/Location?xy=${centerX},${centerY}`);
          const data = await response.json();
          
          if (data && data.LocationResult && data.LocationResult.length > 0) {
            this.address = data.LocationResult[0].FormattedAddress;
          } else {
            this.address = `Locatie: ${centerX.toFixed(2)}, ${centerY.toFixed(2)}`;
          }
        } catch (e) {
          console.error('Error fetching location address:', e);
          this.address = `Locatie: ${centerX.toFixed(2)}, ${centerY.toFixed(2)}`;
        }
      }
    }
  }

  private async _confirmAddressStep(step: Step) {
    // Perform address checks and set computed answers
    await this._performAddressChecks(step);
    this.confirmedSteps = new Set([...this.confirmedSteps, step.id]);
  }

  private _confirmQuestionStep(step: Step) {
    this.confirmedSteps = new Set([...this.confirmedSteps, step.id]);
  }

  private async _performAddressChecks(step: Step) {
    if (!this.config || !this.drawnPolygon) return;
    
    // Get WKT from polygon for spatial query
    const wkt = this._extractWkt(this.drawnPolygon);
    
    console.log('Using WKT for WFS:', wkt);

    // Filter computed answers that are triggered by this step
    const computedAnswers = this.config.answers.filter(a => 
      a.type === 'computed' && 
      step.triggersAnswers?.includes(a.id)
    );

    // Process checks in parallel
    const updates = await Promise.all(computedAnswers.map(async (answer) => {
      try {
        if (!answer.source || answer.source.type !== 'wfs') return { id: answer.id, value: false };
        
        // Use user-provided override URL and layer for now
        // "Voorlopig kan je voor elk van de checks deze WFS gebruiken: ...layers=ps:ps_hbtrl"
        const wfsUrl = 'https://www.mercator.vlaanderen.be/raadpleegdienstenmercatorpubliek/ows';
        const typeName = 'ps:ps_hbtrl'; // Using the layer specified by user
        const buffer = answer.source.buffer || 0;
        
        const hasOverlap = await this._checkWfsOverlap(wfsUrl, typeName, wkt, buffer);
        console.log(`Check ${answer.id} (buffer: ${buffer}m): ${hasOverlap}`);
        
        return { id: answer.id, value: hasOverlap };
      } catch (e) {
        console.error(`Error checking ${answer.id}:`, e);
        return { id: answer.id, value: false };
      }
    }));

    // Update state
    const newAnswers = { ...this.answers };
    updates.forEach(u => newAnswers[u.id] = u.value);
    this.answers = newAnswers;
  }

  private async _checkWfsOverlap(url: string, typeName: string, wkt: string, buffer: number = 0): Promise<boolean> {
    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0', // Switch back to 2.0.0 as it aligns better with modern defaults and JSON
      request: 'GetFeature',
      typeNames: typeName,
      outputFormat: 'application/json',
      count: '1'
    });

    // Construct CQL filter
    // Error received: Illegal property name: SHAPE
    // Trying 'geom' which is common for OGC/PostGIS services.
    const geomCol = 'geom'; 
    
    let cqlFilter = '';
    
    if (buffer > 0) {
      cqlFilter = `DWITHIN(${geomCol}, ${wkt}, ${buffer}, meters)`;
    } else {
      cqlFilter = `INTERSECTS(${geomCol}, ${wkt})`;
    }
    
    params.append('cql_filter', cqlFilter);

    try {
      const fullUrl = `${url}?${params.toString()}`;
      console.log('Fetching WFS:', fullUrl);
      
      const response = await fetch(fullUrl);
      const text = await response.text();
      
      if (!response.ok) {
        throw new Error(`WFS Error ${response.status}: ${text}`);
      }
      
      // Check if response is XML (ServiceException)
      if (text.trim().startsWith('<')) {
        console.error('WFS returned XML instead of JSON. Likely an error:', text);
        // Try to extract exception text for clearer logging
        return false;
      }
      
      const data = JSON.parse(text);
      return (data.numberMatched > 0 || (data.features && data.features.length > 0));
    } catch (e) {
      console.error('WFS check failed:', e);
      return false;
    }
  }

  private _extractWkt(feature: any): string {
     // Simple WKT writer for Polygon
     if (!feature) return '';
     const geometry = feature.getGeometry();
     if (!geometry) return '';
     
     // Assumes Polygon. coordinates is [ [ [x,y]... ] ] (array of rings)
     const coords = geometry.getCoordinates(); 
     
     const rings = coords.map((ring: any[]) => {
       return '(' + ring.map(c => `${c[0]} ${c[1]}`).join(', ') + ')';
     }).join(', ');
     
     return `POLYGON(${rings})`;
  }

  private _nextStep() {
    this.activeStep++;
  }

  private _prevStep() {
    if (this.activeStep > 1) this.activeStep--;
  }

  private _reset() {
    this.activeStep = 1;
    this.address = '';
    this.coordinates = null;
    this.answers = {};
    this.confirmedSteps = new Set();
  }

  private _setEditMode(isEditing: boolean) {
    this.isEditing = isEditing;
  }

  private _toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  private _requestDeletePolygon() {
    this.showDeleteModal = true;
  }

  private _cancelDeletePolygon() {
    this.showDeleteModal = false;
  }

  private _confirmDeletePolygon() {
    this.drawnPolygon = null;
    this.coordinates = null;
    this.address = '';
    
    // Clear the map layer (accessing layer directly via querySelector)
    this._clearPolygonFromLayer();
    
    this.showDeleteModal = false;
    this.isEditing = false;
  }
  
  private _clearPolygonFromLayer() {
     const featuresLayer = this.shadowRoot?.querySelector('vl-map-features-layer[name="polygon-layer"]') as any;
     if (featuresLayer && featuresLayer.layer) {
       featuresLayer.layer.getSource().clear();
     }
  }
}
