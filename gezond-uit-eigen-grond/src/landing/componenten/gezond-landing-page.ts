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
      description: 'Je hebt labo-resultaten voor dioxines en PCB\'s? Vul de gemeten waarden in en ontdek hoeveel eieren van je eigen kippen uit je tuin je veilig kan eten.',
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
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }
        @media (max-width: 1024px) {
          .tiles-grid {
            grid-template-columns: 1fr;
          }
        }
        .tile-wrapper {
          display: flex;
          height: 100%;
        }
        vl-info-tile {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
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

      <div class="tiles-grid" role="list">
        ${this.tiles.map(tile => this._renderTile(tile))}
      </div>
    `;
  }

  private _renderTile(tile: TileConfig): TemplateResult {
    return html`
      <div class="tile-wrapper" role="listitem">
        <vl-info-tile>
          <span slot="title">
            <span class="visually-hidden">Optie ${this.tiles.indexOf(tile) + 1}: </span>
            ${tile.title}
          </span>
          <span slot="content">${tile.description}</span>
          <div slot="footer">
            <vl-button
              @click=${() => this._navigateTo(tile.route)}
              aria-label="${tile.buttonLabel} voor ${tile.title}">
              ${tile.buttonLabel}
            </vl-button>
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
