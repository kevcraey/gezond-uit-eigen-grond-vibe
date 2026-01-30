import { BaseLitElement, defineWebComponent, registerWebComponents } from '@domg-wc/common';
import { VlButtonComponent, VlTitleComponent } from '@domg-wc/components/atom';
import { VlInfoTile } from '@domg-wc/components/block/info-tile';
import { TemplateResult, html, css } from 'lit';

registerWebComponents([VlButtonComponent, VlTitleComponent, VlInfoTile]);

interface TileConfig {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  route: string;
}

export class GezondLandingPage extends BaseLitElement {
  private tiles: TileConfig[] = [
    {
      id: 'doe-de-test',
      title: 'Doe de test',
      description: 'Ontdek of jouw locatie geschikt is voor een moestuin of kippen. We checken risicofactoren zoals PFAS-zones, nabijheid van wegen en spoorlijnen, en gekende verontreinigingen.',
      buttonLabel: 'Start de test',
      route: '#doe-de-test'
    },
    {
      id: 'advies-groenten',
      title: 'Advies groenten',
      description: 'Je hebt labo-resultaten van je bodemstaal? Vul de gemeten waarden voor zware metalen in en ontvang een persoonlijk advies over groenten telen in je tuin.',
      buttonLabel: 'Vraag advies',
      route: '#advies-groenten'
    },
    {
      id: 'advies-eieren',
      title: 'Advies eieren',
      description: 'Je hebt labo-resultaten voor dioxines en PCB\'s? Vul de gemeten waarden in en ontdek hoeveel eieren van je eigen kippen je veilig kan eten.',
      buttonLabel: 'Vraag advies',
      route: '#advies-eieren'
    }
  ];

  static get styles() {
    return [
      css`
        :host {
          display: block;
        }
        .intro {
          margin-bottom: 2rem;
        }
        .intro ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .tiles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .tile-wrapper {
          height: 100%;
        }
        vl-info-tile {
          height: 100%;
        }
      `
    ];
  }

  protected render(): TemplateResult {
    return html`
      <div class="intro">
        <vl-title type="h1">Gezond uit eigen grond</vl-title>
        <p>Wil je weten of je veilig groenten kan kweken of kippen kan houden in je tuin? Kies hieronder wat je wil doen:</p>
        <ul>
          <li><strong>Nog geen labo-resultaten?</strong> Doe eerst de test om te zien of jouw locatie geschikt is.</li>
          <li><strong>Wel labo-resultaten?</strong> Vraag direct advies over groenten of eieren.</li>
        </ul>
      </div>

      <div class="tiles-grid">
        ${this.tiles.map(tile => this._renderTile(tile))}
      </div>
    `;
  }

  private _renderTile(tile: TileConfig): TemplateResult {
    return html`
      <div class="tile-wrapper">
        <vl-info-tile>
          <span slot="title">${tile.title}</span>
          <span slot="content">${tile.description}</span>
          <div slot="footer">
            <vl-button @click=${() => this._navigateTo(tile.route)}>${tile.buttonLabel}</vl-button>
          </div>
        </vl-info-tile>
      </div>
    `;
  }

  private _navigateTo(route: string) {
    window.location.hash = route;
  }
}

defineWebComponent(GezondLandingPage, 'gezond-landing-page');
