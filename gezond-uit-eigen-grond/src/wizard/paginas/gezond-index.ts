import '../../common/config/app.config';
import { defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { LitElement, TemplateResult, html, css } from 'lit';
import { GezondWizard } from '../componenten/gezond-wizard';
import '../../common/componenten/gezond-template';

registerWebComponents([GezondWizard]);

export class GezondIndex extends LitElement {
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

  protected render(): TemplateResult {
    return html`
      <gezond-template>
        <div class="container">
            <div class="intro-text">
                <vl-title type="h1">Is mijn bodem goed voor kippen of een moestuin?</vl-title>
                <p>Kan je in je tuin gezond groenten kweken en kippen houden? Je bodem speelt hierin een belangrijke rol. Aan de hand van 3 factoren geven we je een eerste antwoord, en enkele concrete adviezen in geval van problemen.</p>
            </div>
            <gezond-wizard></gezond-wizard>
        </div>
      </gezond-template>
    `;
  }
}

defineWebComponent(GezondIndex, 'gezond-index');
