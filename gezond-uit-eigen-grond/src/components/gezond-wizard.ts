
import { registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlTitleComponent } from '@domg-wc/components/atom';
import { VlWizard, VlWizardPane } from '@domg-wc/components/block/wizard';
import { VlAlert } from '@domg-wc/components/block/alert';
import { VlFormLabelComponent, VlInputFieldComponent } from '@domg-wc/components/form';
import { VlRadioComponent, VlRadioGroupComponent } from '@domg-wc/components/form/radio-group';
import { VlMap, VlMapBaseLayerGRBGray, VlMapFeaturesLayer, VlMapLayerCircleStyle } from '@domg-wc/map';
import { vlContentBlockStyles, vlGridStyles, vlGroupStyles } from '@domg-wc/styles';
import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { WizardConfig, Step, Question, Result, CheckResults, WizardAnswers } from '../models/wizard-config';

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
  // Config
  @state() private config: WizardConfig | null = null;
  
  // Wizard state
  @state() private activeStep: number = 1;
  @state() private address: string = '';
  @state() private coordinates: [number, number] | null = null;
  @state() private suggestions: any[] = [];
  @state() private showSuggestions: boolean = false;
  
  // Check results from address lookup
  @state() private checkResults: CheckResults = {};
  
  // Answers per question
  @state() private answers: WizardAnswers = {};
  
  // Confirmed steps (for showing results)
  @state() private confirmedSteps: Set<string> = new Set();
  
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
        
        .check-list {
            margin-top: 1rem;
            padding-left: 1.5rem;
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
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
        
        .question-block {
            margin-bottom: 1.5rem;
        }
        
        .question-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
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
    } catch (e) {
      console.error('Failed to load wizard config:', e);
    }
  }

  render() {
    if (!this.config) {
      return html`<p>Loading...</p>`;
    }

    const stepNames = this.config.steps.map(s => s.name);

    return html`
      <vl-wizard .activeStep=${this.activeStep} numeric>
        ${this.config.steps.map((step, index) => this._renderStep(step, index))}
      </vl-wizard>
      
      <!-- Results section - always visible -->
      <div class="results-section">
          ${this._renderAllResults()}
          
          <!-- Algemeen advies - always visible -->
          <div class="advice-section">
              <vl-title type="h3">${this.config.general.advice.title}</vl-title>
              <p>${this.config.general.advice.intro}</p>
              <ul>
                  ${this.config.general.advice.items.map(item => html`<li>${item}</li>`)}
              </ul>
          </div>
      </div>
    `;
  }

  private _renderStep(step: Step, index: number): TemplateResult {
    if (step.type === 'address-input') {
      return this._renderAddressStep(step, index);
    } else {
      return this._renderQuestionStep(step, index);
    }
  }

  private _renderAddressStep(step: Step, index: number): TemplateResult {
    const isConfirmed = this.confirmedSteps.has(step.id);
    
    return html`
      <vl-wizard-pane name="${step.name}">
        <vl-title type="h2">${step.title}</vl-title>
        <p>${step.description}</p>
        
        <div class="vl-grid">
            <div class="vl-col--6-12">
                <div class="address-input-wrapper">
                    <vl-form-label for="address">Adres</vl-form-label>
                    <vl-input-field
                        id="address"
                        .value=${this.address}
                        @input=${this._handleAddressInput}
                        placeholder="Zoek je adres..."
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
                    <vl-button @click=${() => this._confirmStep(step)} ?disabled=${!this.coordinates}>Adres opzoeken</vl-button>
                </div>
            </div>
        </div>
        
        <div class="vl-action-group" style="margin-top: 1rem;">
            ${step.navigation.back ? html`
                <vl-button secondary @click=${this._prevStep}>${step.navigation.back.label}</vl-button>
            ` : html`
                <vl-button secondary disabled>Terug</vl-button>
            `}
            <vl-button @click=${this._nextStep} ?disabled=${!isConfirmed}>${step.navigation.next.label}</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderQuestionStep(step: Step, index: number): TemplateResult {
    const isConfirmed = this.confirmedSteps.has(step.id);
    const allQuestionsAnswered = step.questions?.every(q => this.answers[q.id]) ?? false;
    
    return html`
      <vl-wizard-pane name="${step.name}">
        <vl-title type="h2">${step.title}</vl-title>
        <p>${step.description}</p>
        ${step.helpLink ? html`<p><a href="${step.helpLink.url}">${step.helpLink.label}</a></p>` : ''}
        
        ${step.questions?.map(question => this._renderQuestion(question))}
        
        <div class="button-spacer">
            <vl-button @click=${() => this._confirmStep(step)} ?disabled=${!allQuestionsAnswered}>Toon aanbeveling</vl-button>
        </div>
        
        <div class="vl-action-group" style="margin-top: 1.5rem;">
            ${step.navigation.back ? html`
                <vl-button secondary @click=${this._prevStep}>${step.navigation.back.label}</vl-button>
            ` : ''}
            <vl-button @click=${this._nextStep} ?disabled=${!isConfirmed}>${step.navigation.next.label}</vl-button>
        </div>
      </vl-wizard-pane>
    `;
  }

  private _renderQuestion(question: Question): TemplateResult {
    return html`
      <div class="question-block">
        ${question.title ? html`<p class="question-title">${question.title}</p>` : ''}
        ${question.description ? html`<p class="question-description">${question.description}</p>` : ''}
        
        <div class="radio-group-vertical">
          <vl-radio-group 
            .value=${this.answers[question.id] || ''} 
            @vl-input=${(e: any) => this._handleAnswer(question.id, e.target.value)}
          >
            ${question.options.map(option => html`
              <vl-radio value="${option.value}">${option.label}</vl-radio>
            `)}
          </vl-radio-group>
        </div>
      </div>
    `;
  }

  private _renderAllResults(): TemplateResult {
    const results: TemplateResult[] = [];
    
    // Render in reverse order (newest on top)
    const reversedSteps = [...this.config!.steps].reverse();
    
    for (const step of reversedSteps) {
      if (!this.confirmedSteps.has(step.id)) continue;
      
      if (step.type === 'address-input') {
        results.push(this._renderAddressResults(step));
      } else if (step.questions) {
        results.push(this._renderQuestionResults(step));
      }
    }
    
    return html`${results}`;
  }

  private _renderAddressResults(step: Step): TemplateResult {
    if (!step.triggersChecks) return html``;
    
    const alerts: TemplateResult[] = [];
    
    // Find address checks in config
    for (const checkId of step.triggersChecks) {
      const checkConfig = this.config!.addressChecks.find(c => c.id === checkId);
      if (!checkConfig) continue;
      
      const checkValue = this.checkResults[checkId] ?? false;
      const result = checkValue ? checkConfig.results.true : checkConfig.results.false;
      
      alerts.push(this._renderResult(result));
    }
    
    return html`
      <div class="step-results">
        <vl-title type="h3">${step.resultsTitle}</vl-title>
        <p class="address-subtitle">${this.address}</p>
        ${alerts}
      </div>
    `;
  }

  private _renderQuestionResults(step: Step): TemplateResult {
    if (!step.questions) return html``;
    
    const alerts: TemplateResult[] = [];
    
    for (const question of step.questions) {
      const answer = this.answers[question.id];
      if (!answer) continue;
      
      const option = question.options.find(o => o.value === answer);
      if (!option) continue;
      
      alerts.push(this._renderResult(option.result));
    }
    
    return html`
      <div class="step-results">
        <vl-title type="h3">${step.resultsTitle}</vl-title>
        ${alerts}
      </div>
    `;
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

  private _handleAnswer(questionId: string, value: string) {
    this.answers = { ...this.answers, [questionId]: value };
  }

  private async _confirmStep(step: Step) {
    if (step.type === 'address-input') {
      // Simulate address checks (in real app, call APIs)
      await this._performAddressChecks(step);
    }
    
    this.confirmedSteps = new Set([...this.confirmedSteps, step.id]);
  }

  private async _performAddressChecks(step: Step) {
    // Load mock results (in real app, call actual GIS services)
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
      // Default to all false if config not found
      this.checkResults = {
        contamination: false,
        waterloop: false,
        busyRoad: false,
        pfasFireStation: false,
        industrial: false
      };
    }
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
    this.checkResults = {};
    this.answers = {};
    this.confirmedSteps = new Set();
  }
}
