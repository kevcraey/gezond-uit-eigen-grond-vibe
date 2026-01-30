import { registerWebComponents, BaseLitElement, defineWebComponent } from '@domg-wc/common';
import { spatialService } from '../services/spatial.service';
import { VlButtonComponent } from '@domg-wc/components/atom';
import {
  VlMap,
  VlMapBaseLayerGRBGray,
  VlMapFeaturesLayer,
  VlMapLayerCircleStyle,
  VlMapSearch,
  VlMapDrawPointAction,
  VlMapDrawPolygonAction,
  VlMapLayerStyle,
  VlMapModifyAction
} from '@domg-wc/map';
import { VlModalComponent } from '@domg-wc/components/block/modal';
import { TemplateResult, css, html } from 'lit';
import { state, property, query } from 'lit/decorators.js';

registerWebComponents([
  VlButtonComponent,
  VlMap,
  VlMapBaseLayerGRBGray,
  VlMapFeaturesLayer,
  VlMapLayerCircleStyle,
  VlMapSearch,
  VlMapDrawPointAction,
  VlMapDrawPolygonAction,
  VlMapLayerStyle,
  VlMapModifyAction,
  VlModalComponent
]);

export interface LocationChangedEvent {
  coordinates: [number, number] | null;
  address: string | null;
  postcode: string | null;
  wkt: string | null;
}

/**
 * Shared map input component for location selection.
 * Supports both point and polygon drawing modes.
 * Emits 'location-changed' event with coordinates, address, postcode, and WKT.
 */
export class GezondKaartInvoer extends BaseLitElement {
  /** Drawing mode: 'point' for simple location, 'polygon' for area selection */
  @property({ type: String }) mode: 'point' | 'polygon' = 'point';

  /** Label for the drawn feature instruction */
  @property({ type: String }) instructie: string = 'Klik op de kaart om een locatie te selecteren.';

  @state() private drawnFeature: any = null;
  @state() private address: string | null = null;
  @state() private postcode: string | null = null;
  @state() private coordinates: [number, number] | null = null;
  @state() private showDeleteModal: boolean = false;
  @state() private isEditing: boolean = false;

  @query('vl-map') private mapElement: any;

  static get styles() {
    return [
      css`
        :host {
          display: block;
        }
        .map-container {
          position: relative;
          height: 400px;
          width: 100%;
          margin-bottom: 1rem;
        }
        .map-container vl-map {
          height: 100%;
          width: 100%;
        }
        .map-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10;
          display: flex;
          gap: 10px;
        }
        .location-info {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .location-info p {
          margin: 0.25rem 0;
        }
        .status-message {
          color: #666;
          font-style: italic;
        }
        .status-success {
          color: #3c763d;
        }
      `
    ];
  }

  async firstUpdated() {
    await this.updateComplete;
    this._bindDrawAction();
  }

  private _bindDrawAction() {
    if (this.mode === 'polygon') {
      const drawAction = this.shadowRoot?.querySelector('#draw-polygon-action') as any;
      if (drawAction) {
        drawAction.onDraw(this._handleFeatureDrawn.bind(this));
      }
      const modifyAction = this.shadowRoot?.querySelector('#modify-action') as any;
      if (modifyAction) {
        modifyAction.onModify(this._handleFeatureModified.bind(this));
      }
    } else {
      const drawAction = this.shadowRoot?.querySelector('#draw-point-action') as any;
      if (drawAction) {
        drawAction.onDraw(this._handleFeatureDrawn.bind(this));
      }
    }
  }

