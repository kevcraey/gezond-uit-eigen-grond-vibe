import WEB_APP_CONTROLLER from '../controllers/web-app-controller';
import { Configuratie } from '../domein/config/configuratie';
import { registerWebComponents, BaseLitElement, defineWebComponent } from '@domg-wc/common';
import {
  VlTemplate,
  VlToasterComponent,
  VlFunctionalHeaderComponent,
  VlBreadcrumbComponent,
  VlBreadcrumbItemComponent
} from '@domg-wc/components/block';
import { VlCookieConsent, VlFooter, VlHeader } from '@domg-wc/components/compliance';
import { VlIconComponent } from '@domg-wc/components/atom';
import { TemplateResult, css, html, nothing } from 'lit';
import { query, state, property } from 'lit/decorators.js';

registerWebComponents([
  VlTemplate,
  VlToasterComponent,
  VlHeader,
  VlFooter,
  VlCookieConsent,
  VlFunctionalHeaderComponent,
  VlBreadcrumbComponent,
  VlBreadcrumbItemComponent,
  VlIconComponent
]);

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

export class GezondTemplate extends BaseLitElement {
  @state()
  private headerUuid?: string;
  @state()
  private footerUuid?: string;
  @state()
  private developmentMode = false;

  @property({ type: String })
  public title = 'Gezond uit eigen grond';

  @property({ type: String })
  public subTitle = '';

  @property({ type: Array })
  public breadcrumbs: BreadcrumbItem[] = [];

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
        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: #0055CC;
          color: white;
          padding: 8px 16px;
          text-decoration: none;
          z-index: 100;
          border-radius: 0 0 4px 0;
        }
        .skip-link:focus {
          top: 0;
        }

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

        header,
        main,
        footer {
          display: block;
        }

        main {
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

  private renderFunctionalHeader() {
      return html`
          <vl-functional-header
              slot="header"
              title="${this.title}"
              sub-title="${this.subTitle}"
              link="/"
              back-link="/"
          >
           ${this.renderBreadcrumbs()}
          </vl-functional-header>
      `;
  }

  private renderBreadcrumbs(): TemplateResult | typeof nothing {
      if (!this.breadcrumbs || this.breadcrumbs.length === 0) {
          return nothing;
      }
      return html`
          <nav aria-label="Broodkruimelnavigatie" slot="sub-header">
              <vl-breadcrumb>
                  ${this.breadcrumbs.map(item => html`
                      <vl-breadcrumb-item href="${item.href || nothing}">${item.title}</vl-breadcrumb-item>
                  `)}
              </vl-breadcrumb>
          </nav>
      `;
  }

  protected render(): TemplateResult {
    return html`
      <a href="#main" class="skip-link">Spring naar hoofdinhoud</a>
      ${this.renderToaster()}
      <vl-template>
        <header role="banner">
          ${this.renderHeader()}
          ${this.renderFunctionalHeader()}
        </header>
        <main role="main" id="main" tabindex="-1">
          <slot></slot>
        </main>
        <footer role="contentinfo">
          ${this.renderFooter()}
        </footer>
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

defineWebComponent(GezondTemplate, 'gezond-template');
