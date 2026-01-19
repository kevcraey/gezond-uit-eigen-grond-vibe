
import { registerWebComponents, BaseLitElement, defineWebComponent } from '@domg-wc/common';
import { spatialService } from '../../common/services/spatial.service';
import { wizardStyles } from './gezond-wizard.css';
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
import { vlContentBlockStyles, vlGridStyles, vlGroupStyles, vlStackedStyles } from '@domg-wc/styles';
import { TemplateResult, css, html, nothing } from 'lit';
import { state, query } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { 
  WizardConfig, 
  Step, 
  StepQuestion, 
  Result, 
  AnswerState, 
  evaluateRules,
  getRulesForAnswers,
  WfsSourceConfig
} from '../../common/domein/wizard-config';

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


export class GezondWizard extends BaseLitElement {
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
      vlStackedStyles,
      wizardStyles
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

      // Bind modify action callback
      const modifyAction = this.shadowRoot?.querySelector('#modify-polygon-action') as any;
      if (modifyAction) {
          modifyAction.onModify(this._handlePolygonModified.bind(this));
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
        
        <div class="vl-action-group vl-u-spacer-top--large">
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
                .active=${this.isEditing}
                @vl-modify=${this._handlePolygonModified}>
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
        
        <div class="vl-grid vl-grid--align-center">
          ${this._renderAllStepsResults()}
        </div>
        
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
      <div class="vl-u-spacer-bottom--large">
        ${question.title ? html`<vl-title type="h4" class="vl-u-spacer-bottom--small">${question.title}</vl-title>` : ''}
        ${question.description ? html`<p class="vl-u-spacer-bottom--small" style="color: #666;">${question.description}</p>` : ''}
        
        <vl-radio-group block>
          ${question.options.map(option => html`
            <vl-radio 
              value="${option.value}"
              .checked=${this.answers[question.answerId] === option.value}
              @vl-change=${(e: CustomEvent) => this._handleAnswer(question.answerId, e.detail.value)}
            >${option.label}</vl-radio>
          `)}
        </vl-radio-group>
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
          <div class="vl-column vl-column--12 vl-u-spacer-bottom--large">
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
    const isNaked = !result.important;
    
    // Naked alerts: compact styling without background
    if (isNaked) {
      return html`
        <div class="vl-u-spacer-bottom--small">
          <vl-alert 
            type="${alertType}" 
            icon="${icon}" 
            naked
          >
            ${result.title ? html`<span slot="title">${result.title}</span>` : nothing}
            <p>${unsafeHTML(result.description)}</p>
          </vl-alert>
        </div>
      `;
    }
    
    // Important alerts: full styling with background and potential action buttons
    return html`
      <div class="vl-u-spacer-bottom--small">
        <vl-alert type="${alertType}" icon="${icon}">
          ${result.title ? html`<span slot="title">${result.title}</span>` : nothing}
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

  private _handlePolygonDrawn(eventOrFeature: any) {
    // Handle both CustomEvent (from standard Flux components) and direct feature callback (from vl-map-draw-action)
    let feature = eventOrFeature;
    if (eventOrFeature instanceof CustomEvent) {
      feature = eventOrFeature.detail?.feature;
    }

    if (feature) {
      this.drawnPolygon = feature;
      this._processPolygonFeature(feature);
    }
  }

  private _handlePolygonModified(e: any) {
      console.log('Polygon modified event:', e);
      // For modify, the feature is usually already this.drawnPolygon, but we should verify.
      // The event usually contains features.
      const features = e.detail?.features || e.features; 
      // If we have features, use the first one (assuming single polygon mode)
      // Or just use this.drawnPolygon if it's the one being modified.
      if (this.drawnPolygon) {
          console.log('Processing modified polygon...');
          this._processPolygonFeature(this.drawnPolygon);
      }
  }

  private async _processPolygonFeature(feature: any) {
      // Get geometry for potential WFS queries
      const geometry = feature.getGeometry();
      if (geometry) {
        // Store coordinates for address/location info
        const extent = geometry.getExtent();
        const centerX = (extent[0] + extent[2]) / 2;
        const centerY = (extent[1] + extent[3]) / 2;
        this.coordinates = [centerX, centerY];

        // Automatically run checks and show results
        const addressStep = this.config?.steps.find(s => s.type === 'address-input');
        if (addressStep) {
          await this._confirmAddressStep(addressStep);
        }
        
        // Resolve address using SpatialService
        try {
          this.address = `Locatie bepalen...`;
          const address = await spatialService.reverseGeocode(centerX, centerY);
          
          if (address) {
            this.address = address;
          } else {
            this.address = `Locatie: ${centerX.toFixed(2)}, ${centerY.toFixed(2)}`;
          }
        } catch (e) {
          console.error('Error in address resolution:', e);
          this.address = `Locatie: ${centerX.toFixed(2)}, ${centerY.toFixed(2)}`;
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
        
        // Use WFS config from the answer definition
        // Delegate to SpatialService
        const config = {
            url: answer.source.url,
            layer: answer.source.layer || 'ps:ps_hbtrl', // Fallback defaults handled in logic or here
            buffer: answer.source.buffer || 0,
            type: 'wfs'
        } as WfsSourceConfig;
        
        const hasOverlap = await spatialService.checkWfsOverlap(config, wkt);
        console.log(`Check ${answer.id} (layer: ${config.layer}, buffer: ${config.buffer}m): ${hasOverlap}`);
        
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
    // Confirm the current step before advancing so results appear on overview
    if (this.config) {
      const currentStep = this.config.steps[this.activeStep - 1]; // activeStep is 1-indexed
      if (currentStep && currentStep.type === 'question') {
        this._confirmQuestionStep(currentStep);
      }
    }
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
    
    // Clear computed answers associated with address step checks
    this._clearComputedAnswers();

    // Clear the map layer (accessing layer directly via querySelector)
    this._clearPolygonFromLayer();
    
    this.showDeleteModal = false;
    this.isEditing = false;
  }

  private _clearComputedAnswers() {
      if (!this.config) return;
      const addressStep = this.config.steps.find(s => s.type === 'address-input');
      if (addressStep && addressStep.triggersAnswers) {
          const newAnswers = { ...this.answers };
          addressStep.triggersAnswers.forEach(id => {
              delete newAnswers[id];
          });
          this.answers = newAnswers;
      }
  }
  
  private _clearPolygonFromLayer() {
     const featuresLayer = this.shadowRoot?.querySelector('vl-map-features-layer[name="polygon-layer"]') as any;
     if (featuresLayer && featuresLayer.layer) {
       featuresLayer.layer.getSource().clear();
     }
  }
}

defineWebComponent(GezondWizard, 'gezond-wizard');