  protected render(): TemplateResult {
    const hasFeature = this.drawnFeature !== null;

    return html`
      <div class="map-container">
        <vl-map>
          <vl-map-baselayer-grb-gray></vl-map-baselayer-grb-gray>
          <vl-map-search></vl-map-search>

          ${this.mode === 'polygon' ? html`
            <div class="map-controls">
              <vl-button
                icon="pencil"
                @click=${this._toggleEditMode}
                ?disabled=${!hasFeature || this.showDeleteModal}>
                ${this.isEditing ? 'Klaar' : 'Aanpassen'}
              </vl-button>
              <vl-button
                error
                icon="trash"
                @click=${this._requestDelete}
                ?disabled=${!hasFeature || this.isEditing}>
                Verwijder
              </vl-button>
            </div>
          ` : hasFeature ? html`
            <div class="map-controls">
              <vl-button
                error
                icon="trash"
                @click=${this._confirmDelete}>
                Verwijder
              </vl-button>
            </div>
          ` : ''}

          <vl-map-features-layer name="feature-layer">
            <vl-map-layer-style
              border-color="rgba(0, 85, 204, 1)"
              border-size="2"
              color="rgba(0, 85, 204, 0.3)">
            </vl-map-layer-style>
            ${this.mode === 'polygon' ? html`
              <vl-map-draw-polygon-action
                id="draw-polygon-action"
                .active=${!this.isEditing && !hasFeature}>
              </vl-map-draw-polygon-action>
              <vl-map-modify-action
                id="modify-action"
                .active=${this.isEditing}>
              </vl-map-modify-action>
            ` : html`
              <vl-map-draw-point-action
                id="draw-point-action"
                .active=${!hasFeature}>
              </vl-map-draw-point-action>
            `}
            ${this.mode === 'point' && hasFeature ? html`
              <vl-map-layer-circle-style
                color="rgba(0, 85, 204, 1)"
                size="8"
                border-color="rgba(255, 255, 255, 1)"
                border-size="2">
              </vl-map-layer-circle-style>
            ` : ''}
          </vl-map-features-layer>
        </vl-map>
      </div>

      ${this.mode === 'polygon' ? html`
        <vl-modal
          id="delete-modal"
          title="Bent u zeker?"
          ?open=${this.showDeleteModal}
          @close=${this._cancelDelete}
          not-cancellable
        >
          <p slot="content">De getekende vorm zal verwijderd worden.</p>
          <div slot="button">
            <vl-button secondary @click=${this._cancelDelete}>Annuleer</vl-button>
            <vl-button @click=${this._confirmDelete}>OK</vl-button>
          </div>
        </vl-modal>
      ` : ''}

      <div class="location-info">
        ${hasFeature ? html`
          <p class="status-success">✓ Locatie geselecteerd</p>
          ${this.address ? html`<p><strong>Adres:</strong> ${this.address}</p>` : ''}
          ${this.postcode ? html`<p><strong>Postcode:</strong> ${this.postcode}</p>` : ''}
        ` : html`
          <p class="status-message">${this.instructie}</p>
        `}
      </div>
    `;
  }

  private async _handleFeatureDrawn(eventOrFeature: any) {
    let feature = eventOrFeature;
    if (eventOrFeature instanceof CustomEvent) {
      feature = eventOrFeature.detail?.feature;
    }

    if (feature) {
      this.drawnFeature = feature;
      await this._processFeature(feature);
    }
  }

  private async _handleFeatureModified(_e: any) {
    if (this.drawnFeature) {
      await this._processFeature(this.drawnFeature);
    }
  }

  private async _processFeature(feature: any) {
    const geometry = feature.getGeometry();
    if (!geometry) return;

    let centerX: number, centerY: number;

    if (this.mode === 'point') {
      const coords = geometry.getCoordinates();
      centerX = coords[0];
      centerY = coords[1];
    } else {
      const extent = geometry.getExtent();
      centerX = (extent[0] + extent[2]) / 2;
      centerY = (extent[1] + extent[3]) / 2;
    }

    this.coordinates = [centerX, centerY];

    // Get address and postcode in one call
    try {
      const locationInfo = await spatialService.getLocationInfo(centerX, centerY);
      this.address = locationInfo.address;
      this.postcode = locationInfo.postcode;
    } catch (e) {
      console.error('Error fetching location info:', e);
      this.address = `${centerX.toFixed(2)}, ${centerY.toFixed(2)}`;
      this.postcode = null;
    }

    this._emitLocationChanged();
  }

  private _emitLocationChanged() {
    const wkt = this.drawnFeature ? this._extractWkt(this.drawnFeature) : null;

    const event = new CustomEvent<LocationChangedEvent>('location-changed', {
      detail: {
        coordinates: this.coordinates,
        address: this.address,
        postcode: this.postcode,
        wkt
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  private _extractWkt(feature: any): string {
    if (!feature) return '';
    const geometry = feature.getGeometry();
    if (!geometry) return '';

    if (this.mode === 'point') {
      const coords = geometry.getCoordinates();
      return `POINT(${coords[0]} ${coords[1]})`;
    }

    // Polygon
    const coords = geometry.getCoordinates();
    const rings = coords.map((ring: any[]) => {
      return '(' + ring.map(c => `${c[0]} ${c[1]}`).join(', ') + ')';
    }).join(', ');
    return `POLYGON(${rings})`;
  }

  private _toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  private _requestDelete() {
    this.showDeleteModal = true;
  }

  private _cancelDelete() {
    this.showDeleteModal = false;
  }

  private _confirmDelete() {
    this.drawnFeature = null;
    this.coordinates = null;
    this.address = null;
    this.postcode = null;

    // Clear the map layer
    const featuresLayer = this.shadowRoot?.querySelector('vl-map-features-layer[name="feature-layer"]') as any;
    if (featuresLayer && featuresLayer.layer) {
      featuresLayer.layer.getSource().clear();
    }

    this.showDeleteModal = false;
    this.isEditing = false;

    this._emitLocationChanged();
  }

  /** Programmatically reset the component */
  public reset() {
    this._confirmDelete();
  }

  /** Get current location info */
  public getLocationInfo(): LocationChangedEvent {
    return {
      coordinates: this.coordinates,
      address: this.address,
      postcode: this.postcode,
      wkt: this.drawnFeature ? this._extractWkt(this.drawnFeature) : null
    };
  }
}

defineWebComponent(GezondKaartInvoer, 'gezond-kaart-invoer');
