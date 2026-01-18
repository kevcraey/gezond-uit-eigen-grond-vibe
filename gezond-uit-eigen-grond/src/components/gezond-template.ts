import WEB_APP_CONTROLLER from '../controllers/web-app-controller';
import { Configuratie } from '../models/config/configuratie';
import { registerWebComponents } from '@domg-wc/common';
import { VlTemplate, VlToasterComponent } from '@domg-wc/components/block';
import { VlCookieConsent, VlFooter, VlHeader } from '@domg-wc/components/compliance';
import { LitElement, TemplateResult, css, html, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';

registerWebComponents([VlTemplate, VlToasterComponent, VlHeader, VlFooter, VlCookieConsent]);

export class GezondTemplate extends LitElement {
  @state()
  private headerUuid?: string;
  @state()
  private footerUuid?: string;
  @state()
  private developmentMode = false;

  @query('vl-toaster')
  private toaster: any;

  constructor() {
    super();
    addEventListener('gezond-alert-fired', (event) => this.showGezondAlert(event as CustomEvent));
  }

  async firstUpdated(): Promise<void> {
    const configuratie: Configuratie = await WEB_APP_CONTROLLER.getConfig();
    this.headerUuid = configuratie.headerUuid;
    this.footerUuid = configuratie.footerUuid;
    this.developmentMode = configuratie.developmentMode;
  }

  static get styles() {
    return [
      css`
        #main {
          margin-top: 3rem;
          margin-bottom: 3rem;
        }

        :host {
          display: block;
          --header-height: 43px;
          --footer-height: 128px;
        }

        vl-template {
          display: block;
        }

        [slot='main'] {
          min-height: calc(90vh - (var(--header-height) + var(--footer-height)));
        }

        .vl-gezond-toaster {
          width: 60vw !important;
          right: 0;
          left: 0;
          margin-left: auto;
          margin-right: auto;
          top: auto !important;
        }
      `,
    ];
  }

  private renderHeader() {
    return this.headerUuid == null
      ? nothing
      : html` <vl-header
          slot="header"
          identifier=${this.headerUuid}
          login-url="/oauth2/authorization/omgeving"
          ?development=${this.developmentMode}
        ></vl-header>`;
  }

  private renderFooter() {
    return this.footerUuid == null
      ? nothing
      : html` <vl-footer slot="footer" identifier=${this.footerUuid} ?development=${this.developmentMode}></vl-footer>`;
  }

  protected render(): TemplateResult {
    return html`
      ${this.renderToaster()}
      <vl-template>
        ${this.renderHeader()}
        <div slot="main" id="main">
          <slot></slot>
        </div>
        ${this.renderFooter()}
      </vl-template>
    `;
  }

  private renderToaster() {
    return html`<vl-toaster class="vl-gezond-toaster" style="z-index: 2000" fade-out="true"></vl-toaster>`;
  }

  private showGezondAlert(event: CustomEvent) {
      this.showToaster(event.detail.alert);
  }

  private showToaster(alert: any) {
      this.toaster?.showAlert(alert);
  }
}

customElements.define('gezond-template', GezondTemplate);
