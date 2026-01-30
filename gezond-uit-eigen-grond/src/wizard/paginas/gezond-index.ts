import '../../common/config/app.config';
import { defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { LitElement, TemplateResult, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { GezondWizard } from '../componenten/gezond-wizard';
import '../../common/componenten/gezond-template';
import '../../landing/componenten/gezond-landing-page';
import '../../groenten/componenten/gezond-groenten-advies';
import '../../eieren/componenten/gezond-eieren-advies';

registerWebComponents([GezondWizard]);

type Route = 'landing' | 'doe-de-test' | 'advies-groenten' | 'advies-eieren';

export class GezondIndex extends LitElement {
  @state() private currentRoute: Route = 'landing';

  static get styles() {
    return [
      css`
        :host {
          display: block;
          min-height: 100vh;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .intro-text {
            margin-bottom: 2rem;
        }
      `
    ];
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.handleHashChange();
    window.addEventListener('hashchange', this.handleHashChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  private handleHashChange = (): void => {
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (hash === 'doe-de-test' || hash === 'advies-groenten' || hash === 'advies-eieren') {
      this.currentRoute = hash;
    } else {
      this.currentRoute = 'landing';
    }
  };

  private renderLanding(): TemplateResult {
    return html`
      <div class="container">
        <gezond-landing-page></gezond-landing-page>
      </div>
    `;
  }

  private renderDoeDeTest(): TemplateResult {
    return html`
      <div class="container">
        <div class="intro-text">
          <vl-title type="h1">Is mijn bodem goed voor kippen of een moestuin?</vl-title>
          <p>Kan je in je tuin gezond groenten kweken en kippen houden? Je bodem speelt hierin een belangrijke rol. Aan de hand van 3 factoren geven we je een eerste antwoord, en enkele concrete adviezen in geval van problemen.</p>
        </div>
        <gezond-wizard></gezond-wizard>
      </div>
    `;
  }

  private renderAdviesGroenten(): TemplateResult {
    return html`
      <div class="container">
        <gezond-groenten-advies></gezond-groenten-advies>
      </div>
    `;
  }

  private renderAdviesEieren(): TemplateResult {
    return html`
      <div class="container">
        <gezond-eieren-advies></gezond-eieren-advies>
      </div>
    `;
  }

  private renderCurrentRoute(): TemplateResult {
    switch (this.currentRoute) {
      case 'doe-de-test':
        return this.renderDoeDeTest();
      case 'advies-groenten':
        return this.renderAdviesGroenten();
      case 'advies-eieren':
        return this.renderAdviesEieren();
      case 'landing':
      default:
        return this.renderLanding();
    }
  }

  protected render(): TemplateResult {
    return html`
      <gezond-template>
        ${this.renderCurrentRoute()}
      </gezond-template>
    `;
  }
}

defineWebComponent(GezondIndex, 'gezond-index');
